import { describe, it, expect } from 'vitest';
import { getRoomStatus, getRoomSchedule, getVacantRoomsForStudy } from '../services/roomAllocationService';
import { getRoutineForBatch, getRoutineCell, searchRoutine } from '../services/routineService';
import { timeToMinutes, formatTime12h, timeDifference, isWorkingDay } from '../utils/timeUtils';
import { ROUTINE_DATA, TEACHER_NAME_MAP } from '../data/routine';
import { ALL_ROOMS, getRoomMetadata, ROOM_METADATA } from '../data/rooms';
import { BATCH_INFO, getBatchName, getBatchLabel } from '../types/routine';
import type { Day } from '../types/routine';

// ==========================================================
// TIME UTILITY TESTS
// ==========================================================
describe('timeToMinutes', () => {
  it('converts 08:00 correctly', () => {
    expect(timeToMinutes('08:00')).toBe(480);
  });

  it('converts 09:45 correctly', () => {
    expect(timeToMinutes('09:45')).toBe(585);
  });

  it('converts 17:30 correctly', () => {
    expect(timeToMinutes('17:30')).toBe(1050);
  });

  it('converts 00:00 correctly', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });
});

describe('formatTime12h', () => {
  it('formats morning time', () => {
    expect(formatTime12h('08:00')).toBe('8:00 AM');
  });

  it('formats afternoon time', () => {
    expect(formatTime12h('14:00')).toBe('2:00 PM');
  });

  it('formats noon', () => {
    expect(formatTime12h('12:00')).toBe('12:00 PM');
  });

  it('formats midnight', () => {
    expect(formatTime12h('00:00')).toBe('12:00 AM');
  });
});

describe('timeDifference', () => {
  it('returns minutes for short durations', () => {
    expect(timeDifference(480, 510)).toBe('30m');
  });

  it('returns hours and minutes', () => {
    expect(timeDifference(480, 585)).toBe('1h 45m');
  });

  it('returns empty for negative durations', () => {
    expect(timeDifference(585, 480)).toBe('');
  });
});

describe('isWorkingDay', () => {
  it('recognizes Saturday as working day', () => {
    expect(isWorkingDay('Saturday')).toBe(true);
  });

  it('recognizes Thursday as non-working day', () => {
    expect(isWorkingDay('Thursday')).toBe(false);
  });

  it('recognizes Friday as non-working day', () => {
    expect(isWorkingDay('Friday')).toBe(false);
  });
});

// ==========================================================
// ROOM ALLOCATION LOGIC TESTS
// ==========================================================
describe('getRoomStatus', () => {
  it('returns available when no classes on the day', () => {
    const status = getRoomStatus('1002', 'Wednesday', 600);
    expect(status.status).toBe('available');
    expect(status.currentClass).toBeNull();
    expect(status.nextClass).toBeNull();
  });

  it('returns available when day is null (Thursday/Friday)', () => {
    const status = getRoomStatus('1002', null, 600);
    expect(status.status).toBe('available');
  });

  it('returns occupied during a class', () => {
    // Room 5002 on Saturday slot 2 (09:45 - 11:30) has PROG 101 for batch 2025-26
    const status = getRoomStatus('5002', 'Saturday', timeToMinutes('10:00'));
    expect(status.status).toBe('occupied');
    expect(status.currentClass).not.toBeNull();
    expect(status.currentClass?.courseCode).toBe('PROG 101');
  });

  it('returns occupied when a class from any batch is running', () => {
    // Room 5002 on Saturday at 08:30 — PROG 301 (2023-24) runs 08:00-09:45
    const status = getRoomStatus('5002', 'Saturday', timeToMinutes('08:30'));
    expect(status.status).toBe('occupied');
    expect(status.currentClass).not.toBeNull();
    expect(status.currentClass?.courseCode).toBe('PROG 301');
  });

  it('returns upcoming before a class starts in an otherwise empty room', () => {
    // Room 2002 on Saturday — first class is CSE 219 at 09:45 (2023-24)
    const status = getRoomStatus('2002', 'Saturday', timeToMinutes('08:00'));
    expect(status.status).toBe('upcoming');
    expect(status.nextClass).not.toBeNull();
  });

  it('returns available after all classes end', () => {
    // Room 5002 Saturday last class ends at 15:45
    const status = getRoomStatus('5002', 'Saturday', timeToMinutes('16:00'));
    expect(status.status).toBe('available');
  });

  it('handles between-class gaps correctly', () => {
    // Room 2002 on Saturday: Slot 3 IRE 103 (11:30-13:15) for 2025-26.
    // Check 13:30 — after 13:15 end, should check if there's a next class
    const status = getRoomStatus('2002', 'Saturday', timeToMinutes('13:30'));
    // After last class for this room this day
    if (status.nextClass) {
      expect(status.status).toBe('upcoming');
    } else {
      expect(status.status).toBe('available');
    }
  });

  it('reports timeUntilFree for occupied rooms', () => {
    const status = getRoomStatus('5002', 'Saturday', timeToMinutes('10:00'));
    expect(status.status).toBe('occupied');
    expect(status.timeUntilFree).toBeTruthy();
  });

  it('reports timeUntilNext for upcoming rooms', () => {
    const status = getRoomStatus('5002', 'Saturday', timeToMinutes('08:00'));
    if (status.status === 'upcoming') {
      expect(status.timeUntilNext).toBeTruthy();
    }
  });
});

describe('getRoomSchedule', () => {
  it('returns sorted entries for a room on a given day', () => {
    const schedule = getRoomSchedule('5002', 'Saturday');
    expect(schedule.length).toBeGreaterThan(0);
    // Verify sorted
    for (let i = 1; i < schedule.length; i++) {
      expect(timeToMinutes(schedule[i].startTime)).toBeGreaterThanOrEqual(
        timeToMinutes(schedule[i - 1].startTime)
      );
    }
  });

  it('returns empty array for non-existent room-day combo', () => {
    const schedule = getRoomSchedule('9999', 'Saturday');
    expect(schedule).toEqual([]);
  });

  it('returns empty for Wednesday (no classes)', () => {
    const schedule = getRoomSchedule('5002', 'Wednesday');
    expect(schedule).toEqual([]);
  });
});

// ==========================================================
// ROUTINE SERVICE TESTS
// ==========================================================
describe('getRoutineForBatch', () => {
  it('returns entries only for the specified batch', () => {
    const entries = getRoutineForBatch('2025-26');
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach((entry) => {
      expect(entry.batch).toBe('2025-26');
    });
  });

  it('returns entries for all batches', () => {
    const batches = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'] as const;
    batches.forEach((batch) => {
      const entries = getRoutineForBatch(batch);
      expect(entries.length).toBeGreaterThan(0);
    });
  });
});

describe('getRoutineCell', () => {
  it('returns correct entries for a specific cell', () => {
    // 2025-26, Saturday, Slot 2 = PROG 101 in Room 5002
    const entries = getRoutineCell('2025-26', 'Saturday', 2);
    expect(entries.length).toBe(1);
    expect(entries[0].courseCode).toBe('PROG 101');
    expect(entries[0].room).toBe('5002');
  });

  it('returns multiple entries for cells with multiple classes', () => {
    // 2025-26, Tuesday, Slot 2 = PROG 102 + IRE 118
    const entries = getRoutineCell('2025-26', 'Tuesday', 2);
    expect(entries.length).toBe(2);
    const courses = entries.map((e) => e.courseCode).sort();
    expect(courses).toContain('PROG 102');
    expect(courses).toContain('IRE 118');
  });

  it('returns empty array for empty cells', () => {
    const entries = getRoutineCell('2025-26', 'Wednesday', 1);
    expect(entries).toEqual([]);
  });
});

describe('searchRoutine', () => {
  it('finds entries by course code', () => {
    const results = searchRoutine('IRE 103');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.courseCode.toLowerCase()).toContain('ire 103');
    });
  });

  it('finds entries by room', () => {
    const results = searchRoutine('5002');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(
        r.room.includes('5002') || r.courseCode.includes('5002') || r.batch.includes('5002')
      ).toBe(true);
    });
  });

  it('finds entries by teacher code', () => {
    const results = searchRoutine('FAA');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.teacherCode.toLowerCase()).toContain('faa');
    });
  });

    it('finds entries by teacher full name', () => {
    const results = searchRoutine('Ashiqussalehin');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.teacherCode).toBe('MAS');
    });

    const results2 = searchRoutine('Sadia Enam');
    expect(results2.length).toBeGreaterThan(0);
    results2.forEach((r) => {
      expect(r.teacherCode).toBe('SE');
    });

    const results3 = searchRoutine('Farzana');
    expect(results3.length).toBeGreaterThan(0);
    results3.forEach((r) => {
      expect(r.teacherCode).toBe('FA');
    });
  });

  it('finds entries by batch name', () => {
    const results4th = searchRoutine('4th batch');
    expect(results4th.length).toBeGreaterThan(0);
    results4th.forEach((r) => {
      expect(r.batch).toBe('2021-22');
    });

    const results5th = searchRoutine('5th batch');
    expect(results5th.length).toBeGreaterThan(0);
    results5th.forEach((r) => {
      expect(r.batch).toBe('2022-23');
    });

    const results8th = searchRoutine('8th batch');
    expect(results8th.length).toBeGreaterThan(0);
    results8th.forEach((r) => {
      expect(r.batch).toBe('2025-26');
    });
  });

  it('is case insensitive', () => {
    const results1 = searchRoutine('ire 103');
    const results2 = searchRoutine('IRE 103');
    expect(results1.length).toBe(results2.length);
  });

  it('returns empty for no match', () => {
    const results = searchRoutine('NONEXISTENT999');
    expect(results).toEqual([]);
  });

  it('returns results for single-char query that matches', () => {
    // The function itself has no minimum length; UI enforces 2-char minimum.
    // 'I' matches many courses starting with IRE...
    const results = searchRoutine('I');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty for empty query', () => {
    const results = searchRoutine('');
    expect(results).toEqual([]);
  });
});

// ==========================================================
// DATA INTEGRITY TESTS
// ==========================================================
describe('Data Integrity', () => {
  it('all entries have required fields', () => {
    ROUTINE_DATA.forEach((entry) => {
      expect(entry.id).toBeTruthy();
      expect(entry.batch).toBeTruthy();
      expect(entry.day).toBeTruthy();
      expect(entry.slotNumber).toBeGreaterThanOrEqual(1);
      expect(entry.slotNumber).toBeLessThanOrEqual(5);
      expect(entry.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(entry.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(entry.courseCode).toBeTruthy();
      expect(entry.room).toBeTruthy();
      // teacherCode can be empty string
      expect(typeof entry.teacherCode).toBe('string');
    });
  });

  it('all entries have valid days', () => {
    const validDays: Day[] = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
    ROUTINE_DATA.forEach((entry) => {
      expect(validDays).toContain(entry.day);
    });
  });

  it('no room has two different classes at the same time on the same day (from different batches)', () => {
    const conflicts: string[] = [];
    for (const day of ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'] as Day[]) {
      for (let slot = 1; slot <= 5; slot++) {
        const entriesInSlot = ROUTINE_DATA.filter(
          (e) => e.day === day && e.slotNumber === slot
        );
        // Group by room
        const byRoom = new Map<string, typeof entriesInSlot>();
        entriesInSlot.forEach((entry) => {
          const existing = byRoom.get(entry.room) ?? [];
          existing.push(entry);
          byRoom.set(entry.room, existing);
        });

        byRoom.forEach((entries, room) => {
          if (entries.length > 1) {
            // Multiple entries in same room/slot is only valid for same-batch split classes
            const batches = new Set(entries.map((e) => e.batch));
            if (batches.size > 1) {
              conflicts.push(
                `Conflict: ${room} on ${day} slot ${slot}: ${entries.map((e) => `${e.courseCode}(${e.batch})`).join(', ')}`
              );
            }
          }
        });
      }
    }
    expect(conflicts).toEqual([]);
  });

  it('all rooms are discovered', () => {
    expect(ALL_ROOMS.length).toBeGreaterThan(0);
    // Check known rooms from the PDF
    expect(ALL_ROOMS).toContain('1002');
    expect(ALL_ROOMS).toContain('2002');
    expect(ALL_ROOMS).toContain('4002');
    expect(ALL_ROOMS).toContain('5002');
    expect(ALL_ROOMS).toContain('LAB-4701');
    expect(ALL_ROOMS).toContain('LAB-5701');
    expect(ALL_ROOMS).toContain('IOT-LAB');
  });

  it('has entries for all 5 batches', () => {
    const batches = new Set(ROUTINE_DATA.map((e) => e.batch));
    expect(batches.size).toBe(5);
    expect(batches.has('2021-22')).toBe(true);
    expect(batches.has('2022-23')).toBe(true);
    expect(batches.has('2023-24')).toBe(true);
    expect(batches.has('2024-25')).toBe(true);
    expect(batches.has('2025-26')).toBe(true);
  });

  it('no duplicate IDs exist', () => {
    const ids = ROUTINE_DATA.map((e) => e.id);
    const uniqueIds = new Set(ids);
    // If there are duplicates, find them:
    if (ids.length !== uniqueIds.size) {
      const seen = new Set<string>();
      const dupes: string[] = [];
      ids.forEach((id) => {
        if (seen.has(id)) dupes.push(id);
        seen.add(id);
      });
      expect(dupes).toEqual([]);
    }
  });

  it('correctly maps all academic sessions to batch names (4th to 8th batch)', () => {
    expect(getBatchName('2021-22')).toBe('4th Batch');
    expect(getBatchName('2022-23')).toBe('5th Batch');
    expect(getBatchName('2023-24')).toBe('6th Batch');
    expect(getBatchName('2024-25')).toBe('7th Batch');
    expect(getBatchName('2025-26')).toBe('8th Batch');

    expect(getBatchLabel('2021-22')).toBe('4th Batch (2021-22)');
    expect(getBatchLabel('2022-23')).toBe('5th Batch (2022-23)');
    expect(getBatchLabel('2023-24')).toBe('6th Batch (2023-24)');
    expect(getBatchLabel('2024-25')).toBe('7th Batch (2024-25)');
    expect(getBatchLabel('2025-26')).toBe('8th Batch (2025-26)');

    expect(BATCH_INFO['2021-22'].ordinal).toBe(4);
    expect(BATCH_INFO['2025-26'].ordinal).toBe(8);
  });

  it('correctly maps all 10 faculty member full names to their codes', () => {
    expect(TEACHER_NAME_MAP['MAS']).toBe('Md. Ashiqussalehin');
    expect(TEACHER_NAME_MAP['FAA']).toBe('Fahmida Ahmed Antara');
    expect(TEACHER_NAME_MAP['SE']).toBe('Sadia Enam');
    expect(TEACHER_NAME_MAP['MTA']).toBe('Md. Toukir Ahmed');
    expect(TEACHER_NAME_MAP['SCD']).toBe('Saurav Chandra Das');
    expect(TEACHER_NAME_MAP['MAH']).toBe('Mostafiz Ahammed');
    expect(TEACHER_NAME_MAP['MM']).toBe('Mahir Mahbub');
    expect(TEACHER_NAME_MAP['MRI']).toBe('Md. Rafiqul Islam');
    expect(TEACHER_NAME_MAP['SS']).toBe('Suman Saha');
    expect(TEACHER_NAME_MAP['FA']).toBe('Farzana Akter');
  });
});

// ==========================================================
// VACANT ROOM STUDY FINDER TESTS
// ==========================================================
describe('getVacantRoomsForStudy', () => {
  it('returns all 7 rooms in the department', () => {
    const list = getVacantRoomsForStudy('Saturday', 600); // 10:00 AM
    expect(list.length).toBe(ALL_ROOMS.length);
  });

  it('puts currently free rooms before occupied rooms', () => {
    // At 10:00 AM on Sunday, some rooms are occupied, some free
    const list = getVacantRoomsForStudy('Sunday', 600);
    const firstFreeIndex = list.findIndex((r) => r.isFreeNow);
    const firstOccupiedIndex = list.findIndex((r) => !r.isFreeNow);

    if (firstFreeIndex !== -1 && firstOccupiedIndex !== -1) {
      expect(firstFreeIndex).toBeLessThan(firstOccupiedIndex);
    }
  });

  it('reports all rooms as available on non-working days (Thursday/Friday)', () => {
    const list = getVacantRoomsForStudy(null, 600);
    expect(list.every((r) => r.isFreeNow)).toBe(true);
    expect(list.every((r) => r.freeUntilTime === 'Off Day')).toBe(true);
  });

  it('attaches rich metadata to each vacant room result', () => {
    const list = getVacantRoomsForStudy('Saturday', 600);
    for (const item of list) {
      expect(item.metadata).toBeDefined();
      expect(item.metadata.displayName).toBeDefined();
      expect(item.metadata.floor).toBeDefined();
      expect(item.metadata.capacity).toBeGreaterThan(0);
      expect(Array.isArray(item.metadata.amenities)).toBe(true);
    }
  });
});

// ==========================================================
// ROOM METADATA INTEGRITY
// ==========================================================
describe('ROOM_METADATA', () => {
  it('has definitions for all campus rooms', () => {
    for (const room of ALL_ROOMS) {
      const meta = getRoomMetadata(room);
      expect(meta).toBeDefined();
      expect(meta.id).toBe(room);
      expect(['lecture', 'lab']).toContain(meta.type);
      expect(meta.amenities.length).toBeGreaterThan(0);
    }
  });

  it('correctly categorizes labs and lecture halls', () => {
    expect(ROOM_METADATA['LAB-4701'].type).toBe('lab');
    expect(ROOM_METADATA['LAB-5701'].type).toBe('lab');
    expect(ROOM_METADATA['IOT-LAB'].type).toBe('lab');

    expect(ROOM_METADATA['1002'].type).toBe('lecture');
    expect(ROOM_METADATA['2002'].type).toBe('lecture');
    expect(ROOM_METADATA['4002'].type).toBe('lecture');
    expect(ROOM_METADATA['5002'].type).toBe('lecture');
  });
});


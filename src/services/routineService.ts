import type { RoutineEntry, Batch, Day } from '../types/routine';
import { ROUTINE_DATA, TEACHER_NAME_MAP } from '../data/routine';
import { BATCHES, DAYS, TIME_SLOTS, BATCH_INFO } from '../types/routine';
import { timeToMinutes, getCurrentTimeMinutes, getCurrentDay } from '../utils/timeUtils';

/**
 * Get all routine entries for a specific batch.
 */
export function getRoutineForBatch(batch: Batch): RoutineEntry[] {
  return ROUTINE_DATA.filter((e) => e.batch === batch);
}

/**
 * Get routine entries for a specific batch and day.
 */
export function getRoutineForBatchDay(batch: Batch, day: Day): RoutineEntry[] {
  return ROUTINE_DATA.filter((e) => e.batch === batch && e.day === day);
}

/**
 * Get entries for a specific batch, day, and time slot.
 * A time slot can have multiple entries (e.g., two labs running simultaneously).
 */
export function getRoutineCell(
  batch: Batch,
  day: Day,
  slotNumber: number
): RoutineEntry[] {
  return ROUTINE_DATA.filter(
    (e) => e.batch === batch && e.day === day && e.slotNumber === slotNumber
  );
}

/**
 * Get the current class for a batch.
 */
export function getCurrentClassForBatch(batch: Batch): RoutineEntry | null {
  const day = getCurrentDay();
  if (!day) return null;
  const currentMinutes = getCurrentTimeMinutes();

  const entries = getRoutineForBatch(batch).filter((e) => {
    if (e.day !== day) return false;
    const start = timeToMinutes(e.startTime);
    const end = timeToMinutes(e.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  return entries[0] ?? null;
}

/**
 * Get the next class for a batch.
 */
export function getNextClassForBatch(batch: Batch): RoutineEntry | null {
  const day = getCurrentDay();
  if (!day) return null;
  const currentMinutes = getCurrentTimeMinutes();

  const futureEntries = getRoutineForBatch(batch)
    .filter((e) => e.day === day && timeToMinutes(e.startTime) > currentMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return futureEntries[0] ?? null;
}

/**
 * Check if a specific entry is currently running.
 */
export function isCurrentlyRunning(entry: RoutineEntry): boolean {
  const day = getCurrentDay();
  if (!day || entry.day !== day) return false;
  const currentMinutes = getCurrentTimeMinutes();
  const start = timeToMinutes(entry.startTime);
  const end = timeToMinutes(entry.endTime);
  return currentMinutes >= start && currentMinutes < end;
}

/**
 * Search routine entries by query.
 * Matches course codes, rooms, teacher short codes, teacher full names,
 * batch sessions (e.g. 2021-22), and batch names (e.g. 4th batch).
 */
export function searchRoutine(query: string): RoutineEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return ROUTINE_DATA.filter((entry) => {
    const teacherName = (TEACHER_NAME_MAP[entry.teacherCode] ?? '').toLowerCase();
    const batchMeta = BATCH_INFO[entry.batch];
    const batchName = batchMeta ? batchMeta.name.toLowerCase() : '';
    const batchLabel = batchMeta ? batchMeta.label.toLowerCase() : '';

    return (
      entry.courseCode.toLowerCase().includes(normalized) ||
      entry.room.toLowerCase().includes(normalized) ||
      entry.teacherCode.toLowerCase().includes(normalized) ||
      teacherName.includes(normalized) ||
      entry.batch.toLowerCase().includes(normalized) ||
      batchName.includes(normalized) ||
      batchLabel.includes(normalized) ||
      entry.day.toLowerCase().includes(normalized)
    );
  });
}

/**
 * Get all unique course codes.
 */
export function getAllCourses(): string[] {
  const courses = new Set<string>();
  for (const entry of ROUTINE_DATA) {
    courses.add(entry.courseCode);
  }
  return Array.from(courses).sort();
}

/**
 * Get all unique teacher codes.
 */
export function getAllTeacherCodes(): string[] {
  const teachers = new Set<string>();
  for (const entry of ROUTINE_DATA) {
    if (entry.teacherCode) teachers.add(entry.teacherCode);
  }
  return Array.from(teachers).sort();
}

export { BATCHES, DAYS, TIME_SLOTS };

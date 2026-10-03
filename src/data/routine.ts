import type { RoutineEntry, Batch, Day } from '../types/routine';

/**
 * Teacher name mapping — configurable by an administrator.
 * Keys are short codes from the source PDF.
 * Values are full names (null = not yet configured).
 *
 * DO NOT invent full names. Only populate when the administrator provides them.
 */
export const TEACHER_NAME_MAP: Record<string, string | null> = {
  FA: 'Farzana Akter',
  SS: 'Suman Saha',
  MAH: 'Mostafiz Ahammed',
  MRI: 'Md. Rafiqul Islam',
  MM: 'Mahir Mahbub',
  SCD: 'Saurav Chandra Das',
  SE: 'Sadia Enam',
  FAA: 'Fahmida Ahmed Antara',
  MTA: 'Md. Toukir Ahmed',
  MAS: 'Md. Ashiqussalehin',
};

/**
 * Get friendly display name for a teacher code.
 * Returns full name if configured, otherwise returns the code itself.
 */
export function getTeacherDisplayName(code: string): string {
  if (!code) return '';
  return TEACHER_NAME_MAP[code] ?? code;
}

/** Helper to create a unique ID for a routine entry */
function entryId(batch: Batch, day: Day, slot: number, course: string, room: string): string {
  return `${batch}__${day}__${slot}__${course}__${room}`.replace(/\s+/g, '_');
}

/**
 * Complete routine data extracted from "Routine 2026_New.pdf".
 *
 * Source: aSc Timetables — generated 10/1/2026
 *
 * IMPORTANT:
 * - Data is extracted directly from the PDF layout.
 * - No teacher full names are invented.
 * - No routine data is fabricated.
 * - Empty cells in the PDF result in no entry (not a blank entry).
 * - Where the PDF shows no teacher code, an empty string is used.
 * - Courses with alternate codes (e.g., IRE 459 / IOT 4411) are entered
 *   using the primary course code with the alternate noted.
 *
 * AMBIGUITY FLAGS:
 * - 2022-23 SUN Slot5 ENG 407 / 1002: No teacher code visible in PDF layout.
 * - 2022-23 MON Slot5 ENG 407 / 5002: No teacher code visible in PDF layout.
 * - 2022-23 TUE Slot4 ENG 408 / 5002: No teacher code visible in PDF layout.
 * - 2022-23 TUE Slot5 ENG 408 / 5002: No teacher code visible in PDF layout.
 * - 2023-24 SUN Slot4 MATH 217 / 1002: No teacher code visible in PDF layout.
 * - 2023-24 MON Slot4 MATH 217 / 2002: No teacher code visible in PDF layout.
 * - 2024-25 SUN Slot5 MATH 209 / 2002: No teacher code visible in PDF layout.
 * - 2024-25 MON Slot3 MATH 209 / 1002: No teacher code visible in PDF layout.
 * - 2025-26 SAT Slot4 DS 107 / 5002: No teacher code visible in PDF layout.
 * - 2025-26 TUE Slot4 DS 107 / 1002: No teacher code visible in PDF layout.
 */
export const ROUTINE_DATA: readonly RoutineEntry[] = [
  // ============================================================
  // BATCH 2021-22
  // ============================================================
  // SATURDAY
  {
    id: entryId('2021-22', 'Saturday', 1, 'IRE 414', 'LAB-5701'),
    batch: '2021-22', day: 'Saturday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 414', room: 'LAB-5701', teacherCode: 'SS',
  },
  {
    id: entryId('2021-22', 'Saturday', 2, 'IRE 467', '4002'),
    batch: '2021-22', day: 'Saturday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 467', room: '4002', teacherCode: 'MAH',
  },
  {
    id: entryId('2021-22', 'Saturday', 3, 'IRE 468', 'IOT-LAB'),
    batch: '2021-22', day: 'Saturday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 468', room: 'IOT-LAB', teacherCode: 'MAH',
  },
  // SUNDAY
  {
    id: entryId('2021-22', 'Sunday', 3, 'IRE 416', 'LAB-5701'),
    batch: '2021-22', day: 'Sunday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 416', room: 'LAB-5701', teacherCode: 'FA',
  },
  {
    id: entryId('2021-22', 'Sunday', 5, 'IRE 413', '4002'),
    batch: '2021-22', day: 'Sunday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'IRE 413', room: '4002', teacherCode: 'FA',
  },
  // MONDAY
  {
    id: entryId('2021-22', 'Monday', 2, 'IRE 415', '2002'),
    batch: '2021-22', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 415', room: '2002', teacherCode: 'FA',
  },
  {
    id: entryId('2021-22', 'Monday', 3, 'CYB 485', '2002'),
    batch: '2021-22', day: 'Monday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'CYB 485', room: '2002', teacherCode: 'MAS',
  },
  {
    id: entryId('2021-22', 'Monday', 4, 'IRE 413', '4002'),
    batch: '2021-22', day: 'Monday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'IRE 413', room: '4002', teacherCode: 'FA',
  },
  {
    id: entryId('2021-22', 'Monday', 5, 'IRE 414', 'LAB-5701'),
    batch: '2021-22', day: 'Monday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'IRE 414', room: 'LAB-5701', teacherCode: 'SS',
  },
  // TUESDAY
  {
    id: entryId('2021-22', 'Tuesday', 1, 'IRE 416', 'LAB-5701'),
    batch: '2021-22', day: 'Tuesday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 416', room: 'LAB-5701', teacherCode: 'FA',
  },
  {
    id: entryId('2021-22', 'Tuesday', 2, 'IRE 415', '1002'),
    batch: '2021-22', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 415', room: '1002', teacherCode: 'FA',
  },
  {
    id: entryId('2021-22', 'Tuesday', 3, 'IRE 467', '5002'),
    batch: '2021-22', day: 'Tuesday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 467', room: '5002', teacherCode: 'MAH',
  },
  {
    id: entryId('2021-22', 'Tuesday', 4, 'IRE 468', 'IOT-LAB'),
    batch: '2021-22', day: 'Tuesday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'IRE 468', room: 'IOT-LAB', teacherCode: 'MAH',
  },
  {
    id: entryId('2021-22', 'Tuesday', 5, 'CYB 485', '2002'),
    batch: '2021-22', day: 'Tuesday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'CYB 485', room: '2002', teacherCode: 'MAS',
  },
  // WEDNESDAY — no classes

  // ============================================================
  // BATCH 2022-23
  // ============================================================
  // SATURDAY — no classes
  // SUNDAY
  {
    id: entryId('2022-23', 'Sunday', 2, 'IRE 459', '4002'),
    batch: '2022-23', day: 'Sunday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 459', room: '4002', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Sunday', 3, 'IRE 403', '5002'),
    batch: '2022-23', day: 'Sunday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 403', room: '5002', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Sunday', 4, 'IRE 404', 'LAB-5701'),
    batch: '2022-23', day: 'Sunday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'IRE 404', room: 'LAB-5701', teacherCode: 'FA',
  },
  {
    id: entryId('2022-23', 'Sunday', 5, 'ENG 407', '1002'),
    batch: '2022-23', day: 'Sunday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'ENG 407', room: '1002', teacherCode: '',
  },
  // MONDAY
  {
    id: entryId('2022-23', 'Monday', 1, 'IRE 403', '1002'),
    batch: '2022-23', day: 'Monday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 403', room: '1002', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Monday', 2, 'IRE 459', '1002'),
    batch: '2022-23', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 459', room: '1002', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Monday', 3, 'IRE 404', 'LAB-5701'),
    batch: '2022-23', day: 'Monday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 404', room: 'LAB-5701', teacherCode: 'FA',
  },
  {
    id: entryId('2022-23', 'Monday', 4, 'AI 483', '5002'),
    batch: '2022-23', day: 'Monday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'AI 483', room: '5002', teacherCode: 'SS',
  },
  {
    id: entryId('2022-23', 'Monday', 5, 'ENG 407', '5002'),
    batch: '2022-23', day: 'Monday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'ENG 407', room: '5002', teacherCode: '',
  },
  // TUESDAY
  {
    id: entryId('2022-23', 'Tuesday', 1, 'IRE 460', 'LAB-1202'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 460', room: 'LAB-1202', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Tuesday', 2, 'IRE 460', 'LAB-1202'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 460', room: 'LAB-1202', teacherCode: 'MRI',
  },
  {
    id: entryId('2022-23', 'Tuesday', 3, 'AI 483', '2002'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'AI 483', room: '2002', teacherCode: 'SS',
  },
  {
    id: entryId('2022-23', 'Tuesday', 4, 'ENG 408', '5002'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'ENG 408', room: '5002', teacherCode: '',
  },
  {
    id: entryId('2022-23', 'Tuesday', 4, 'AI 484', 'LAB-1202'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'AI 484', room: 'LAB-1202', teacherCode: 'SS',
  },
  {
    id: entryId('2022-23', 'Tuesday', 5, 'ENG 408', '5002'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'ENG 408', room: '5002', teacherCode: '',
  },
  {
    id: entryId('2022-23', 'Tuesday', 5, 'AI 484', 'LAB-1202'),
    batch: '2022-23', day: 'Tuesday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'AI 484', room: 'LAB-1202', teacherCode: 'SS',
  },
  // WEDNESDAY — no classes

  // ============================================================
  // BATCH 2023-24
  // ============================================================
  // SATURDAY
  {
    id: entryId('2023-24', 'Saturday', 1, 'PROG 301', '5002'),
    batch: '2023-24', day: 'Saturday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'PROG 301', room: '5002', teacherCode: 'MM',
  },
  {
    id: entryId('2023-24', 'Saturday', 2, 'CSE 219', '2002'),
    batch: '2023-24', day: 'Saturday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'CSE 219', room: '2002', teacherCode: 'MM',
  },
  {
    id: entryId('2023-24', 'Saturday', 3, 'PROG 302', 'LAB-5701'),
    batch: '2023-24', day: 'Saturday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'PROG 302', room: 'LAB-5701', teacherCode: 'MM',
  },
  {
    id: entryId('2023-24', 'Saturday', 4, 'PROG 302', 'LAB-5701'),
    batch: '2023-24', day: 'Saturday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'PROG 302', room: 'LAB-5701', teacherCode: 'MM',
  },
  // SUNDAY
  {
    id: entryId('2023-24', 'Sunday', 2, 'PROG 301', '2002'),
    batch: '2023-24', day: 'Sunday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'PROG 301', room: '2002', teacherCode: 'MM',
  },
  {
    id: entryId('2023-24', 'Sunday', 3, 'CSE 219', '1002'),
    batch: '2023-24', day: 'Sunday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'CSE 219', room: '1002', teacherCode: 'MM',
  },
  {
    id: entryId('2023-24', 'Sunday', 4, 'MATH 217', '1002'),
    batch: '2023-24', day: 'Sunday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'MATH 217', room: '1002', teacherCode: '',
  },
  {
    id: entryId('2023-24', 'Sunday', 5, 'IRE 215', '5002'),
    batch: '2023-24', day: 'Sunday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'IRE 215', room: '5002', teacherCode: 'MAH',
  },
  // MONDAY
  {
    id: entryId('2023-24', 'Monday', 1, 'IRE 216', 'IOT-LAB'),
    batch: '2023-24', day: 'Monday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 216', room: 'IOT-LAB', teacherCode: 'SE',
  },
  {
    id: entryId('2023-24', 'Monday', 2, 'IRE 212', 'LAB-5701'),
    batch: '2023-24', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 212', room: 'LAB-5701', teacherCode: 'SCD',
  },
  {
    id: entryId('2023-24', 'Monday', 2, 'IRE 216', 'IOT-LAB'),
    batch: '2023-24', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 216', room: 'IOT-LAB', teacherCode: 'SE',
  },
  {
    id: entryId('2023-24', 'Monday', 3, 'IRE 211', '5002'),
    batch: '2023-24', day: 'Monday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 211', room: '5002', teacherCode: 'SCD',
  },
  {
    id: entryId('2023-24', 'Monday', 4, 'MATH 217', '2002'),
    batch: '2023-24', day: 'Monday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'MATH 217', room: '2002', teacherCode: '',
  },
  // TUESDAY
  {
    id: entryId('2023-24', 'Tuesday', 1, 'IRE 215', '1002'),
    batch: '2023-24', day: 'Tuesday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 215', room: '1002', teacherCode: 'MAH',
  },
  {
    id: entryId('2023-24', 'Tuesday', 2, 'IRE 211', '5002'),
    batch: '2023-24', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 211', room: '5002', teacherCode: 'SCD',
  },
  {
    id: entryId('2023-24', 'Tuesday', 4, 'IRE 212', 'LAB-4701'),
    batch: '2023-24', day: 'Tuesday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'IRE 212', room: 'LAB-4701', teacherCode: 'SCD',
  },
  // WEDNESDAY — no classes

  // ============================================================
  // BATCH 2024-25
  // ============================================================
  // SATURDAY
  {
    id: entryId('2024-25', 'Saturday', 2, 'IRE 206', 'IOT-LAB'),
    batch: '2024-25', day: 'Saturday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 206', room: 'IOT-LAB', teacherCode: 'FAA',
  },
  {
    id: entryId('2024-25', 'Saturday', 2, 'NEM 482', 'LAB-5701'),
    batch: '2024-25', day: 'Saturday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'NEM 482', room: 'LAB-5701', teacherCode: 'SCD',
  },
  {
    id: entryId('2024-25', 'Saturday', 3, 'NEM 481', '4002'),
    batch: '2024-25', day: 'Saturday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'NEM 481', room: '4002', teacherCode: 'SCD',
  },
  // SUNDAY
  {
    id: entryId('2024-25', 'Sunday', 1, 'CSE 201', '1002'),
    batch: '2024-25', day: 'Sunday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'CSE 201', room: '1002', teacherCode: 'MM',
  },
  {
    id: entryId('2024-25', 'Sunday', 2, 'IRE 203', '1002'),
    batch: '2024-25', day: 'Sunday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 203', room: '1002', teacherCode: 'SE',
  },
  {
    id: entryId('2024-25', 'Sunday', 3, 'IRE 206', 'IOT-LAB'),
    batch: '2024-25', day: 'Sunday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 206', room: 'IOT-LAB', teacherCode: 'FAA',
  },
  {
    id: entryId('2024-25', 'Sunday', 4, 'IRE 205', '2002'),
    batch: '2024-25', day: 'Sunday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'IRE 205', room: '2002', teacherCode: 'MAH',
  },
  {
    id: entryId('2024-25', 'Sunday', 5, 'MATH 209', '2002'),
    batch: '2024-25', day: 'Sunday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'MATH 209', room: '2002', teacherCode: '',
  },
  // MONDAY
  {
    id: entryId('2024-25', 'Monday', 2, 'CSE 201', '4002'),
    batch: '2024-25', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'CSE 201', room: '4002', teacherCode: 'MM',
  },
  {
    id: entryId('2024-25', 'Monday', 3, 'MATH 209', '1002'),
    batch: '2024-25', day: 'Monday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'MATH 209', room: '1002', teacherCode: '',
  },
  {
    id: entryId('2024-25', 'Monday', 4, 'NEM 482', 'LAB-5701'),
    batch: '2024-25', day: 'Monday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'NEM 482', room: 'LAB-5701', teacherCode: 'SCD',
  },
  {
    id: entryId('2024-25', 'Monday', 4, 'CSE 202', 'LAB-4701'),
    batch: '2024-25', day: 'Monday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'CSE 202', room: 'LAB-4701', teacherCode: 'MAS',
  },
  {
    id: entryId('2024-25', 'Monday', 5, 'CSE 202', 'LAB-4701'),
    batch: '2024-25', day: 'Monday', slotNumber: 5,
    startTime: '15:45', endTime: '17:30',
    courseCode: 'CSE 202', room: 'LAB-4701', teacherCode: 'MAS',
  },
  // TUESDAY
  {
    id: entryId('2024-25', 'Tuesday', 1, 'IRE 203', '4002'),
    batch: '2024-25', day: 'Tuesday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'IRE 203', room: '4002', teacherCode: 'SE',
  },
  {
    id: entryId('2024-25', 'Tuesday', 2, 'IRE 205', '4002'),
    batch: '2024-25', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 205', room: '4002', teacherCode: 'MAH',
  },
  {
    id: entryId('2024-25', 'Tuesday', 3, 'NEM 481', '4002'),
    batch: '2024-25', day: 'Tuesday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'NEM 481', room: '4002', teacherCode: 'SCD',
  },
  // WEDNESDAY — no classes

  // ============================================================
  // BATCH 2025-26
  // ============================================================
  // SATURDAY
  {
    id: entryId('2025-26', 'Saturday', 2, 'PROG 101', '5002'),
    batch: '2025-26', day: 'Saturday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'PROG 101', room: '5002', teacherCode: 'MTA',
  },
  {
    id: entryId('2025-26', 'Saturday', 3, 'IRE 103', '2002'),
    batch: '2025-26', day: 'Saturday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 103', room: '2002', teacherCode: 'FAA',
  },
  {
    id: entryId('2025-26', 'Saturday', 4, 'DS 107', '5002'),
    batch: '2025-26', day: 'Saturday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'DS 107', room: '5002', teacherCode: '',
  },
  // SUNDAY
  {
    id: entryId('2025-26', 'Sunday', 2, 'IRE 103', '5002'),
    batch: '2025-26', day: 'Sunday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 103', room: '5002', teacherCode: 'FAA',
  },
  {
    id: entryId('2025-26', 'Sunday', 3, 'IRE 101', '4002'),
    batch: '2025-26', day: 'Sunday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 101', room: '4002', teacherCode: 'SE',
  },
  {
    id: entryId('2025-26', 'Sunday', 4, 'PHY 105', '5002'),
    batch: '2025-26', day: 'Sunday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'PHY 105', room: '5002', teacherCode: 'FAA',
  },
  // MONDAY
  {
    id: entryId('2025-26', 'Monday', 1, 'PHY 105', '5002'),
    batch: '2025-26', day: 'Monday', slotNumber: 1,
    startTime: '08:00', endTime: '09:45',
    courseCode: 'PHY 105', room: '5002', teacherCode: 'FAA',
  },
  {
    id: entryId('2025-26', 'Monday', 2, 'PROG 101', '5002'),
    batch: '2025-26', day: 'Monday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'PROG 101', room: '5002', teacherCode: 'MTA',
  },
  {
    id: entryId('2025-26', 'Monday', 3, 'IRE 101', '4002'),
    batch: '2025-26', day: 'Monday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 101', room: '4002', teacherCode: 'SE',
  },
  // TUESDAY
  {
    id: entryId('2025-26', 'Tuesday', 2, 'PROG 102', 'LAB-5701'),
    batch: '2025-26', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'PROG 102', room: 'LAB-5701', teacherCode: 'MTA',
  },
  {
    id: entryId('2025-26', 'Tuesday', 2, 'IRE 118', 'LAB-4701'),
    batch: '2025-26', day: 'Tuesday', slotNumber: 2,
    startTime: '09:45', endTime: '11:30',
    courseCode: 'IRE 118', room: 'LAB-4701', teacherCode: 'MAS',
  },
  {
    id: entryId('2025-26', 'Tuesday', 3, 'PROG 102', 'LAB-5701'),
    batch: '2025-26', day: 'Tuesday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'PROG 102', room: 'LAB-5701', teacherCode: 'MTA',
  },
  {
    id: entryId('2025-26', 'Tuesday', 3, 'IRE 118', 'LAB-4701'),
    batch: '2025-26', day: 'Tuesday', slotNumber: 3,
    startTime: '11:30', endTime: '13:15',
    courseCode: 'IRE 118', room: 'LAB-4701', teacherCode: 'MAS',
  },
  {
    id: entryId('2025-26', 'Tuesday', 4, 'DS 107', '1002'),
    batch: '2025-26', day: 'Tuesday', slotNumber: 4,
    startTime: '14:00', endTime: '15:45',
    courseCode: 'DS 107', room: '1002', teacherCode: '',
  },
  // WEDNESDAY — no classes
];

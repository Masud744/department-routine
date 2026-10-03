import { ROUTINE_DATA, TEACHER_NAME_MAP } from './routine';
import type { TeacherInfo } from '../types/routine';

/**
 * Official Teacher Designation Mapping:
 * - Md. Toukir Ahmed: Chairman & Assistant Professor
 * - Farzana Akter, Suman Saha, Sadia Enam, Fahmida Ahmed Antara: Assistant Professor
 * - Mostafiz Ahammed, Md. Ashiqussalehin, Mahir Mahbub, Md. Rafiqul Islam, Saurav Chandra Das: Lecturer
 */
export const TEACHER_DESIGNATION_MAP: Record<string, string> = {
  MTA: 'Chairman & Assistant Professor',
  FA: 'Assistant Professor',
  SS: 'Assistant Professor',
  SE: 'Assistant Professor',
  FAA: 'Assistant Professor',
  MAH: 'Lecturer',
  MAS: 'Lecturer',
  MM: 'Lecturer',
  MRI: 'Lecturer',
  SCD: 'Lecturer',
};

/**
 * Strict teacher sequence requested:
 * 1. Md. Toukir Ahmed
 * 2. Farzana Akter
 * 3. Suman Saha
 * 4. Sadia Enam
 * 5. Fahmida Ahmed Antara
 * 6. Md. Ashiqussalehin
 * 7. Md. Rafiqul Islam
 * 8. Mahir Mahbub
 * 9. Saurav Chandra Das
 * 10. Mostafiz Ahammed
 */
export const TEACHER_ORDER: string[] = [
  'MTA', // Md. Toukir Ahmed
  'FA',  // Farzana Akter
  'SS',  // Suman Saha
  'SE',  // Sadia Enam
  'FAA', // Fahmida Ahmed Antara
  'MAS', // Md. Ashiqussalehin
  'MRI', // Md. Rafiqul Islam
  'MM',  // Mahir Mahbub
  'SCD', // Saurav Chandra Das
  'MAH', // Mostafiz Ahammed
];

/**
 * Build teacher directory from routine data.
 * Full names and official designations are attached to each faculty member.
 */
export function getTeacherDirectory(): TeacherInfo[] {
  const teacherMap = new Map<string, TeacherInfo>();

  for (const entry of ROUTINE_DATA) {
    if (!entry.teacherCode) continue;
    const existing = teacherMap.get(entry.teacherCode);
    if (existing) {
      teacherMap.set(entry.teacherCode, {
        ...existing,
        classes: [...existing.classes, entry],
      });
    } else {
      teacherMap.set(entry.teacherCode, {
        code: entry.teacherCode,
        fullName: TEACHER_NAME_MAP[entry.teacherCode] ?? null,
        designation: TEACHER_DESIGNATION_MAP[entry.teacherCode] ?? 'Assistant Professor',
        classes: [entry],
      });
    }
  }

  return Array.from(teacherMap.values()).sort((a, b) => {
    const idxA = TEACHER_ORDER.indexOf(a.code);
    const idxB = TEACHER_ORDER.indexOf(b.code);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.code.localeCompare(b.code);
  });
}

export const TEACHER_DIRECTORY = getTeacherDirectory();

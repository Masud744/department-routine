import { ROUTINE_DATA, TEACHER_NAME_MAP } from './routine';
import type { TeacherInfo } from '../types/routine';

/**
 * Build teacher directory from routine data.
 * Uses only short codes from the source PDF.
 * Full names are populated from the configurable TEACHER_NAME_MAP.
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
        classes: [entry],
      });
    }
  }

  return Array.from(teacherMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );
}

export const TEACHER_DIRECTORY = getTeacherDirectory();

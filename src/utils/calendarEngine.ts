import { ACADEMIC_HOLIDAYS_2026_2027, BATCH_CALENDARS } from '../data/calendar';
import type { Holiday, SemesterPhase, AcademicDeadline } from '../types/calendar';
import type { Batch } from '../types/routine';

/** Convert Date object or ISO string to normalized 'YYYY-MM-DD' */
export function normalizeDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already 'YYYY-MM-DD', slice first 10 chars
    return date.slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Check if date is within [start, end] inclusive */
function isDateBetween(target: string, start: string, end: string): boolean {
  return target >= start && target <= end;
}

/** Calculate calendar day difference: (target - from) in whole days */
export function daysBetween(fromDate: string, targetDate: string): number {
  const fromMs = new Date(`${fromDate}T00:00:00Z`).getTime();
  const targetMs = new Date(`${targetDate}T00:00:00Z`).getTime();
  return Math.round((targetMs - fromMs) / (1000 * 60 * 60 * 24));
}

/**
 * Returns holiday details if the given date is an official university holiday.
 */
export function getHolidayForDate(date: Date | string): Holiday | null {
  const iso = normalizeDate(date);
  for (const h of ACADEMIC_HOLIDAYS_2026_2027) {
    if (isDateBetween(iso, h.startDate, h.endDate)) {
      return h;
    }
  }
  return null;
}

/**
 * Check if the given date is a holiday.
 */
export function isHoliday(date: Date | string): boolean {
  return getHolidayForDate(date) !== null;
}

/**
 * Get the next upcoming holiday strictly after the given date.
 */
export function getNextUpcomingHoliday(
  date: Date | string
): { holiday: Holiday; daysUntil: number } | null {
  const iso = normalizeDate(date);
  for (const h of ACADEMIC_HOLIDAYS_2026_2027) {
    if (h.startDate > iso) {
      return {
        holiday: h,
        daysUntil: daysBetween(iso, h.startDate),
      };
    }
  }
  return null;
}

/**
 * Get a list of upcoming holidays after or including the given date.
 */
export function getUpcomingHolidays(date: Date | string, limit = 5): Holiday[] {
  const iso = normalizeDate(date);
  return ACADEMIC_HOLIDAYS_2026_2027.filter((h) => h.endDate >= iso).slice(0, limit);
}

/**
 * Get the current semester phase for a given batch on a given date.
 */
export function getCurrentPhaseForBatch(
  batch: Batch,
  date: Date | string
): SemesterPhase | null {
  const iso = normalizeDate(date);
  const calendar = BATCH_CALENDARS[batch];
  if (!calendar) return null;

  for (const phase of calendar.phases) {
    if (isDateBetween(iso, phase.startDate, phase.endDate)) {
      return phase;
    }
  }
  return null;
}

/**
 * Check if an examination (Midterm or Final) is active for the given batch.
 */
export function isExamRunning(
  batch: Batch,
  date: Date | string
): { isExam: boolean; examType?: 'midterm' | 'final'; phase?: SemesterPhase } {
  const phase = getCurrentPhaseForBatch(batch, date);
  if (!phase) {
    return { isExam: false };
  }

  if (phase.type === 'midterm_exam') {
    return { isExam: true, examType: 'midterm', phase };
  }
  if (phase.type === 'final_exam') {
    return { isExam: true, examType: 'final', phase };
  }

  return { isExam: false, phase };
}

/**
 * Calculate progress of the overall semester for a batch.
 */
export function getSemesterProgress(
  batch: Batch,
  date: Date | string
): {
  percent: number;
  currentWeek: number;
  totalWeeks: number;
  phaseName: string;
  isCompleted: boolean;
  notStarted: boolean;
} | null {
  const iso = normalizeDate(date);
  const calendar = BATCH_CALENDARS[batch];
  if (!calendar || calendar.phases.length === 0) return null;

  const firstPhase = calendar.phases[0];
  const lastPhase = calendar.phases[calendar.phases.length - 1];

  const totalDays = daysBetween(firstPhase.startDate, lastPhase.endDate);
  const totalWeeks = Math.max(1, Math.round(totalDays / 7));

  if (iso < firstPhase.startDate) {
    return {
      percent: 0,
      currentWeek: 0,
      totalWeeks,
      phaseName: 'Upcoming Semester',
      isCompleted: false,
      notStarted: true,
    };
  }

  if (iso > lastPhase.endDate) {
    return {
      percent: 100,
      currentWeek: totalWeeks,
      totalWeeks,
      phaseName: 'Semester Concluded',
      isCompleted: true,
      notStarted: false,
    };
  }

  const elapsedDays = daysBetween(firstPhase.startDate, iso);
  const percent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  const currentWeek = Math.min(totalWeeks, Math.floor(elapsedDays / 7) + 1);

  const currentPhase = getCurrentPhaseForBatch(batch, date);

  return {
    percent,
    currentWeek,
    totalWeeks,
    phaseName: currentPhase?.name ?? 'Semester in progress',
    isCompleted: false,
    notStarted: false,
  };
}

export interface UpcomingDeadlineResult {
  readonly deadline: AcademicDeadline;
  readonly daysUntil: number;
  readonly status: 'active' | 'upcoming';
}

/**
 * Get relevant upcoming deadlines for a batch (or all batches).
 */
export function getUpcomingDeadlines(
  batch: Batch | 'all',
  date: Date | string,
  limit = 5
): UpcomingDeadlineResult[] {
  const iso = normalizeDate(date);
  const deadlines: AcademicDeadline[] = [];

  if (batch === 'all') {
    // Collect unique deadlines across batches
    for (const b of Object.keys(BATCH_CALENDARS) as Batch[]) {
      deadlines.push(...BATCH_CALENDARS[b].deadlines);
    }
  } else {
    const calendar = BATCH_CALENDARS[batch];
    if (calendar) {
      deadlines.push(...calendar.deadlines);
    }
  }

  const results: UpcomingDeadlineResult[] = [];

  for (const d of deadlines) {
    const end = d.endDate ?? d.startDate;
    if (iso <= end) {
      const isActive = isDateBetween(iso, d.startDate, end);
      const daysUntil = isActive ? 0 : daysBetween(iso, d.startDate);
      results.push({
        deadline: d,
        daysUntil,
        status: isActive ? 'active' : 'upcoming',
      });
    }
  }

  // Sort by earliest relevant date
  results.sort((a, b) => {
    const dateA = a.status === 'active' ? (a.deadline.endDate ?? a.deadline.startDate) : a.deadline.startDate;
    const dateB = b.status === 'active' ? (b.deadline.endDate ?? b.deadline.startDate) : b.deadline.startDate;
    return dateA.localeCompare(dateB);
  });

  return results.slice(0, limit);
}

import type { Batch } from './routine';

/** Type of semester phase */
export type SemesterPhaseType =
  | 'service_week'
  | 'classes'
  | 'midterm_exam'
  | 'final_exam'
  | 'vacation'
  | 'break';

/** Represents a major phase of the academic semester */
export interface SemesterPhase {
  readonly id: string;
  readonly name: string;
  readonly type: SemesterPhaseType;
  readonly startDate: string; // ISO format 'YYYY-MM-DD'
  readonly endDate: string;   // ISO format 'YYYY-MM-DD'
  readonly duration: string;  // e.g. '7W', '2W 2D'
  readonly batch: Batch;
}

/** Official university holiday */
export interface Holiday {
  readonly id: string;
  readonly name: string;
  readonly startDate: string; // ISO format 'YYYY-MM-DD'
  readonly endDate: string;   // ISO format 'YYYY-MM-DD'
  readonly days: number;
  readonly isTentative?: boolean; // For moon-sighting dependent holidays marked with *
  readonly description?: string;
}

/** Academic deadline categories */
export type AcademicDeadlineType =
  | 'course_offer'
  | 'registration'
  | 'add_drop'
  | 'admit_card'
  | 'result_publication'
  | 'next_semester';

/** Important academic date / deadline */
export interface AcademicDeadline {
  readonly id: string;
  readonly title: string;
  readonly type: AcademicDeadlineType;
  readonly startDate: string; // ISO format 'YYYY-MM-DD'
  readonly endDate?: string;   // ISO format 'YYYY-MM-DD'
  readonly batch: Batch | 'all';
  readonly fineStatus?: 'none' | 'with_fine' | 'vc_approval';
  readonly description?: string;
}

/** Complete calendar mapping for a specific batch */
export interface BatchCalendar {
  readonly batch: Batch;
  readonly session: string;
  readonly term: string;
  readonly phases: readonly SemesterPhase[];
  readonly deadlines: readonly AcademicDeadline[];
}

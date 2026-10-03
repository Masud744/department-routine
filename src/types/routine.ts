/** Days the department has classes */
export type Day = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday';

/** All valid days in order */
export const DAYS: Day[] = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];

/** Time slot definition */
export interface TimeSlot {
  readonly slotNumber: number;
  readonly startTime: string; // HH:mm format
  readonly endTime: string;   // HH:mm format
  readonly label: string;     // e.g. "08:00 - 09:45"
}

/** Standard time slots used by the department */
export const TIME_SLOTS: readonly TimeSlot[] = [
  { slotNumber: 1, startTime: '08:00', endTime: '09:45', label: '08:00 - 09:45' },
  { slotNumber: 2, startTime: '09:45', endTime: '11:30', label: '09:45 - 11:30' },
  { slotNumber: 3, startTime: '11:30', endTime: '13:15', label: '11:30 - 13:15' },
  { slotNumber: 4, startTime: '14:00', endTime: '15:45', label: '14:00 - 15:45' },
  { slotNumber: 5, startTime: '15:45', endTime: '17:30', label: '15:45 - 17:30' },
] as const;

/** Academic batch/session identifier */
export type Batch = '2021-22' | '2022-23' | '2023-24' | '2024-25' | '2025-26';

/** Batch metadata definition */
export interface BatchInfo {
  readonly id: Batch;
  readonly name: string;       // e.g. "4th Batch"
  readonly session: string;    // e.g. "2021-22"
  readonly label: string;      // e.g. "4th Batch (2021-22)"
  readonly ordinal: number;    // 4
}

/** Official departmental batch mapping (4th to 8th batch) */
export const BATCH_INFO: Record<Batch, BatchInfo> = {
  '2021-22': { id: '2021-22', name: '4th Batch', session: '2021-22', label: '4th Batch (2021-22)', ordinal: 4 },
  '2022-23': { id: '2022-23', name: '5th Batch', session: '2022-23', label: '5th Batch (2022-23)', ordinal: 5 },
  '2023-24': { id: '2023-24', name: '6th Batch', session: '2023-24', label: '6th Batch (2023-24)', ordinal: 6 },
  '2024-25': { id: '2024-25', name: '7th Batch', session: '2024-25', label: '7th Batch (2024-25)', ordinal: 7 },
  '2025-26': { id: '2025-26', name: '8th Batch', session: '2025-26', label: '8th Batch (2025-26)', ordinal: 8 },
};

/** Get friendly batch label, e.g. "4th Batch (2021-22)" */
export function getBatchLabel(batch: Batch | string): string {
  return BATCH_INFO[batch as Batch]?.label ?? `Batch ${batch}`;
}

/** Get short batch name, e.g. "4th Batch" */
export function getBatchName(batch: Batch | string): string {
  return BATCH_INFO[batch as Batch]?.name ?? `Batch ${batch}`;
}

/** All batches in order */
export const BATCHES: Batch[] = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];

/** A single routine entry representing one class */
export interface RoutineEntry {
  readonly id: string;
  readonly batch: Batch;
  readonly day: Day;
  readonly slotNumber: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly courseCode: string;
  readonly room: string;
  readonly teacherCode: string;
}

/** Room occupancy status */
export type RoomStatus = 'occupied' | 'available' | 'upcoming';

/** Current state of a room */
export interface RoomState {
  readonly room: string;
  readonly status: RoomStatus;
  readonly currentClass: RoutineEntry | null;
  readonly nextClass: RoutineEntry | null;
  readonly timeUntilFree: string | null;
  readonly timeUntilNext: string | null;
}

/** Teacher information */
export interface TeacherInfo {
  readonly code: string;
  readonly fullName: string | null; // null = not yet configured
  readonly designation?: string;
  readonly classes: RoutineEntry[];
}

/** Teacher name mapping - configurable by admin */
export type TeacherNameMap = Record<string, string | null>;

/** Search result */
export interface SearchResult {
  readonly type: 'course' | 'room' | 'teacher' | 'batch';
  readonly label: string;
  readonly entries: RoutineEntry[];
}

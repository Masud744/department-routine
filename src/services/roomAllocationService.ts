import type { RoutineEntry, RoomState, RoomStatus, Day } from '../types/routine';
import { ROUTINE_DATA } from '../data/routine';
import { ALL_ROOMS, getRoomMetadata } from '../data/rooms';
import type { RoomMetadata } from '../data/rooms';
import {
  timeToMinutes,
  getCurrentTimeMinutes,
  getCurrentDay,
  timeDifference,
  formatTime12h,
} from '../utils/timeUtils';

/**
 * Get all routine entries for a specific day.
 */
export function getEntriesForDay(day: Day): RoutineEntry[] {
  return ROUTINE_DATA.filter((e) => e.day === day);
}

/**
 * Get all routine entries for a specific room on a specific day,
 * sorted by start time.
 */
export function getRoomSchedule(room: string, day: Day): RoutineEntry[] {
  return ROUTINE_DATA
    .filter((e) => e.room === room && e.day === day)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Determine the current status of a room.
 */
export function getRoomStatus(
  room: string,
  day: Day | null,
  currentMinutes: number
): RoomState {
  if (!day) {
    return {
      room,
      status: 'available',
      currentClass: null,
      nextClass: null,
      timeUntilFree: null,
      timeUntilNext: null,
    };
  }

  const schedule = getRoomSchedule(room, day);

  if (schedule.length === 0) {
    return {
      room,
      status: 'available',
      currentClass: null,
      nextClass: null,
      timeUntilFree: null,
      timeUntilNext: null,
    };
  }

  // Find currently running class
  const currentClass = schedule.find((entry) => {
    const start = timeToMinutes(entry.startTime);
    const end = timeToMinutes(entry.endTime);
    return currentMinutes >= start && currentMinutes < end;
  }) ?? null;

  // Find next upcoming class
  const nextClass = schedule.find((entry) => {
    const start = timeToMinutes(entry.startTime);
    return start > currentMinutes;
  }) ?? null;

  let status: RoomStatus;
  let timeUntilFree: string | null = null;
  let timeUntilNext: string | null = null;

  if (currentClass) {
    status = 'occupied';
    const endMinutes = timeToMinutes(currentClass.endTime);
    timeUntilFree = timeDifference(currentMinutes, endMinutes);
  } else if (nextClass) {
    status = 'upcoming';
    const startMinutes = timeToMinutes(nextClass.startTime);
    timeUntilNext = timeDifference(currentMinutes, startMinutes);
  } else {
    status = 'available';
  }

  return {
    room,
    status,
    currentClass,
    nextClass,
    timeUntilFree,
    timeUntilNext,
  };
}

/**
 * Get the live status of all rooms.
 */
export function getAllRoomStatuses(): RoomState[] {
  const day = getCurrentDay();
  const currentMinutes = getCurrentTimeMinutes();
  return ALL_ROOMS.map((room) => getRoomStatus(room, day, currentMinutes));
}

/**
 * Get summary counts for the dashboard.
 */
export function getRoomSummary(): {
  occupied: number;
  available: number;
  upcoming: number;
  total: number;
} {
  const statuses = getAllRoomStatuses();
  return {
    occupied: statuses.filter((s) => s.status === 'occupied').length,
    available: statuses.filter((s) => s.status === 'available').length,
    upcoming: statuses.filter((s) => s.status === 'upcoming').length,
    total: statuses.length,
  };
}

/**
 * Get all currently running classes across all rooms.
 */
export function getCurrentlyRunningClasses(): RoutineEntry[] {
  const day = getCurrentDay();
  if (!day) return [];
  const currentMinutes = getCurrentTimeMinutes();

  return ROUTINE_DATA.filter((entry) => {
    if (entry.day !== day) return false;
    const start = timeToMinutes(entry.startTime);
    const end = timeToMinutes(entry.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });
}

/**
 * Get upcoming classes (next time slot after current).
 */
export function getUpcomingClasses(): RoutineEntry[] {
  const day = getCurrentDay();
  if (!day) return [];
  const currentMinutes = getCurrentTimeMinutes();

  const dayEntries = ROUTINE_DATA.filter((e) => e.day === day);
  const futureEntries = dayEntries.filter(
    (e) => timeToMinutes(e.startTime) > currentMinutes
  );

  if (futureEntries.length === 0) return [];

  // Get the next time slot
  const nextStart = Math.min(
    ...futureEntries.map((e) => timeToMinutes(e.startTime))
  );

  return futureEntries.filter(
    (e) => timeToMinutes(e.startTime) === nextStart
  );
}

export interface VacantRoomStudyInfo {
  room: string;
  metadata: RoomMetadata;
  status: RoomStatus;
  isFreeNow: boolean;
  freeUntilTime: string | null;
  freeDurationMinutes: number;
  freeDurationLabel: string;
  nextClass: RoutineEntry | null;
  currentClass: RoutineEntry | null;
  timeUntilFree: string | null;
}

/**
 * Get intelligent room vacancy info optimized for students looking for
 * empty rooms for group study, lab practice, or club work.
 */
export function getVacantRoomsForStudy(
  customDay?: Day | null,
  customMinutes?: number
): VacantRoomStudyInfo[] {
  const day = customDay !== undefined ? customDay : getCurrentDay();
  const currentMinutes = customMinutes !== undefined ? customMinutes : getCurrentTimeMinutes();

  const results: VacantRoomStudyInfo[] = ALL_ROOMS.map((room) => {
    const roomState = getRoomStatus(room, day, currentMinutes);
    const metadata = getRoomMetadata(room);

    let isFreeNow = false;
    let freeUntilTime: string | null = null;
    let freeDurationMinutes = 0;
    let freeDurationLabel = '';

    if (!day) {
      // Off day / weekend
      isFreeNow = true;
      freeUntilTime = 'Off Day';
      freeDurationMinutes = 9999;
      freeDurationLabel = 'Available all day (No classes scheduled)';
    } else if (roomState.status === 'available') {
      isFreeNow = true;
      freeUntilTime = 'End of Day';
      freeDurationMinutes = 9999;
      freeDurationLabel = 'Free for rest of day';
    } else if (roomState.status === 'upcoming' && roomState.nextClass) {
      isFreeNow = true;
      const nextStart = timeToMinutes(roomState.nextClass.startTime);
      freeDurationMinutes = Math.max(0, nextStart - currentMinutes);
      freeUntilTime = formatTime12h(roomState.nextClass.startTime);
      freeDurationLabel = `Free for ${timeDifference(currentMinutes, nextStart)} (until ${freeUntilTime})`;
    } else {
      // Occupied
      isFreeNow = false;
      freeUntilTime = roomState.currentClass ? formatTime12h(roomState.currentClass.endTime) : null;
      freeDurationMinutes = 0;
      freeDurationLabel = roomState.currentClass
        ? `Occupied until ${freeUntilTime} (Free in ${roomState.timeUntilFree || 'a few minutes'})`
        : 'Currently Occupied';
    }

    return {
      room,
      metadata,
      status: roomState.status,
      isFreeNow,
      freeUntilTime,
      freeDurationMinutes,
      freeDurationLabel,
      nextClass: roomState.nextClass,
      currentClass: roomState.currentClass,
      timeUntilFree: roomState.timeUntilFree,
    };
  });

  // Sort: Free rooms first (longest free duration first), then occupied rooms (earliest to become free)
  return results.sort((a, b) => {
    if (a.isFreeNow && !b.isFreeNow) return -1;
    if (!a.isFreeNow && b.isFreeNow) return 1;

    if (a.isFreeNow && b.isFreeNow) {
      return b.freeDurationMinutes - a.freeDurationMinutes;
    }

    // Both occupied: earlier free time first
    return a.room.localeCompare(b.room);
  });
}


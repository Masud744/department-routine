import type { RoutineEntry, RoomState, RoomStatus, Day } from '../types/routine';
import { ROUTINE_DATA } from '../data/routine';
import { ALL_ROOMS } from '../data/rooms';
import { timeToMinutes, getCurrentTimeMinutes, getCurrentDay, timeDifference } from '../utils/timeUtils';

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

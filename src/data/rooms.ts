import { ROUTINE_DATA } from './routine';

/**
 * Extract all unique rooms from the routine data.
 * Sorted for consistent display order.
 */
export function getAllRooms(): string[] {
  const rooms = new Set<string>();
  for (const entry of ROUTINE_DATA) {
    rooms.add(entry.room);
  }
  return Array.from(rooms).sort((a, b) => {
    // Sort numeric rooms first, then alphanumeric
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;
    return a.localeCompare(b);
  });
}

export const ALL_ROOMS = getAllRooms();

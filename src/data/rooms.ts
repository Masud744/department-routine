import { ROUTINE_DATA } from './routine';

export interface RoomMetadata {
  id: string;
  name: string;
  displayName: string;
  type: 'lecture' | 'lab';
  floor: string;
  building: string;
  capacity: number;
  amenities: string[];
}

export const ROOM_METADATA: Record<string, RoomMetadata> = {
  '1002': {
    id: '1002',
    name: '1002',
    displayName: 'Room 1002',
    type: 'lecture',
    floor: '1st Floor',
    building: 'Academic Building 1',
    capacity: 60,
    amenities: ['Projector', 'Wi-Fi', 'Whiteboard', 'Sound System'],
  },
  '2002': {
    id: '2002',
    name: '2002',
    displayName: 'Room 2002',
    type: 'lecture',
    floor: '2nd Floor',
    building: 'Academic Building 1',
    capacity: 60,
    amenities: ['Air Conditioned', 'Dual Projectors', 'High-Speed Wi-Fi', 'Whiteboard'],
  },
  '4002': {
    id: '4002',
    name: '4002',
    displayName: 'Room 4002',
    type: 'lecture',
    floor: '4th Floor',
    building: 'Academic Building 1',
    capacity: 60,
    amenities: ['Air Conditioned', 'Interactive Screen', 'Wi-Fi', 'Power Outlets'],
  },
  '5002': {
    id: '5002',
    name: '5002',
    displayName: 'Room 5002',
    type: 'lecture',
    floor: '5th Floor',
    building: 'Academic Building 1',
    capacity: 60,
    amenities: ['Air Conditioned', 'Projector', 'High-Speed Wi-Fi', 'Speaker Podium'],
  },
  'LAB-4701': {
    id: 'LAB-4701',
    name: 'LAB 4701',
    displayName: 'LAB 4701',
    type: 'lab',
    floor: '4th Floor (Lab Wing)',
    building: 'Academic Building 1',
    capacity: 45,
    amenities: ['45 PC Workstations', 'Air Conditioned', 'Gigabit LAN', 'Development Software'],
  },
  'LAB-5701': {
    id: 'LAB-5701',
    name: 'LAB 5701',
    displayName: 'LAB 5701',
    type: 'lab',
    floor: '5th Floor (Lab Wing)',
    building: 'Academic Building 1',
    capacity: 45,
    amenities: ['High-Spec Workstations', 'Linux Environment', 'Air Conditioned', 'High-Speed LAN'],
  },
  'IOT-LAB': {
    id: 'IOT-LAB',
    name: 'LAB 2701',
    displayName: 'LAB 2701',
    type: 'lab',
    floor: '2nd Floor (Lab Wing)',
    building: 'Academic Building 1',
    capacity: 35,
    amenities: ['Hardware Workbenches', 'Soldering Stations', 'Sensors & Microcontrollers', 'Air Conditioned'],
  },
  'LAB-2701': {
    id: 'LAB-2701',
    name: 'LAB 2701',
    displayName: 'LAB 2701',
    type: 'lab',
    floor: '2nd Floor (Lab Wing)',
    building: 'Academic Building 1',
    capacity: 35,
    amenities: ['Hardware Workbenches', 'Soldering Stations', 'Sensors & Microcontrollers', 'Air Conditioned'],
  },
  'LAB-1202': {
    id: 'LAB-1202',
    name: 'LAB 1202',
    displayName: 'LAB 1202',
    type: 'lab',
    floor: '1st Floor (Admin Building)',
    building: 'Admin Building',
    capacity: 40,
    amenities: ['Workstations', 'Air Conditioned', 'High-Speed LAN', 'Admin Building Wing'],
  },
};

/**
 * Format room identifier to friendly display name.
 * e.g. "IOT-LAB" -> "LAB 2701"
 *      "LAB-4701" -> "LAB 4701"
 *      "LAB-5701" -> "LAB 5701"
 *      "LAB-1202" -> "LAB 1202"
 *      "5002" -> "Room 5002"
 */
export function formatRoomDisplay(room: string): string {
  if (!room) return '';
  if (room === 'IOT-LAB' || room === 'LAB-2701' || room === '2701') return 'LAB 2701';
  if (room === 'LAB-4701' || room === '4701') return 'LAB 4701';
  if (room === 'LAB-5701' || room === '5701') return 'LAB 5701';
  if (room === 'LAB-1202' || room === '1202') return 'LAB 1202';
  if (room.startsWith('LAB-')) return room.replace('LAB-', 'LAB ');
  if (room.startsWith('LAB')) return room;
  return `Room ${room}`;
}

/**
 * Get metadata for a room, with graceful fallback.
 */
export function getRoomMetadata(room: string): RoomMetadata {
  if (ROOM_METADATA[room]) {
    return ROOM_METADATA[room];
  }
  const formatted = formatRoomDisplay(room);
  const isAdmin = room.includes('1202');
  return {
    id: room,
    name: formatted,
    displayName: formatted,
    type: room.startsWith('LAB') || room === 'IOT-LAB' ? 'lab' : 'lecture',
    floor: isAdmin ? '1st Floor' : 'Academic Building',
    building: isAdmin ? 'Admin Building' : 'Academic Building 1',
    capacity: 45,
    amenities: ['Wi-Fi', 'Air Conditioned', 'Power Outlets'],
  };
}

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

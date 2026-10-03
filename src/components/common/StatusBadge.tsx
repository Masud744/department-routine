import type { RoomStatus } from '../../types/routine';

interface StatusBadgeProps {
  status: RoomStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; className: string }> = {
  occupied: {
    label: 'Occupied',
    className: 'status-occupied',
  },
  available: {
    label: 'Available',
    className: 'status-available',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'status-upcoming',
  },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${config.className} ${sizeClasses}`}
      role="status"
    >
      <span className={`status-dot ${status}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

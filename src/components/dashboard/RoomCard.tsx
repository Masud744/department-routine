import type { RoomState } from '../../types/routine';
import { getBatchLabel } from '../../types/routine';
import { TEACHER_NAME_MAP } from '../../data/routine';
import { StatusBadge } from '../common/StatusBadge';
import { formatTime12h } from '../../utils/timeUtils';
import { formatRoomDisplay } from '../../data/rooms';

interface RoomCardProps {
  roomState: RoomState;
}

export function RoomCard({ roomState }: RoomCardProps) {
  const { room, status, currentClass, nextClass, timeUntilFree, timeUntilNext } = roomState;

  return (
    <div className="card p-3 sm:p-4 fade-in">
      {/* Room header */}
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {formatRoomDisplay(room)}
          </h3>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Current class info */}
      {currentClass && (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {currentClass.courseCode}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <span>{getBatchLabel(currentClass.batch)}</span>
            {currentClass.teacherCode && (
              <>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span title={currentClass.teacherCode}>
                  {TEACHER_NAME_MAP[currentClass.teacherCode] ?? currentClass.teacherCode}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {formatTime12h(currentClass.startTime)} – {formatTime12h(currentClass.endTime)}
          </p>
          {timeUntilFree && (
            <p className="text-xs text-[var(--color-status-occupied)] font-medium">
              Free in {timeUntilFree}
            </p>
          )}
        </div>
      )}

      {/* Upcoming class for available/upcoming rooms */}
      {!currentClass && nextClass && (
        <div className="space-y-1">
          <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide">
            Next
          </p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {nextClass.courseCode}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <span>{getBatchLabel(nextClass.batch)}</span>
            {nextClass.teacherCode && (
              <>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span title={nextClass.teacherCode}>
                  {TEACHER_NAME_MAP[nextClass.teacherCode] ?? nextClass.teacherCode}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {formatTime12h(nextClass.startTime)} – {formatTime12h(nextClass.endTime)}
          </p>
          {timeUntilNext && (
            <p className="text-xs text-[var(--color-status-upcoming)] font-medium">
              Starts in {timeUntilNext}
            </p>
          )}
        </div>
      )}

      {/* No classes at all */}
      {!currentClass && !nextClass && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
          No scheduled classes
        </p>
      )}
    </div>
  );
}

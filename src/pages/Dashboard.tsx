import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, Clock, CalendarDays } from 'lucide-react';
import { useLiveTime } from '../hooks/useLiveTime';
import { formatCurrentTime, formatDate, getDayName, getCurrentDay, formatTime12h } from '../utils/timeUtils';
import { getAllRoomStatuses, getCurrentlyRunningClasses, getUpcomingClasses } from '../services/roomAllocationService';
import { RoomCard } from '../components/dashboard/RoomCard';
import { GlobalSearch } from '../components/search/GlobalSearch';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';
import type { RoomStatus } from '../types/routine';
import { getBatchLabel } from '../types/routine';
import { TEACHER_NAME_MAP } from '../data/routine';

type StatusFilter = 'all' | RoomStatus;

export function Dashboard() {
  const now = useLiveTime();
  const [filter, setFilter] = useState<StatusFilter>('all');

  // Recalculate every minute (driven by live clock)
  const roomStatuses = useMemo(() => {
    void now;
    return getAllRoomStatuses();
  }, [now]);
  const runningClasses = useMemo(() => {
    void now;
    return getCurrentlyRunningClasses();
  }, [now]);
  const upcomingClasses = useMemo(() => {
    void now;
    return getUpcomingClasses();
  }, [now]);

  const summary = useMemo(() => ({
    occupied: roomStatuses.filter(r => r.status === 'occupied').length,
    available: roomStatuses.filter(r => r.status === 'available').length,
    upcoming: roomStatuses.filter(r => r.status === 'upcoming').length,
  }), [roomStatuses]);

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return roomStatuses;
    return roomStatuses.filter(r => r.status === filter);
  }, [roomStatuses, filter]);

  const currentDay = getCurrentDay();
  const dayName = getDayName(now);
  const isWorkDay = currentDay !== null;

  return (
    <div className="space-y-5 fade-in">
      {/* Page header with time & search */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={16} className="text-[var(--color-status-occupied)] pulse-live" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Live Room Allocation
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <span>{dayName}</span>
            <span className="text-[var(--color-text-muted)]">·</span>
            <span>{formatDate(now)}</span>
            <span className="text-[var(--color-text-muted)]">·</span>
            <span className="font-medium tabular-nums">{formatCurrentTime(now)}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <GlobalSearch />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter(filter === 'occupied' ? 'all' : 'occupied')}
          className={`card p-3 text-left transition-all ${filter === 'occupied' ? 'ring-2 ring-[var(--color-status-occupied)]' : ''}`}
        >
          <p className="text-2xl font-bold text-[var(--color-status-occupied)]">{summary.occupied}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Occupied</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'available' ? 'all' : 'available')}
          className={`card p-3 text-left transition-all ${filter === 'available' ? 'ring-2 ring-[var(--color-status-available)]' : ''}`}
        >
          <p className="text-2xl font-bold text-[var(--color-status-available)]">{summary.available}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Available</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'upcoming' ? 'all' : 'upcoming')}
          className={`card p-3 text-left transition-all ${filter === 'upcoming' ? 'ring-2 ring-[var(--color-status-upcoming)]' : ''}`}
        >
          <p className="text-2xl font-bold text-[var(--color-status-upcoming)]">{summary.upcoming}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Upcoming</p>
        </button>
      </div>

      {/* Non-working day message */}
      {!isWorkDay && (
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            No classes are scheduled on {dayName}s.
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Classes run Saturday through Wednesday.
          </p>
        </div>
      )}

      {/* Room grid */}
      <section aria-label="Room status board">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
            Room Board
          </h3>
          <div className="flex items-center gap-1">
            {(['all', 'occupied', 'available', 'upcoming'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  filter === f
                    ? 'bg-[var(--color-accent)] text-white font-medium'
                    : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-secondary)]'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState message="No rooms match the selected filter." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredRooms.map((roomState) => (
              <RoomCard key={roomState.room} roomState={roomState} />
            ))}
          </div>
        )}
      </section>

      {/* Currently running classes */}
      {runningClasses.length > 0 && (
        <section aria-label="Currently running classes">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-3">
            <Clock size={14} className="inline mr-1.5 -mt-0.5" />
            Running Now
          </h3>
          <div className="card divide-y divide-[var(--color-border-light)]">
            {runningClasses.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status="occupied" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {entry.courseCode}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Room {entry.room} · {getBatchLabel(entry.batch)}
                      {entry.teacherCode ? ` · ${TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] flex-shrink-0 ml-2">
                  {formatTime12h(entry.startTime)} – {formatTime12h(entry.endTime)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming classes */}
      {upcomingClasses.length > 0 && (
        <section aria-label="Upcoming classes">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-3">
            <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
            Next Classes
          </h3>
          <div className="card divide-y divide-[var(--color-border-light)]">
            {upcomingClasses.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status="upcoming" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {entry.courseCode}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Room {entry.room} · {getBatchLabel(entry.batch)}
                      {entry.teacherCode ? ` · ${TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)] flex-shrink-0 ml-2">
                  {formatTime12h(entry.startTime)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick access links */}
      <section aria-label="Quick access" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/routines"
          className="card p-3 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Routines</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">View batch schedules</p>
            </div>
            <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </div>
        </Link>
        <Link
          to="/rooms"
          className="card p-3 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Rooms</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Room explorer</p>
            </div>
            <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </div>
        </Link>
        <Link
          to="/teachers"
          className="card p-3 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Teachers</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Faculty directory</p>
            </div>
            <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </div>
        </Link>
        <Link
          to="/routines"
          className="card p-3 hover:border-[var(--color-accent)] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">All Batches</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">4th to 8th Batch</p>
            </div>
            <ArrowRight size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </div>
        </Link>
      </section>
    </div>
  );
}

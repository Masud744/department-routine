import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useLiveTime } from '../hooks/useLiveTime';
import { getAllRoomStatuses, getRoomSchedule } from '../services/roomAllocationService';
import { getCurrentDay, formatTime12h, getDayName } from '../utils/timeUtils';
import { DAYS, getBatchLabel, getBatchName } from '../types/routine';
import { TEACHER_NAME_MAP } from '../data/routine';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import type { RoomStatus, Day } from '../types/routine';

type StatusFilter = 'all' | RoomStatus;

export function Rooms() {
  const now = useLiveTime();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | 'today'>('today');

  const roomStatuses = useMemo(() => {
    void now;
    return getAllRoomStatuses();
  }, [now]);
  const currentDay = getCurrentDay();

  const filteredRooms = useMemo(() => {
    let rooms = roomStatuses;
    if (filter !== 'all') {
      rooms = rooms.filter((r) => r.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      rooms = rooms.filter((r) => r.room.toLowerCase().includes(q));
    }
    return rooms;
  }, [roomStatuses, filter, searchQuery]);

  const scheduleDay = selectedDay === 'today' ? currentDay : selectedDay;

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Room Explorer
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {roomStatuses.length} rooms · {getDayName(now)}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="search"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-[var(--color-border-default)] rounded focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            aria-label="Search rooms"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'occupied', 'available', 'upcoming'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                filter === f
                  ? 'bg-[var(--color-accent)] text-white font-medium'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Room availability table */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[120px_110px_1fr_1fr_140px] gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          <span>Room</span>
          <span>Status</span>
          <span>Current Class</span>
          <span>Next Class</span>
          <span>Time</span>
        </div>

        {filteredRooms.length === 0 ? (
          <EmptyState
            message="No rooms found."
            description={searchQuery ? `No rooms match "${searchQuery}"` : 'Try changing the filter.'}
          />
        ) : (
          <div className="divide-y divide-[var(--color-border-light)]">
            {filteredRooms.map((roomState) => (
              <div key={roomState.room}>
                {/* Main row */}
                <button
                  onClick={() =>
                    setExpandedRoom(expandedRoom === roomState.room ? null : roomState.room)
                  }
                  className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                  aria-expanded={expandedRoom === roomState.room}
                >
                  {/* Mobile layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {roomState.room.startsWith('LAB-') || roomState.room === 'IOT-LAB'
                          ? roomState.room
                          : `Room ${roomState.room}`}
                      </span>
                      <StatusBadge status={roomState.status} />
                    </div>
                    {roomState.currentClass && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {roomState.currentClass.courseCode} · {getBatchLabel(roomState.currentClass.batch)}
                        {roomState.currentClass.teacherCode
                          ? ` · ${TEACHER_NAME_MAP[roomState.currentClass.teacherCode] ?? roomState.currentClass.teacherCode}`
                          : ''}
                      </p>
                    )}
                    {!roomState.currentClass && roomState.nextClass && (
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        Next: {roomState.nextClass.courseCode} ({getBatchName(roomState.nextClass.batch)}) at{' '}
                        {formatTime12h(roomState.nextClass.startTime)}
                      </p>
                    )}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-[120px_110px_1fr_1fr_140px] gap-2 items-center">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {roomState.room.startsWith('LAB-') || roomState.room === 'IOT-LAB'
                        ? roomState.room
                        : `Room ${roomState.room}`}
                    </span>
                    <StatusBadge status={roomState.status} />
                    <div>
                      {roomState.currentClass ? (
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {roomState.currentClass.courseCode}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            {getBatchLabel(roomState.currentClass.batch)}
                            {roomState.currentClass.teacherCode
                              ? ` · ${TEACHER_NAME_MAP[roomState.currentClass.teacherCode] ?? roomState.currentClass.teacherCode}`
                              : ''}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </div>
                    <div>
                      {roomState.nextClass ? (
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {roomState.nextClass.courseCode}
                          </p>
                          <p className="text-xs text-[var(--color-text-tertiary)]">
                            {getBatchLabel(roomState.nextClass.batch)}
                            {roomState.nextClass.teacherCode
                              ? ` · ${TEACHER_NAME_MAP[roomState.nextClass.teacherCode] ?? roomState.nextClass.teacherCode}`
                              : ''}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-text-muted)]">—</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] tabular-nums">
                      {roomState.currentClass && (
                        <p>
                          {formatTime12h(roomState.currentClass.startTime)} –{' '}
                          {formatTime12h(roomState.currentClass.endTime)}
                        </p>
                      )}
                      {roomState.nextClass && !roomState.currentClass && (
                        <p>{formatTime12h(roomState.nextClass.startTime)}</p>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded schedule */}
                {expandedRoom === roomState.room && (
                  <div className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                        Full Schedule
                      </h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDay('today')}
                          className={`px-2 py-0.5 text-[11px] rounded ${
                            selectedDay === 'today'
                              ? 'bg-[var(--color-accent)] text-white'
                              : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
                          }`}
                        >
                          Today
                        </button>
                        {DAYS.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-2 py-0.5 text-[11px] rounded ${
                              selectedDay === day
                                ? 'bg-[var(--color-accent)] text-white'
                                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                    {scheduleDay ? (
                      (() => {
                        const schedule = getRoomSchedule(roomState.room, scheduleDay);
                        if (schedule.length === 0) {
                          return (
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              No classes scheduled on {scheduleDay}
                            </p>
                          );
                        }
                        return (
                          <div className="space-y-1.5">
                            {schedule.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between text-xs bg-white rounded px-3 py-2 border border-[var(--color-border-light)]"
                              >
                                <div>
                                  <span className="font-medium text-[var(--color-text-primary)]">
                                    {entry.courseCode}
                                  </span>
                                  <span className="text-[var(--color-text-tertiary)] ml-2">
                                    {getBatchLabel(entry.batch)}
                                    {entry.teacherCode ? ` · ${TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}` : ''}
                                  </span>
                                </div>
                                <span className="text-[var(--color-text-tertiary)] tabular-nums">
                                  {formatTime12h(entry.startTime)} – {formatTime12h(entry.endTime)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-[var(--color-text-tertiary)]">
                        No classes today (Thursday/Friday)
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

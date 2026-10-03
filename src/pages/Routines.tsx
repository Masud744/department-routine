import { useState, useMemo, Fragment } from 'react';
import { LayoutGrid, List, Clock } from 'lucide-react';
import {
  getRoutineForBatch,
  getRoutineCell,
  getCurrentClassForBatch,
  getNextClassForBatch,
  BATCHES,
  DAYS,
  TIME_SLOTS,
} from '../services/routineService';
import { isCurrentlyRunning } from '../services/routineService';
import { formatTime12h, getCurrentDay } from '../utils/timeUtils';
import { useLiveTime } from '../hooks/useLiveTime';
import { TEACHER_NAME_MAP } from '../data/routine';
import type { Batch, Day } from '../types/routine';
import { getBatchLabel, getBatchName } from '../types/routine';

type ViewMode = 'timetable' | 'list';

export function Routines() {
  const now = useLiveTime();
  const [selectedBatch, setSelectedBatch] = useState<Batch>('2025-26');
  const [viewMode, setViewMode] = useState<ViewMode>('timetable');
  const [dayFilter, setDayFilter] = useState<Day | 'all'>('all');

  const batchEntries = useMemo(() => getRoutineForBatch(selectedBatch), [selectedBatch]);
  const currentClass = useMemo(() => {
    void now;
    return getCurrentClassForBatch(selectedBatch);
  }, [selectedBatch, now]);
  const nextClass = useMemo(() => {
    void now;
    return getNextClassForBatch(selectedBatch);
  }, [selectedBatch, now]);
  const currentDay = getCurrentDay();

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Class Routine
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {getBatchLabel(selectedBatch)} · {batchEntries.length} scheduled classes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center border border-[var(--color-border-default)] rounded overflow-hidden">
            <button
              onClick={() => setViewMode('timetable')}
              className={`p-1.5 ${viewMode === 'timetable' ? 'bg-[var(--color-accent)] text-white' : 'bg-white text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'}`}
              aria-label="Timetable view"
              title="Timetable view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-[var(--color-accent)] text-white' : 'bg-white text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'}`}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Batch selector */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mr-1">
          Batch
        </label>
        {BATCHES.map((batch) => (
          <button
            key={batch}
            onClick={() => setSelectedBatch(batch)}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              selectedBatch === batch
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] font-medium shadow-sm'
                : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border-default)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            <span>{getBatchName(batch)}</span>
            <span className="text-xs ml-1.5 opacity-80 font-normal">({batch})</span>
          </button>
        ))}
      </div>

      {/* Current / Next class indicator */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="card p-3 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-[var(--color-now-text)]" />
            <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
              Current Class
            </span>
          </div>
          {currentClass ? (
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {currentClass.courseCode}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Room {currentClass.room}
                {currentClass.teacherCode ? ` · ${TEACHER_NAME_MAP[currentClass.teacherCode] ?? currentClass.teacherCode}` : ''}
                {' · '}{formatTime12h(currentClass.startTime)} – {formatTime12h(currentClass.endTime)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">No class running</p>
          )}
        </div>
        <div className="card p-3 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
              Next Class
            </span>
          </div>
          {nextClass ? (
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {nextClass.courseCode}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Room {nextClass.room}
                {nextClass.teacherCode ? ` · ${TEACHER_NAME_MAP[nextClass.teacherCode] ?? nextClass.teacherCode}` : ''}
                {' · '}{formatTime12h(nextClass.startTime)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-tertiary)]">No upcoming class today</p>
          )}
        </div>
      </div>

      {/* Day filter for list view */}
      {viewMode === 'list' && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDayFilter('all')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              dayFilter === 'all'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            All Days
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                dayFilter === day
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* Timetable view */}
      {viewMode === 'timetable' && (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[700px] px-4 sm:px-0">
            <div className="timetable-grid">
              {/* Header row */}
              <div className="timetable-header">Day</div>
              {TIME_SLOTS.map((slot) => (
                <div key={slot.slotNumber} className="timetable-header">
                  <div>{formatTime12h(slot.startTime)}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] font-normal">
                    {formatTime12h(slot.endTime)}
                  </div>
                </div>
              ))}

              {/* Body rows */}
              {DAYS.map((day) => (
                <Fragment key={day}>
                  <div
                    className={`timetable-day ${day === (currentDay ?? '') ? 'bg-[var(--color-now-bg)]' : ''}`}
                  >
                    {day === (currentDay ?? '') && (
                      <span className="status-dot occupied pulse-live" aria-label="Today" />
                    )}
                    {day.slice(0, 3)}
                  </div>
                  {TIME_SLOTS.map((slot) => {
                    const entries = getRoutineCell(selectedBatch, day, slot.slotNumber);
                    const hasRunning = entries.some(isCurrentlyRunning);
                    return (
                      <div
                        key={`${day}-${slot.slotNumber}`}
                        className={`timetable-cell ${hasRunning ? 'class-now' : ''}`}
                      >
                        {entries.length === 0 ? (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        ) : (
                          <div className="space-y-1.5">
                            {entries.map((entry) => (
                              <div key={entry.id}>
                                {hasRunning && entries.indexOf(entry) === 0 && (
                                  <span className="text-[10px] font-semibold text-[var(--color-now-text)] uppercase tracking-wider block mb-0.5">
                                    Now
                                  </span>
                                )}
                                <div className="course-code">{entry.courseCode}</div>
                                <div className="room-info">{entry.room}</div>
                                {entry.teacherCode && (
                                  <div
                                    className="teacher-info"
                                    title={TEACHER_NAME_MAP[entry.teacherCode] ? `${TEACHER_NAME_MAP[entry.teacherCode]} (${entry.teacherCode})` : entry.teacherCode}
                                  >
                                    {TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {DAYS
            .filter((day) => dayFilter === 'all' || dayFilter === day)
            .map((day) => {
              const dayEntries = batchEntries
                .filter((e) => e.day === day)
                .sort((a, b) => a.slotNumber - b.slotNumber);

              return (
                <div key={day}>
                  <div className={`flex items-center gap-2 mb-2 py-1 px-2 rounded ${
                    day === (currentDay ?? '') ? 'bg-[var(--color-now-bg)]' : ''
                  }`}>
                    {day === (currentDay ?? '') && (
                      <span className="status-dot occupied pulse-live" />
                    )}
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
                      {day}
                    </h3>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {dayEntries.length} class{dayEntries.length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  {dayEntries.length === 0 ? (
                    <div className="card px-4 py-3">
                      <p className="text-sm text-[var(--color-text-tertiary)]">No classes scheduled</p>
                    </div>
                  ) : (
                    <div className="card divide-y divide-[var(--color-border-light)]">
                      {dayEntries.map((entry) => {
                        const running = isCurrentlyRunning(entry);
                        return (
                          <div
                            key={entry.id}
                            className={`px-4 py-3 ${running ? 'class-now' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {running && (
                                  <span className="text-[10px] font-semibold text-[var(--color-now-text)] uppercase tracking-wider block mb-0.5">
                                    Currently Running
                                  </span>
                                )}
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                  {entry.courseCode}
                                </p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                  Room {entry.room}
                                  {entry.teacherCode ? ` · ${TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}` : ''}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-medium text-[var(--color-text-secondary)] tabular-nums">
                                  {formatTime12h(entry.startTime)}
                                </p>
                                <p className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
                                  {formatTime12h(entry.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

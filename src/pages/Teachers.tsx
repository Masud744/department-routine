import { useState, useMemo } from 'react';
import { TEACHER_DIRECTORY } from '../data/teachers';
import { DAYS, getBatchLabel, getBatchName } from '../types/routine';
import { formatTime12h } from '../utils/timeUtils';
import { isCurrentlyRunning } from '../services/routineService';
import { useLiveTime } from '../hooks/useLiveTime';

export function Teachers() {
  const now = useLiveTime();
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  // Get unique rooms and days per teacher
  const enrichedTeachers = useMemo(() => {
    void now;
    return TEACHER_DIRECTORY.map((teacher) => {
      const uniqueRooms = [...new Set(teacher.classes.map((c) => c.room))];
      const uniqueBatches = [...new Set(teacher.classes.map((c) => c.batch))];
      const uniqueCourses = [...new Set(teacher.classes.map((c) => c.courseCode))];
      const currentlyTeaching = teacher.classes.find(isCurrentlyRunning);
      return {
        ...teacher,
        uniqueRooms,
        uniqueBatches,
        uniqueCourses,
        currentlyTeaching,
      };
    });
  }, [now]);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Faculty Directory
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {TEACHER_DIRECTORY.length} faculty members · Class routines & schedules
        </p>
      </div>

      {/* Teacher list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {enrichedTeachers.map((teacher) => (
          <div key={teacher.code} className="card overflow-hidden">
            {/* Header */}
            <button
              onClick={() =>
                setExpandedTeacher(expandedTeacher === teacher.code ? null : teacher.code)
              }
              className="w-full text-left p-4 hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-expanded={expandedTeacher === teacher.code}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-border-default)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--color-accent)]">
                        {teacher.code}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {teacher.fullName ?? teacher.code}
                      </h3>
                      {teacher.fullName && (
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          Teacher Code: <span className="font-medium text-[var(--color-text-secondary)]">{teacher.code}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {teacher.currentlyTeaching && (
                  <span className="text-[10px] font-semibold text-[var(--color-now-text)] bg-[var(--color-now-bg)] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Teaching
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
                <span>{teacher.classes.length} classes</span>
                <span>{teacher.uniqueCourses.length} courses</span>
                <span>{teacher.uniqueRooms.length} rooms</span>
                <span>{teacher.uniqueBatches.map(b => getBatchName(b)).join(', ')}</span>
              </div>
            </button>

            {/* Expanded schedule */}
            {expandedTeacher === teacher.code && (
              <div className="border-t border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] p-3">
                <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
                  Weekly Schedule
                </h4>
                {DAYS.map((day) => {
                  const dayClasses = teacher.classes
                    .filter((c) => c.day === day)
                    .sort((a, b) => a.slotNumber - b.slotNumber);
                  if (dayClasses.length === 0) return null;
                  return (
                    <div key={day} className="mb-2 last:mb-0">
                      <p className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
                        {day}
                      </p>
                      <div className="space-y-1">
                        {dayClasses.map((entry) => {
                          const running = isCurrentlyRunning(entry);
                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between text-xs bg-white rounded px-2.5 py-1.5 border border-[var(--color-border-light)] ${
                                running ? 'class-now' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {running && (
                                  <span className="status-dot occupied pulse-live" />
                                )}
                                <span className="font-medium text-[var(--color-text-primary)]">
                                  {entry.courseCode}
                                </span>
                                <span className="text-[var(--color-text-tertiary)]">
                                  Room {entry.room} · {getBatchLabel(entry.batch)}
                                </span>
                              </div>
                              <span className="text-[var(--color-text-tertiary)] tabular-nums flex-shrink-0 ml-2">
                                {formatTime12h(entry.startTime)} – {formatTime12h(entry.endTime)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

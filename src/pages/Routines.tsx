import { useState, useMemo, Fragment } from 'react';
import { LayoutGrid, Calendar, Clock, MapPin, User } from 'lucide-react';
import {
  getRoutineForBatch,
  getRoutineCell,
  getRoutineForBatchDay,
  BATCHES,
  DAYS,
  TIME_SLOTS,
} from '../services/routineService';
import { isCurrentlyRunning } from '../services/routineService';
import { formatTime12h, getCurrentDay } from '../utils/timeUtils';
import { useBatchSelection } from '../hooks/useBatchSelection';
import { TEACHER_NAME_MAP } from '../data/routine';
import type { Batch, Day } from '../types/routine';
import { getBatchLabel, getBatchName } from '../types/routine';

type ViewMode = 'days' | 'matrix';

export function Routines() {
  const { selectedBatch, setSelectedBatch } = useBatchSelection();
  const currentDay = getCurrentDay();
  const [selectedDay, setSelectedDay] = useState<Day>(() => currentDay ?? 'Saturday');
  const [viewMode, setViewMode] = useState<ViewMode>('days');

  const batchEntries = useMemo(() => getRoutineForBatch(selectedBatch), [selectedBatch]);
  const dayClasses = useMemo(() => {
    return getRoutineForBatchDay(selectedBatch, selectedDay).sort(
      (a, b) => a.slotNumber - b.slotNumber
    );
  }, [selectedBatch, selectedDay]);

  const dayAbbr: Record<Day, { short: string; label: string }> = {
    Saturday: { short: 'S', label: 'Sat' },
    Sunday: { short: 'S', label: 'Sun' },
    Monday: { short: 'M', label: 'Mon' },
    Tuesday: { short: 'T', label: 'Tue' },
    Wednesday: { short: 'W', label: 'Wed' },
  };

  return (
    <div className="space-y-5">
      {/* 1. Page Header & View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Academic Routine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {getBatchLabel(selectedBatch)} · {batchEntries.length} classes scheduled
          </p>
        </div>

        {/* View toggle (Days vs Matrix) */}
        <div className="flex items-center bg-[#111A28] border border-white/10 p-0.5 rounded-xl">
          <button
            onClick={() => setViewMode('days')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'days'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Day-by-Day View"
          >
            <Calendar size={13} />
            <span>Day</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'matrix'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Full Matrix Grid"
          >
            <LayoutGrid size={13} />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* 2. Batch Selector Horizontal Scrollable Pills */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
          Select Batch
        </label>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {BATCHES.map((batch: Batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBatch === batch
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-[#121926] text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <span>{getBatchName(batch)}</span>
              <span className={`text-[10px] ${selectedBatch === batch ? 'text-cyan-950' : 'text-slate-500'}`}>
                ({batch})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Day-by-Day Mobile View (Default & Primary Mobile Mode) */}
      {viewMode === 'days' && (
        <div className="space-y-4">
          {/* Day Selector Strip */}
          <div className="grid grid-cols-5 gap-2">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = currentDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all relative ${
                    isSelected ? 'active-day-pill' : 'inactive-day-pill'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className={`text-[11px] font-medium tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                    {dayAbbr[day].short}
                  </span>
                  <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-black' : 'text-white'}`}>
                    {dayAbbr[day].label}
                  </span>
                  {isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        isSelected ? 'bg-cyan-600' : 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                      }`}
                      title="Today"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Classes List for Selected Day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-300">
                {selectedDay} Classes ({getBatchName(selectedBatch)})
              </span>
              <span className="text-slate-500 text-[11px]">
                {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
              </span>
            </div>

            {dayClasses.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 space-y-1">
                <Calendar size={24} className="mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-white">No classes on {selectedDay}</p>
                <p className="text-xs text-slate-500">Pick another day from the bar above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayClasses.map((entry) => {
                  const running = isCurrentlyRunning(entry);
                  const teacherName = entry.teacherCode
                    ? TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode
                    : 'Faculty';

                  return (
                    <div
                      key={entry.id}
                      className={`glass-card p-4 transition-all ${
                        running
                          ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">
                              {entry.courseCode}
                            </span>
                            {running && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-cyan-400" />
                              <span className="font-medium text-white">
                                {entry.room.startsWith('LAB') || entry.room === 'IOT-LAB' ? entry.room : `Room ${entry.room}`}
                              </span>
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="flex items-center gap-1">
                              <User size={12} className="text-slate-400" />
                              <span>{teacherName}</span>
                              {entry.teacherCode && (
                                <span className="text-[10px] text-slate-500">({entry.teacherCode})</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Slot Badge */}
                        <div className="text-right flex-shrink-0">
                          <div className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-cyan-400 flex items-center gap-1">
                            <Clock size={11} />
                            <span>Slot {entry.slotNumber}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-1 tabular-nums">
                            {formatTime12h(entry.startTime)} – {formatTime12h(entry.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Full Matrix View (Horizontal Scrolling Dark Grid) */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 px-1">
            Horizontal scrollable timetable for {getBatchLabel(selectedBatch)}:
          </p>
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[720px] timetable-grid-dark">
              {/* Header row */}
              <div className="timetable-header-dark">Day</div>
              {TIME_SLOTS.map((slot) => (
                <div key={slot.slotNumber} className="timetable-header-dark">
                  <div className="text-white font-bold">{formatTime12h(slot.startTime)}</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {formatTime12h(slot.endTime)}
                  </div>
                </div>
              ))}

              {/* Rows */}
              {DAYS.map((day) => (
                <Fragment key={day}>
                  <div className={`timetable-day-dark ${day === (currentDay ?? '') ? 'bg-cyan-950/40 text-cyan-400 font-bold' : ''}`}>
                    <span>{day.slice(0, 3)}</span>
                    {day === (currentDay ?? '') && (
                      <span className="text-[9px] text-cyan-400 font-normal">Today</span>
                    )}
                  </div>

                  {TIME_SLOTS.map((slot) => {
                    const entries = getRoutineCell(selectedBatch, day, slot.slotNumber);
                    const hasRunning = entries.some(isCurrentlyRunning);

                    return (
                      <div
                        key={`${day}-${slot.slotNumber}`}
                        className={`timetable-cell-dark ${hasRunning ? 'is-now' : ''}`}
                      >
                        {entries.length === 0 ? (
                          <span className="text-xs text-slate-600 block text-center mt-6">—</span>
                        ) : (
                          <div className="space-y-1.5">
                            {entries.map((entry) => (
                              <div key={entry.id} className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                                <div className="text-xs font-bold text-white truncate">
                                  {entry.courseCode}
                                </div>
                                <div className="text-[11px] text-cyan-400 font-medium truncate">
                                  {entry.room}
                                </div>
                                {entry.teacherCode && (
                                  <div
                                    className="text-[10px] text-slate-400 truncate"
                                    title={TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}
                                  >
                                    {entry.teacherCode}
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
    </div>
  );
}

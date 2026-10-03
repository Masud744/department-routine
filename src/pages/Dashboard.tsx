import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  User,
  DoorOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useLiveTime } from '../hooks/useLiveTime';
import { useBatchSelection } from '../hooks/useBatchSelection';
import {
  getCurrentDay,
  formatTime12h,
  timeToMinutes,
  getCurrentTimeMinutes,
} from '../utils/timeUtils';
import {
  getRoutineForBatchDay,
  getCurrentClassForBatch,
  getNextClassForBatch,
  isCurrentlyRunning,
} from '../services/routineService';
import { getAllRoomStatuses } from '../services/roomAllocationService';
import { DAYS, getBatchName, getBatchLabel } from '../types/routine';
import { TEACHER_NAME_MAP } from '../data/routine';
import type { Day } from '../types/routine';

export function Dashboard() {
  const now = useLiveTime();
  const navigate = useNavigate();
  const { selectedBatch } = useBatchSelection();

  const currentDay = getCurrentDay();
  const [activeDay, setActiveDay] = useState<Day>(() => currentDay ?? 'Saturday');

  // Recalculate driven by live clock
  const currentClass = useMemo(() => {
    void now;
    return getCurrentClassForBatch(selectedBatch);
  }, [selectedBatch, now]);

  const nextClass = useMemo(() => {
    void now;
    return getNextClassForBatch(selectedBatch);
  }, [selectedBatch, now]);

  const activeDayClasses = useMemo(() => {
    return getRoutineForBatchDay(selectedBatch, activeDay).sort(
      (a, b) => a.slotNumber - b.slotNumber
    );
  }, [selectedBatch, activeDay]);

  const roomStatuses = useMemo(() => {
    void now;
    return getAllRoomStatuses();
  }, [now]);

  const roomSummary = useMemo(() => ({
    occupied: roomStatuses.filter((r) => r.status === 'occupied').length,
    available: roomStatuses.filter((r) => r.status === 'available').length,
    upcoming: roomStatuses.filter((r) => r.status === 'upcoming').length,
  }), [roomStatuses]);

  // Featured hero class (current running class or next upcoming class)
  const heroClass = currentClass || (currentDay === activeDay ? nextClass : null) || (activeDayClasses.length > 0 ? activeDayClasses[0] : null);
  const isHeroLive = currentClass && heroClass?.id === currentClass.id;

  // Day abbreviations for the week strip
  const dayAbbr: Record<Day, { short: string; label: string }> = {
    Saturday: { short: 'S', label: 'Sat' },
    Sunday: { short: 'S', label: 'Sun' },
    Monday: { short: 'M', label: 'Mon' },
    Tuesday: { short: 'T', label: 'Tue' },
    Wednesday: { short: 'W', label: 'Wed' },
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section: Title & Batch Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Today Class
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Routine for <span className="text-cyan-400 font-medium">{getBatchName(selectedBatch)}</span>
          </p>
        </div>

        <Link
          to="/routines"
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>Full Routine</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* 2. Featured Hero Card (Matching Reference Screen center card) */}
      {heroClass ? (
        <div className="hero-live-card p-5 relative group">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 max-w-[70%]">
              {/* Status pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-medium">
                {isHeroLive ? (
                  <>
                    <span className="live-radar-dot" />
                    <span className="text-rose-400 font-semibold tracking-wide">LIVE NOW</span>
                  </>
                ) : heroClass === nextClass ? (
                  <>
                    <Clock size={12} className="text-amber-400" />
                    <span className="text-amber-400 font-semibold">UPCOMING NEXT</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={12} className="text-cyan-400" />
                    <span className="text-cyan-400 font-medium">Scheduled</span>
                  </>
                )}
              </div>

              {/* Course Title */}
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                  {heroClass.courseCode}
                </h3>
                <p className="text-xs text-slate-300 font-normal mt-0.5 flex items-center gap-1.5">
                  <span>{heroClass.room.startsWith('LAB') || heroClass.room === 'IOT-LAB' ? heroClass.room : `Room ${heroClass.room}`}</span>
                  <span className="text-slate-500">•</span>
                  <span>{heroClass.teacherCode ? (TEACHER_NAME_MAP[heroClass.teacherCode] ?? heroClass.teacherCode) : 'Assigned Faculty'}</span>
                </p>
              </div>

              {/* Time display */}
              <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                <Clock size={13} className="text-slate-400" />
                <span className="font-medium text-white tabular-nums">
                  {formatTime12h(heroClass.startTime)} – {formatTime12h(heroClass.endTime)}
                </span>
              </div>
            </div>

            {/* Functional Slot/Room Badge */}
            <div className="flex flex-col items-end justify-between flex-shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Slot {heroClass.slotNumber}
                </span>
                <span className="text-xs font-bold text-cyan-400 tabular-nums">
                  {heroClass.startTime}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => navigate(`/rooms?room=${encodeURIComponent(heroClass.room)}`)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <DoorOpen size={14} />
              <span>Locate {heroClass.room}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-medium">
              {getBatchLabel(heroClass.batch)}
            </span>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 text-center space-y-2">
          <Calendar size={28} className="mx-auto text-slate-500" />
          <p className="text-sm font-semibold text-white">No classes scheduled</p>
          <p className="text-xs text-slate-400">Enjoy your break or explore room occupancy below.</p>
        </div>
      )}

      {/* 3. Horizontal Interactive Week Strip (Exactly like Center Phone in Reference) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold text-slate-300">Weekly Schedule</span>
          {currentDay && (
            <span className="text-[11px] text-cyan-400 font-medium">
              Today is {currentDay}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DAYS.map((day) => {
            const isSelected = activeDay === day;
            const isToday = currentDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all relative ${
                  isSelected ? 'active-day-pill' : 'inactive-day-pill'
                }`}
                aria-pressed={isSelected}
              >
                {/* Day of Week Initial */}
                <span className={`text-[11px] font-medium tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {dayAbbr[day].short}
                </span>

                {/* Day Name */}
                <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-black' : 'text-white'}`}>
                  {dayAbbr[day].label}
                </span>

                {/* Today indicator dot */}
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
      </div>

      {/* 4. Timeline Schedule List for Selected Day (Reference center list) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <h4 className="font-semibold text-slate-300">
            {activeDay} Classes
          </h4>
          <span className="text-slate-500 text-[11px]">
            {activeDayClasses.length} {activeDayClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {activeDayClasses.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-400 space-y-1">
            <p className="text-sm font-medium text-slate-300">No classes scheduled on {activeDay}</p>
            <p className="text-xs text-slate-500">Pick another day from the bar above to view the routine.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDayClasses.map((entry) => {
              const running = isCurrentlyRunning(entry);
              const teacherName = entry.teacherCode
                ? TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode
                : 'Faculty';

              const currentMinutes = getCurrentTimeMinutes();
              const endMinutes = timeToMinutes(entry.endTime);
              const isPast = currentDay === activeDay && currentMinutes >= endMinutes;

              return (
                <div
                  key={entry.id}
                  className={`glass-card p-3.5 flex items-center justify-between gap-3 transition-all ${
                    running
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : isPast
                      ? 'opacity-60 bg-white/[0.02]'
                      : ''
                  }`}
                >
                  {/* Left: Time Icon Badge */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                        running
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : isPast
                          ? 'bg-white/5 border-white/5 text-slate-500'
                          : 'bg-white/5 border-white/10 text-cyan-400'
                      }`}
                    >
                      {isPast ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>

                    {/* Middle: Course Code & Teacher/Room */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {entry.courseCode}
                        </span>
                        {running && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin size={11} className="text-slate-500 flex-shrink-0" />
                          {entry.room.startsWith('LAB') || entry.room === 'IOT-LAB' ? entry.room : `Room ${entry.room}`}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 truncate">
                          <User size={11} className="text-slate-500 flex-shrink-0" />
                          {teacherName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Slot Badge */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-white block tabular-nums">
                      {formatTime12h(entry.startTime)}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {formatTime12h(entry.endTime)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Live Campus Room Occupancy Mini-Radar */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs px-1">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <DoorOpen size={14} className="text-cyan-400" />
            <span>Live Room Radar</span>
          </h4>
          <Link to="/rooms" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Explore All Rooms →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Occupied */}
          <Link
            to="/rooms?filter=occupied"
            className="glass-card p-3 text-center hover:border-rose-500/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto mb-1.5 shadow-[0_0_8px_#f43f5e]" />
            <span className="text-xl font-extrabold text-white block tabular-nums">
              {roomSummary.occupied}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Occupied</span>
          </Link>

          {/* Available */}
          <Link
            to="/rooms?filter=available"
            className="glass-card p-3 text-center hover:border-emerald-500/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1.5 shadow-[0_0_8px_#34d399]" />
            <span className="text-xl font-extrabold text-emerald-400 block tabular-nums">
              {roomSummary.available}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Available</span>
          </Link>

          {/* Upcoming */}
          <Link
            to="/rooms?filter=upcoming"
            className="glass-card p-3 text-center hover:border-amber-500/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto mb-1.5 shadow-[0_0_8px_#fbbf24]" />
            <span className="text-xl font-extrabold text-amber-400 block tabular-nums">
              {roomSummary.upcoming}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Upcoming</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

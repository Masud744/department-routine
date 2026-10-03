import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
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
import { formatRoomDisplay } from '../data/rooms';
import type { Day } from '../types/routine';
import { DynamicWeatherBackground } from '../components/common/DynamicWeatherBackground';
import { useWeather } from '../hooks/useWeather';
import { VacantRoomFinderModal } from '../components/rooms/VacantRoomFinderModal';

export function Dashboard() {
  const now = useLiveTime();
  const navigate = useNavigate();
  const { selectedBatch } = useBatchSelection();

  const currentDay = getCurrentDay();
  const [activeDay, setActiveDay] = useState<Day>(() => currentDay ?? 'Saturday');
  const [isVacantModalOpen, setIsVacantModalOpen] = useState(false);
  const weather = useWeather();

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
          <h2 className="text-2xl font-black text-white tracking-tight">
            Today Class
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Routine for <span className="text-cyan-400 font-semibold">{getBatchName(selectedBatch)}</span>
          </p>
        </div>

        <Link
          to="/routines"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>Full Routine</span>
          <ChevronRight size={14} className="stroke-[2.5]" />
        </Link>
      </div>

      {/* 2. Featured Hero Card with Grand Dynamic Celestial Sky & Architecture */}
      {heroClass ? (
        <div className="hero-live-card p-5 relative group overflow-hidden min-h-[210px] rounded-[26px] border border-white/10 shadow-2xl flex flex-col justify-between">
          {/* FULL-CARD DYNAMIC WEATHER ENVIRONMENT */}
          <DynamicWeatherBackground />

          {/* FOREGROUND CONTENT LAYER (Cleanly floating over frosted glass shield) */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            {/* Top row: Status on left, Slot Pill, Time & Weather on right */}
            <div className="flex items-center justify-between gap-2">
              {/* Status pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-xs font-medium backdrop-blur-md">
                {isHeroLive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                    <span className="text-rose-400 font-bold tracking-wide">LIVE NOW</span>
                  </>
                ) : heroClass === nextClass ? (
                  <>
                    <Clock size={12} className="text-amber-400" />
                    <span className="text-amber-400 font-semibold">UPCOMING NEXT</span>
                  </>
                ) : (
                  <>
                    <Calendar size={12} className="text-cyan-400" />
                    <span className="text-cyan-400 font-medium">Scheduled</span>
                  </>
                )}
              </div>

              {/* Functional Slot/Time/Weather on right */}
              <div className="flex items-center gap-1.5 xs:gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-[10px] font-bold text-slate-300 uppercase tracking-wider backdrop-blur-md">
                  SLOT {heroClass.slotNumber}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/35 text-xs font-bold text-cyan-300 tabular-nums backdrop-blur-md">
                  {formatTime12h(heroClass.startTime)}
                </span>
                {weather && (
                  <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-xs font-medium text-slate-200 backdrop-blur-md flex items-center gap-1">
                    <span>{weather.isDay ? '☀️' : '🌙'}</span>
                    <span>{weather.temperature}°C</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle row: Course Title, Room & Faculty, Time */}
            <div className="space-y-1.5 max-w-[66%]">
              <h3 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {heroClass.courseCode}
              </h3>
              <p className="text-xs text-slate-200 font-normal flex items-center gap-1.5 pt-0.5">
                <span className="font-semibold text-white">
                  {formatRoomDisplay(heroClass.room)}
                </span>
                <span className="text-slate-400">•</span>
                <span className="truncate">
                  {heroClass.teacherCode ? (TEACHER_NAME_MAP[heroClass.teacherCode] ?? heroClass.teacherCode) : 'Assigned Faculty'}
                </span>
              </p>

              {/* Time display */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                <Clock size={13} className="text-cyan-400" />
                <span className="font-medium text-white tabular-nums">
                  {formatTime12h(heroClass.startTime)} – {formatTime12h(heroClass.endTime)}
                </span>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => navigate(`/rooms?room=${encodeURIComponent(heroClass.room)}`)}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-400/25 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Locate {formatRoomDisplay(heroClass.room)}</span>
                <ChevronRight size={13} className="stroke-[2.5]" />
              </button>

              <span className="text-[11px] text-slate-300/80 font-medium">
                {getBatchLabel(heroClass.batch)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="hero-live-card p-5 relative overflow-hidden min-h-[150px] rounded-[26px] border border-white/10 flex items-center justify-between">
          <DynamicWeatherBackground />
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-400 backdrop-blur-md">
              <Calendar size={12} />
              <span>No Active Class</span>
            </div>
            <p className="text-base font-bold text-white">No classes running right now</p>
            <p className="text-xs text-slate-300">Enjoy your break or check vacant rooms for group study below.</p>
          </div>
        </div>
      )}

      {/* 2.5 Quick Action Banner: Find Vacant Room Now */}
      <div
        onClick={() => setIsVacantModalOpen(true)}
        className="glass-card p-3.5 rounded-2xl border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all active:scale-[0.99] group flex items-center justify-between gap-3 bg-[#0c1420]/80"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/10">
            <DoorOpen size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                Find Vacant Room Now
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                {roomSummary.available + roomSummary.upcoming} Free
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Check empty classrooms & labs for group study or self study.
            </p>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
      </div>

      {/* 3. Horizontal Interactive Week Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-sm text-white">Weekly Schedule</span>
          {currentDay && (
            <span className="text-xs text-cyan-400 font-semibold">
              Today is {currentDay}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DAYS.map((day) => {
            const isSelected = activeDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all relative ${
                  isSelected
                    ? 'bg-white text-slate-950 shadow-lg scale-[1.02]'
                    : 'bg-[#0c1420]/80 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={isSelected}
              >
                {/* Day of Week Initial */}
                <span className={`text-xs font-bold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {dayAbbr[day].short}
                </span>

                {/* Day Name */}
                <span className={`text-xs font-extrabold mt-0.5 ${isSelected ? 'text-black' : 'text-slate-300'}`}>
                  {dayAbbr[day].label}
                </span>

                {/* Cyan dot indicator when selected */}
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 bg-cyan-500 shadow-[0_0_6px_#06b6d4]"
                    title="Active Selection"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Timeline Schedule List for Selected Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1">
          <h4 className="font-bold text-sm text-white">
            {activeDay} Classes
          </h4>
          <span className="text-slate-400 text-xs font-medium">
            {activeDayClasses.length} {activeDayClasses.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {activeDayClasses.length === 0 ? (
          <div className="glass-card p-6 text-center text-slate-400 space-y-1 rounded-2xl border border-white/5">
            <p className="text-sm font-medium text-slate-300">No classes scheduled on {activeDay}</p>
            <p className="text-xs text-slate-500">Pick another day from the bar above to view the routine.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeDayClasses.map((entry, index) => {
              const running = isCurrentlyRunning(entry);
              const teacherName = entry.teacherCode
                ? TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode
                : 'Faculty';

              const isFirst = index === 0;

              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all ${
                    running || (isFirst && currentDay === activeDay)
                      ? 'border border-cyan-400/90 bg-gradient-to-r from-cyan-950/40 via-[#0d1624] to-[#0c1420] shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-[#0c1420]/80 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Left: Circle Icon Indicator */}
                  <div className="flex items-center gap-3 min-w-0">
                    {running || (isFirst && currentDay === activeDay) ? (
                      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                    )}

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

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                        <span className="text-slate-300">
                          {formatRoomDisplay(entry.room)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="truncate">
                          {teacherName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Slot & Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block tabular-nums">
                        {formatTime12h(entry.startTime)}
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {formatTime12h(entry.endTime)}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-500" />
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

      {/* Vacant Room Finder Modal */}
      <VacantRoomFinderModal
        isOpen={isVacantModalOpen}
        onClose={() => setIsVacantModalOpen(false)}
      />
    </div>
  );
}

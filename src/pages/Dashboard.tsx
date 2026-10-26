import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  DoorOpen,
  Calendar,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
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
import { DAYS, getBatchName } from '../types/routine';
import { TEACHER_NAME_MAP } from '../data/routine';
import { formatRoomDisplay } from '../data/rooms';
import type { Day } from '../types/routine';
import { DynamicWeatherBackground } from '../components/common/DynamicWeatherBackground';
import { useWeather } from '../hooks/useWeather';
import { useLiveOnlineUsers } from '../hooks/useLiveOnlineUsers';
import { VacantRoomFinderModal } from '../components/rooms/VacantRoomFinderModal';
import { AcademicCalendarModal } from '../components/calendar/AcademicCalendarModal';
import { getHolidayForDate, isExamRunning, getSemesterProgress } from '../utils/calendarEngine';

export function Dashboard() {
  const now = useLiveTime();
  const navigate = useNavigate();
  const { selectedBatch } = useBatchSelection();
  const onlineCount = useLiveOnlineUsers();

  const currentDay = getCurrentDay();
  const [activeDay, setActiveDay] = useState<Day>(() => currentDay ?? 'Saturday');
  const [isVacantModalOpen, setIsVacantModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const weather = useWeather();

  // Academic Calendar & Phase calculations
  const todayHoliday = useMemo(() => getHolidayForDate(now), [now]);
  const examStatus = useMemo(() => isExamRunning(selectedBatch, now), [selectedBatch, now]);
  const semesterProgress = useMemo(() => getSemesterProgress(selectedBatch, now), [selectedBatch, now]);

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
      {/* 1. Header Section: Title, Batch, Academic Week, & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Today Class
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-0.5">
            <p className="text-slate-400">
              Routine for <span className="text-white font-semibold">{getBatchName(selectedBatch)}</span>
            </p>
            {semesterProgress && !semesterProgress.notStarted && (
              <>
                <span className="text-slate-600">·</span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-300">
                  W{semesterProgress.currentWeek}
                </span>
              </>
            )}
            <span className="text-slate-600">·</span>
            <span
              className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 whitespace-nowrap text-[11px]"
              title={`${onlineCount} active students browsing`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>{onlineCount} {onlineCount === 1 ? 'student' : 'students'} online</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsCalendarModalOpen(true)}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors flex-shrink-0 pt-1 group cursor-pointer"
        >
          <Calendar size={13} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
          <span>Academic Calendar</span>
          <ChevronRight size={13} className="stroke-[2.5] text-slate-500 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* 1.8 Exam Notice Banner (If exams are running) */}
      {examStatus.isExam && (
        <div className="glass-card p-3.5 rounded-2xl border border-white/10 bg-[#0c1420]/80 flex items-start gap-3 shadow-md">
          <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-cyan-400 flex-shrink-0 mt-0.5">
            <Calendar size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
                {examStatus.phase?.name} Active
              </h4>
              <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-300 text-[10px] font-mono">
                {examStatus.phase?.startDate} — {examStatus.phase?.endDate}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official examination period is currently in session for {getBatchName(selectedBatch)}. Regular daily class routines may be superseded by departmental exam schedules.
            </p>
          </div>
        </div>
      )}

      {/* 2. Featured Hero Card: Holiday Hero OR Live Class Card OR Empty State */}
      {todayHoliday ? (
        <div className="hero-live-card p-5 relative group overflow-hidden min-h-[210px] rounded-[26px] border border-white/10 shadow-2xl flex flex-col justify-between">
          <DynamicWeatherBackground />
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/15 text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider backdrop-blur-md whitespace-nowrap shadow-sm">
                Official Holiday
              </span>
              {weather && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-200 drop-shadow-sm whitespace-nowrap flex-shrink-0">
                  {weather.isDay ? (
                    <Sun size={13} className="text-amber-400" />
                  ) : (
                    <Moon size={13} className="text-cyan-300" />
                  )}
                  <span>{weather.temperature}°C</span>
                </div>
              )}
            </div>

            {/* Middle row */}
            <div className="space-y-1.5 max-w-[85%]">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {todayHoliday.name}
              </h3>
              <p className="text-xs text-slate-300 font-normal pt-0.5">
                {todayHoliday.startDate === todayHoliday.endDate
                  ? `${todayHoliday.startDate} · University campus and academic activities are officially closed today.`
                  : `${todayHoliday.startDate} to ${todayHoliday.endDate} (${todayHoliday.days} Days Break) · University campus is closed.`}
              </p>
            </div>

            {/* Bottom action */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs tracking-wide transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Calendar size={13} />
                <span>Academic Calendar</span>
              </button>
              <button
                onClick={() => setIsVacantModalOpen(true)}
                className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <DoorOpen size={13} />
                <span>Find Vacant Rooms</span>
              </button>
            </div>
          </div>
        </div>
      ) : heroClass ? (
        <div className="hero-live-card p-5 relative group overflow-hidden min-h-[210px] rounded-[26px] border border-white/10 shadow-2xl flex flex-col justify-between">
          {/* FULL-CARD DYNAMIC WEATHER ENVIRONMENT */}
          <DynamicWeatherBackground />

          {/* FOREGROUND CONTENT LAYER (Cleanly floating over frosted glass shield) */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            {/* Top row: Status on left with Slot Pill in blurred zone, Weather on right */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {/* Left group: Status indicator + Slot Badge in blurred readability zone */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap flex-shrink-0">
                  {isHeroLive ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-rose-400 tracking-wide">LIVE NOW</span>
                    </>
                  ) : heroClass === nextClass ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-amber-300 font-semibold tracking-wide">UPCOMING</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span className="text-slate-300 font-medium tracking-wide">SCHEDULED</span>
                    </>
                  )}
                </div>

                {/* Slot Badge in blur zone */}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[10px] font-semibold text-slate-300 uppercase tracking-wider backdrop-blur-md whitespace-nowrap flex-shrink-0 shadow-sm">
                  SLOT {heroClass.slotNumber}
                </span>
              </div>

              {/* Weather on right: Plain text & icon floating cleanly in sky */}
              {weather && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-200 drop-shadow-sm whitespace-nowrap flex-shrink-0">
                  {weather.isDay ? (
                    <Sun size={13} className="text-amber-400" />
                  ) : (
                    <Moon size={13} className="text-cyan-300" />
                  )}
                  <span>{weather.temperature}°C</span>
                </div>
              )}
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
                <Clock size={13} className="text-slate-400 flex-shrink-0" />
                <span className="font-medium text-white tabular-nums whitespace-nowrap">
                  {formatTime12h(heroClass.startTime)} — {formatTime12h(heroClass.endTime)}
                </span>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2.5">
              <button
                onClick={() => navigate(`/rooms?room=${encodeURIComponent(heroClass.room)}`)}
                className="px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-sm transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              >
                <BookOpen size={13} />
                <span>Locate {formatRoomDisplay(heroClass.room)}</span>
                <ChevronRight size={13} className="stroke-[2.5]" />
              </button>
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
        className="glass-card p-3.5 rounded-2xl border border-white/10 hover:border-white/20 cursor-pointer transition-all active:scale-[0.99] group flex items-center justify-between gap-3 bg-[#0c1420]/80"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/15 text-slate-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
            <DoorOpen size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-slate-200 transition-colors">
                Find Vacant Room Now
              </h3>
              <span className="text-xs font-bold text-emerald-400">
                · {roomSummary.available + roomSummary.upcoming} Free
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Classroom &amp; lab vacancy for study.
            </p>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
      </div>

      {/* 3. Horizontal Interactive Week Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-sm text-white">Weekly Schedule</span>
          {currentDay && (
            <span className="text-xs text-white font-medium">
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
                    ? 'bg-white text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-[#0c1420]/80 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={isSelected}
              >
                {/* Day of Week Initial */}
                <span className={`text-xs font-bold ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                  {dayAbbr[day].short}
                </span>

                {/* Day Name */}
                <span className={`text-xs font-black mt-0.5 ${isSelected ? 'text-slate-950' : 'text-slate-300'}`}>
                  {dayAbbr[day].label}
                </span>

                {/* Cyan glowing dot indicator when selected */}
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"
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
                    running
                      ? 'border border-rose-500/40 bg-rose-950/20 shadow-sm'
                      : isFirst && currentDay === activeDay
                      ? 'border border-cyan-500/40 bg-cyan-950/15'
                      : 'bg-[#0c1420]/80 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Left: Circle Icon Indicator */}
                  <div className="flex items-center gap-3 min-w-0">
                    {running ? (
                      <div className="w-8 h-8 rounded-full border border-rose-500/40 bg-rose-500/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                      </div>
                    ) : isFirst && currentDay === activeDay ? (
                      <div className="w-8 h-8 rounded-full border border-cyan-400/80 bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0 text-[11px] font-bold">
                        S{entry.slotNumber}
                      </div>
                    )}

                    {/* Middle: Course Code & Teacher/Room */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {entry.courseCode}
                        </span>
                        {running && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
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
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsVacantModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Vacant Finder</span>
            </button>
            <span className="text-slate-600">·</span>
            <Link to="/rooms" className="text-slate-400 hover:text-white font-medium">
              All Rooms →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Occupied */}
          <Link
            to="/rooms?filter=occupied"
            className="glass-card p-3 text-center hover:border-rose-500/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto mb-1.5" />
            <span className="text-xl font-extrabold text-rose-400 block tabular-nums">
              {roomSummary.occupied}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Occupied</span>
          </Link>

          {/* Available */}
          <Link
            to="/rooms?filter=available"
            className="glass-card p-3 text-center hover:border-emerald-500/40 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1.5" />
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
            <div className="w-2 h-2 rounded-full bg-amber-400 mx-auto mb-1.5" />
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

      {/* Academic Calendar Modal */}
      <AcademicCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedBatch={selectedBatch}
        currentDate={now}
      />
    </div>
  );
}

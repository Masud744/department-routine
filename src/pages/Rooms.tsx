import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, DoorOpen, Radio } from 'lucide-react';
import { useLiveTime } from '../hooks/useLiveTime';
import { getAllRoomStatuses, getRoomSchedule } from '../services/roomAllocationService';
import { getCurrentDay, formatTime12h } from '../utils/timeUtils';
import { DAYS, getBatchLabel } from '../types/routine';
import { TEACHER_NAME_MAP } from '../data/routine';
import { formatRoomDisplay } from '../data/rooms';
import type { RoomStatus, Day } from '../types/routine';
import { VacantRoomFinderModal } from '../components/rooms/VacantRoomFinderModal';

type StatusFilter = 'all' | RoomStatus;

export function Rooms() {
  const now = useLiveTime();
  const [isVacantModalOpen, setIsVacantModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get('filter') as StatusFilter) || 'all';
  const initialRoomQuery = searchParams.get('room') || '';

  const [filter, setFilter] = useState<StatusFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialRoomQuery);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(initialRoomQuery || null);
  const [selectedDay, setSelectedDay] = useState<Day | 'today'>('today');

  const roomStatuses = useMemo(() => {
    void now;
    return getAllRoomStatuses();
  }, [now]);

  const currentDay = getCurrentDay();
  const scheduleDay = selectedDay === 'today' ? currentDay : selectedDay;

  const filteredRooms = useMemo(() => {
    let list = roomStatuses;
    if (filter !== 'all') {
      list = list.filter((r) => r.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((r) => r.room.toLowerCase().includes(q));
    }
    return list;
  }, [roomStatuses, filter, searchQuery]);

  const summary = useMemo(() => ({
    all: roomStatuses.length,
    available: roomStatuses.filter((r) => r.status === 'available').length,
    occupied: roomStatuses.filter((r) => r.status === 'occupied').length,
    upcoming: roomStatuses.filter((r) => r.status === 'upcoming').length,
  }), [roomStatuses]);

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio size={18} className="text-rose-500 animate-pulse" />
            <span>Room Radar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {summary.available} of {summary.all} rooms currently available
          </p>
        </div>

        <button
          onClick={() => setIsVacantModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
        >
          <DoorOpen size={14} />
          <span>Vacant Finder</span>
        </button>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search room (e.g. 5002, IOT-LAB)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121926] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          {[
            { id: 'all', label: `All (${summary.all})` },
            { id: 'available', label: `Available (${summary.available})`, dot: 'bg-emerald-400' },
            { id: 'occupied', label: `Occupied (${summary.occupied})`, dot: 'bg-rose-500' },
            { id: 'upcoming', label: `Upcoming (${summary.upcoming})`, dot: 'bg-amber-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as StatusFilter)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 font-medium ${
                filter === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#121926] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.dot && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    filter === tab.id ? 'bg-slate-950' : tab.dot
                  }`}
                />
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rooms List */}
      <div className="space-y-3">
        {filteredRooms.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 space-y-1">
            <DoorOpen size={24} className="mx-auto text-slate-500 mb-2" />
            <p className="text-sm font-semibold text-white">No rooms found</p>
            <p className="text-xs text-slate-500">Try clearing the search or status filter.</p>
          </div>
        ) : (
          filteredRooms.map((roomState) => {
            const isExpanded = expandedRoom === roomState.room;
            const isOccupied = roomState.status === 'occupied';
            const isAvailable = roomState.status === 'available';

            return (
              <div
                key={roomState.room}
                className={`glass-card overflow-hidden transition-all ${
                  isOccupied
                    ? 'border-rose-500/30'
                    : isAvailable
                    ? 'border-emerald-500/30'
                    : 'border-amber-500/30'
                }`}
              >
                {/* Main Card Header / Trigger */}
                <div
                  onClick={() => setExpandedRoom(isExpanded ? null : roomState.room)}
                  className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Room Badge & Name */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white tracking-tight">
                          {formatRoomDisplay(roomState.room)}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                            isOccupied
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : isAvailable
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOccupied
                                ? 'bg-rose-500 animate-pulse'
                                : isAvailable
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          <span>
                            {isOccupied ? 'Occupied' : isAvailable ? 'Available' : 'Upcoming'}
                          </span>
                        </span>
                      </div>

                      {/* Current Class Info */}
                      {roomState.currentClass ? (
                        <div className="mt-2 space-y-0.5">
                          <p className="text-sm font-semibold text-white">
                            {roomState.currentClass.courseCode}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span>{getBatchLabel(roomState.currentClass.batch)}</span>
                            {roomState.currentClass.teacherCode && (
                              <>
                                <span>•</span>
                                <span>
                                  {TEACHER_NAME_MAP[roomState.currentClass.teacherCode] ??
                                    roomState.currentClass.teacherCode}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      ) : roomState.nextClass ? (
                        <div className="mt-2 space-y-0.5">
                          <p className="text-xs text-amber-400 font-medium">
                            Next: {roomState.nextClass.courseCode} ({getBatchLabel(roomState.nextClass.batch)})
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Starts at {formatTime12h(roomState.nextClass.startTime)}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-xs text-slate-500">
                          No more classes scheduled today
                        </p>
                      )}
                    </div>

                    {/* Right: Time Countdown & Chevron */}
                    <div className="text-right flex flex-col items-end justify-between flex-shrink-0">
                      {roomState.timeUntilFree && (
                        <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                          Free in {roomState.timeUntilFree}
                        </span>
                      )}
                      {roomState.timeUntilNext && !roomState.currentClass && (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          In {roomState.timeUntilNext}
                        </span>
                      )}

                      <ChevronDown
                        size={16}
                        className={`text-slate-400 mt-2 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Full Schedule Accordion */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#0C1320] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        {formatRoomDisplay(roomState.room)} Full Schedule
                      </h4>

                      {/* Day Selector Pills */}
                      <div className="flex items-center gap-1 text-[11px]">
                        <button
                          onClick={() => setSelectedDay('today')}
                          className={`px-2 py-0.5 rounded-lg transition-colors ${
                            selectedDay === 'today'
                              ? 'bg-cyan-500 text-slate-950 font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Today
                        </button>
                        {DAYS.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-2 py-0.5 rounded-lg transition-colors ${
                              selectedDay === day
                                ? 'bg-cyan-500 text-slate-950 font-semibold'
                                : 'text-slate-400 hover:text-white'
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
                            <p className="text-xs text-slate-500 py-2">
                              No classes scheduled in this room on {scheduleDay}.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-1.5 pt-1">
                            {schedule.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                              >
                                <div>
                                  <span className="font-bold text-white">
                                    {entry.courseCode}
                                  </span>
                                  <span className="text-slate-400 ml-2">
                                    {getBatchLabel(entry.batch)}
                                    {entry.teacherCode ? ` · ${TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode}` : ''}
                                  </span>
                                </div>
                                <span className="text-slate-400 tabular-nums">
                                  {formatTime12h(entry.startTime)} – {formatTime12h(entry.endTime)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-slate-500">
                        No classes running today (Thursday/Friday weekend).
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Vacant Room Finder Modal */}
      <VacantRoomFinderModal
        isOpen={isVacantModalOpen}
        onClose={() => setIsVacantModalOpen(false)}
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Search, User, ChevronDown, Radio, Phone, Mail, Copy, Check } from 'lucide-react';
import { TEACHER_DIRECTORY } from '../data/teachers';
import { DAYS, getBatchLabel, getBatchName } from '../types/routine';
import { formatTime12h } from '../utils/timeUtils';
import { formatRoomDisplay } from '../data/rooms';
import { isCurrentlyRunning } from '../services/routineService';
import { useLiveTime } from '../hooks/useLiveTime';

export function Teachers() {
  const now = useLiveTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    }
  };

  // Enriched teachers with unique rooms, batches, courses, and active teaching state
  const enrichedTeachers = useMemo(() => {
    void now;
    return TEACHER_DIRECTORY.map((teacher) => {
      const uniqueRooms = [...new Set(teacher.classes.map((c) => formatRoomDisplay(c.room)))];
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

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return enrichedTeachers;
    const q = searchQuery.trim().toLowerCase();
    return enrichedTeachers.filter(
      (t) =>
        t.code.toLowerCase().includes(q) ||
        (t.fullName && t.fullName.toLowerCase().includes(q)) ||
        (t.phone && t.phone.includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q))
    );
  }, [enrichedTeachers, searchQuery]);

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Faculty Directory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {TEACHER_DIRECTORY.length} faculty members · Class timetables &amp; assignments
          </p>
        </div>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search faculty by name or code (e.g. Ashiqussalehin, MAS)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#121926] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
        />
      </div>

      {/* 3. Teachers List */}
      <div className="space-y-3">
        {filteredTeachers.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400 space-y-1">
            <User size={24} className="mx-auto text-slate-500 mb-2" />
            <p className="text-sm font-semibold text-white">No faculty members found</p>
            <p className="text-xs text-slate-500">Try searching with a different name or short code.</p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const isExpanded = expandedTeacher === teacher.code;

            return (
              <div
                key={teacher.code}
                className={`glass-card overflow-hidden transition-all ${
                  teacher.currentlyTeaching ? 'border-cyan-500/40 bg-cyan-950/10' : ''
                }`}
              >
                {/* Main Card Summary */}
                <div
                  onClick={() => setExpandedTeacher(isExpanded ? null : teacher.code)}
                  className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar with Initials */}
                      <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold text-sm shadow-sm">
                        {teacher.code}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-white truncate">
                            {teacher.fullName ?? teacher.code}
                          </h3>
                          {teacher.designation && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              teacher.designation.includes('Chairman')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                                : teacher.designation.includes('Assistant Professor')
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-slate-800/80 text-slate-300 border-white/10'
                            }`}>
                              {teacher.designation}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                          Code: <span className="font-semibold text-cyan-400">{teacher.code}</span>
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          <span>{teacher.classes.length} classes</span>
                          <span>•</span>
                          <span>{teacher.uniqueCourses.length} courses</span>
                          <span>•</span>
                          <span>{teacher.uniqueBatches.map(b => getBatchName(b)).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Teaching Badge & Chevron */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      {teacher.currentlyTeaching ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                          <Radio size={10} />
                          Teaching
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {teacher.uniqueRooms.length} rooms
                        </span>
                      )}

                      <ChevronDown
                        size={16}
                        className={`text-slate-400 mt-3 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Weekly Schedule & Contact Accordion */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-[#0C1320] p-4 space-y-4">
                    {/* Faculty Direct Contact Actions */}
                    {(teacher.phone || teacher.email) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Contact Information
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Tap to call or email directly
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Phone Call & Copy */}
                          {teacher.phone && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#111c2e] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                              <a
                                href={`tel:${teacher.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2.5 min-w-0 group text-left flex-1"
                                title={`Call ${teacher.fullName ?? teacher.code}`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors flex-shrink-0">
                                  <Phone size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                                    Phone Number
                                  </span>
                                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors tabular-nums truncate block">
                                    {teacher.phone}
                                  </span>
                                </div>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(teacher.phone!, `phone-${teacher.code}`);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors flex-shrink-0 ml-1.5"
                                title="Copy phone number"
                              >
                                {copiedKey === `phone-${teacher.code}` ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    <Check size={12} />
                                    Copied
                                  </span>
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          )}

                          {/* Email Direct & Copy */}
                          {teacher.email && (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141824] border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                              <a
                                href={`mailto:${teacher.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2.5 min-w-0 group text-left flex-1"
                                title={`Email ${teacher.fullName ?? teacher.code}`}
                              >
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors flex-shrink-0">
                                  <Mail size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                                    Official Email
                                  </span>
                                  <span className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors truncate block">
                                    {teacher.email}
                                  </span>
                                </div>
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(teacher.email!, `email-${teacher.code}`);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors flex-shrink-0 ml-1.5"
                                title="Copy email address"
                              >
                                {copiedKey === `email-${teacher.code}` ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                    <Check size={12} />
                                    Copied
                                  </span>
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Weekly Timetable */}
                    <div className="space-y-3 pt-1 border-t border-white/5">
                      <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Weekly Timetable
                      </h4>

                    <div className="space-y-2.5">
                      {DAYS.map((day) => {
                        const dayClasses = teacher.classes
                          .filter((c) => c.day === day)
                          .sort((a, b) => a.slotNumber - b.slotNumber);

                        if (dayClasses.length === 0) return null;

                        return (
                          <div key={day} className="space-y-1.5">
                            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide block">
                              {day}
                            </span>
                            <div className="space-y-1.5">
                              {dayClasses.map((entry) => {
                                const running = isCurrentlyRunning(entry);

                                return (
                                  <div
                                    key={entry.id}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                                      running
                                        ? 'bg-rose-500/10 border-rose-500/30'
                                        : 'bg-white/[0.03] border-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {running && (
                                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                      )}
                                      <span className="font-bold text-white">
                                        {entry.courseCode}
                                      </span>
                                      <span className="text-slate-400">
                                        {formatRoomDisplay(entry.room)} · {getBatchLabel(entry.batch)}
                                      </span>
                                    </div>
                                    <span className="text-slate-400 tabular-nums">
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
                  </div>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { ACADEMIC_HOLIDAYS_2026_2027, BATCH_CALENDARS } from '../../data/calendar';
import { getBatchName } from '../../types/routine';
import {
  normalizeDate,
  daysBetween,
  getSemesterProgress,
  getCurrentPhaseForBatch,
  getNextUpcomingHoliday,
} from '../../utils/calendarEngine';
import type { Batch } from '../../types/routine';

interface AcademicCalendarModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedBatch: Batch;
  readonly currentDate: Date;
}

export function AcademicCalendarModal({
  isOpen,
  onClose,
  selectedBatch,
  currentDate,
}: AcademicCalendarModalProps) {
  const [activeTab, setActiveTab] = useState<'holidays' | 'phases' | 'deadlines'>('holidays');

  const todayIso = useMemo(() => normalizeDate(currentDate), [currentDate]);
  const calendar = useMemo(() => BATCH_CALENDARS[selectedBatch], [selectedBatch]);
  const progress = useMemo(() => getSemesterProgress(selectedBatch, currentDate), [selectedBatch, currentDate]);
  const currentPhase = useMemo(() => getCurrentPhaseForBatch(selectedBatch, currentDate), [selectedBatch, currentDate]);
  const nextHolidayInfo = useMemo(() => getNextUpcomingHoliday(currentDate), [currentDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="glass-card w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a111e]/95 p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300">
                <Calendar size={15} />
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">Academic Calendar</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              UFTB 2026–2027 · <span className="text-white font-medium">{getBatchName(selectedBatch)}</span> ({calendar?.term ?? 'Academic Year'})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Semester Progress Overview */}
        {progress && !progress.notStarted && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 my-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-white truncate text-xs">
                  {currentPhase?.name ?? progress.phaseName}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono font-semibold text-slate-300">
                  W{progress.currentWeek}/{progress.totalWeeks}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {progress.isCompleted ? 'Completed' : `${progress.totalWeeks - progress.currentWeek + 1}w remaining`}
              </span>
            </div>

            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, Math.min(100, progress.percent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Semester: {progress.percent}%</span>
              {nextHolidayInfo && (
                <span>Next holiday: {nextHolidayInfo.holiday.name} ({nextHolidayInfo.daysUntil}d)</span>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-3">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'holidays'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Holidays ({ACADEMIC_HOLIDAYS_2026_2027.length})
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'phases'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Term Phases
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'deadlines'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deadlines
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activeTab === 'holidays' && (
            <div className="space-y-2">
              {ACADEMIC_HOLIDAYS_2026_2027.map((h) => {
                const isCurrent = todayIso >= h.startDate && todayIso <= h.endDate;
                const isUpcoming = h.startDate > todayIso;
                const daysDiff = daysBetween(todayIso, h.startDate);

                return (
                  <div
                    key={h.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-white/[0.06] border-white/20 shadow-sm'
                        : isUpcoming
                        ? 'bg-[#0f192b]/80 border-white/10'
                        : 'bg-white/[0.02] border-white/5 opacity-55'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-semibold text-white tracking-tight">{h.name}</h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
                              Today
                            </span>
                          )}
                          {h.isTentative && (
                            <span className="text-[10px] text-slate-400 italic">(*Subject to moon)</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {h.startDate === h.endDate ? h.startDate : `${h.startDate} to ${h.endDate}`}
                          {h.days > 0 && <span className="ml-1.5 text-slate-400 font-mono">({h.days} {h.days === 1 ? 'day' : 'days'})</span>}
                        </p>
                      </div>

                      {isUpcoming && (
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono font-semibold text-slate-300 whitespace-nowrap flex-shrink-0">
                          {daysDiff === 1 ? 'Tomorrow' : `in ${daysDiff}d`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-2">
              {calendar?.phases.map((p, index) => {
                const isCurrent = todayIso >= p.startDate && todayIso <= p.endDate;
                const isPast = p.endDate < todayIso;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-white/[0.06] border-white/20 shadow-sm'
                        : isPast
                        ? 'bg-white/[0.02] border-white/5 opacity-55'
                        : 'bg-[#0f192b]/80 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-400">
                          0{index + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-white tracking-tight">{p.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono font-semibold text-slate-300">
                        {p.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
                      <span className="font-mono text-[11px]">{p.startDate} — {p.endDate}</span>
                      {isCurrent && (
                        <span className="text-emerald-400 font-medium text-[11px]">Current Phase</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div className="space-y-2">
              {calendar?.deadlines.map((d) => {
                const end = d.endDate ?? d.startDate;
                const isPast = end < todayIso;
                const isCurrent = todayIso >= d.startDate && todayIso <= end;

                return (
                  <div
                    key={d.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-white/[0.06] border-white/20'
                        : isPast
                        ? 'bg-white/[0.02] border-white/5 opacity-55'
                        : 'bg-[#0f192b]/80 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-semibold text-white">{d.title}</h4>
                          {d.fineStatus === 'with_fine' && (
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-400 text-[10px] font-mono">
                              Late Fine
                            </span>
                          )}
                          {d.fineStatus === 'vc_approval' && (
                            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-slate-400 text-[10px] font-mono">
                              VC Approval
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          {d.endDate ? `${d.startDate} — ${d.endDate}` : d.startDate}
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider flex-shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

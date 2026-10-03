import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, User, Clock } from 'lucide-react';
import { searchRoutine } from '../../services/routineService';
import { getBatchName } from '../../types/routine';
import { TEACHER_NAME_MAP } from '../../data/routine';
import { formatTime12h } from '../../utils/timeUtils';
import { formatRoomDisplay } from '../../data/rooms';
import type { RoutineEntry } from '../../types/routine';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry?: (entry: RoutineEntry) => void;
}

export function SearchModal({ isOpen, onClose, onSelectEntry }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RoutineEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length >= 1) {
      setResults(searchRoutine(value));
    } else {
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full sm:max-w-lg bg-[#0F1724] border border-white/10 rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Handle for mobile sheet */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-cyan-400" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search courses, teachers, rooms, batches..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#162030] text-white pl-10 pr-10 py-3 rounded-xl border border-white/10 text-sm placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {query ? (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 text-slate-400 hover:text-white p-1"
                aria-label="Clear input"
              >
                <X size={16} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="absolute right-3 text-slate-400 hover:text-white p-1"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-500 text-[11px] whitespace-nowrap mr-1">Quick:</span>
            {['4th Batch', '6th Batch', '8th Batch', 'Room 5002', 'IOT-LAB', 'Ashiqussalehin'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSearch(chip)}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 overscroll-contain">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search size={32} className="mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-medium text-slate-400">Search Routine &amp; Rooms</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Type course codes like <span className="text-cyan-400">IRE 459</span>, teacher names like <span className="text-cyan-400">Sadia</span>, or room numbers like <span className="text-cyan-400">5002</span>.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or batch name.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
                <span>{results.length} classes found</span>
              </div>
              {results.map((entry) => {
                const teacherName = entry.teacherCode
                  ? TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode
                  : null;

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      onSelectEntry?.(entry);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                            {entry.courseCode}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                            {getBatchName(entry.batch)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-slate-500" />
                            {formatRoomDisplay(entry.room)}
                          </span>
                          {teacherName && (
                            <span className="flex items-center gap-1">
                              <User size={12} className="text-slate-500" />
                              {teacherName} ({entry.teacherCode})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-semibold text-white block">
                          {entry.day.slice(0, 3)}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Clock size={10} />
                          {formatTime12h(entry.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

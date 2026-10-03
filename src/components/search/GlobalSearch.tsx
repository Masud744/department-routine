import { Search, X } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { searchRoutine } from '../../services/routineService';
import type { RoutineEntry } from '../../types/routine';
import { getBatchName } from '../../types/routine';
import { TEACHER_NAME_MAP } from '../../data/routine';
import { formatTime12h } from '../../utils/timeUtils';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RoutineEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      const found = searchRoutine(value);
      setResults(found);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          placeholder="Search courses, teachers, batches (e.g. 4th batch)..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-[var(--color-border-default)] rounded-md focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
          aria-label="Search routine"
          aria-expanded={isOpen}
          role="combobox"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] p-0.5"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border-default)] rounded-md shadow-sm z-30 max-h-80 overflow-y-auto" role="listbox">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[var(--color-text-tertiary)]">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 border-b border-[var(--color-border-light)]">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              {results.slice(0, 20).map((entry) => (
                <div
                  key={entry.id}
                  className="px-3 py-2 hover:bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border-light)] last:border-b-0 cursor-default"
                  role="option"
                  aria-selected={false}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {entry.courseCode}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Room {entry.room} · {entry.teacherCode ? (TEACHER_NAME_MAP[entry.teacherCode] ?? entry.teacherCode) : '—'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                        {getBatchName(entry.batch)}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">
                        {entry.batch} · {entry.day.slice(0, 3)} {formatTime12h(entry.startTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {results.length > 20 && (
                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Showing 20 of {results.length} results
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

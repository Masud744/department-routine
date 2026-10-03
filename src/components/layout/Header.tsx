import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, Check, Search } from 'lucide-react';
import { useLiveTime } from '../../hooks/useLiveTime';
import { formatCurrentTime, getDayName, getCurrentDay } from '../../utils/timeUtils';
import { useBatchSelection } from '../../hooks/useBatchSelection';
import { BATCHES, getBatchName } from '../../types/routine';
import type { Batch } from '../../types/routine';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const now = useLiveTime();
  const { selectedBatch, setSelectedBatch } = useBatchSelection();
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);
  const currentDay = getCurrentDay();

  return (
    <header className="sticky top-0 z-30 bg-[#0A0F18]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Department Logo + Greeting & Batch Picker */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="flex-shrink-0 relative group">
            <img
              src="/dept.png"
              alt="Dept. of IRE Logo"
              className="w-10 h-10 rounded-2xl object-cover bg-slate-900 border border-white/15 shadow-md shadow-cyan-500/10 group-hover:border-cyan-400/50 transition-all"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Hello 👋</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-medium truncate">Dept. of IRE</span>
            </div>

            {/* Quick Batch Selector Dropdown Pill */}
            <div className="relative mt-0.5">
              <button
                onClick={() => setBatchMenuOpen(!batchMenuOpen)}
                className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-cyan-400 transition-colors py-0.5 focus:outline-none"
                aria-expanded={batchMenuOpen}
              >
                <span>{getBatchName(selectedBatch)}</span>
                <span className="text-[11px] font-normal text-slate-400">({selectedBatch})</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${batchMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>

              {/* Batch Selection Menu */}
              {batchMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setBatchMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 top-full mt-2 w-64 bg-[#111A28] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                      Select Your Batch
                    </p>
                    <div className="space-y-1">
                      {BATCHES.map((batch: Batch) => (
                        <button
                          key={batch}
                          onClick={() => {
                            setSelectedBatch(batch);
                            setBatchMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                            selectedBatch === batch
                              ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-left">{getBatchName(batch)}</p>
                            <p className="text-[10px] text-slate-400 text-left">Session {batch}</p>
                          </div>
                          {selectedBatch === batch && <Check size={14} className="text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Clock & Search Trigger & External Link */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live Clock Pill */}
          <div className="hidden xs:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white tabular-nums">
              {currentDay ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Classes running today" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-500" title="Weekend" />
              )}
              <span>{formatCurrentTime(now)}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {getDayName(now).slice(0, 3)}
            </span>
          </div>

          {/* Quick Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              aria-label="Search"
              title="Search routine & rooms"
            >
              <Search size={16} />
            </button>
          )}

          {/* Official Department Link */}
          <a
            href="https://ire.uftb.ac.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 transition-colors"
            title="Visit Department Website"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

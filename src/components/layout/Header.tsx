import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, Check, Search, Download, WifiOff } from 'lucide-react';
import { useBatchSelection } from '../../hooks/useBatchSelection';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { BATCHES, getBatchName } from '../../types/routine';
import type { Batch } from '../../types/routine';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { selectedBatch, setSelectedBatch } = useBatchSelection();
  const { isInstallable, installApp, isOnline } = usePwaInstall();
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0A0F18]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Department Logo + Dept Name & Batch Selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link to="/" className="flex-shrink-0 relative">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
              <img
                src="/dept.png"
                alt="Dept. of IRE Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-bold text-white text-xs sm:text-sm">Dept. of IRE</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider">
                UFTB
              </span>
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

        {/* Right: Offline badge, Install button, Search, External Link */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Offline indicator badge */}
          {!isOnline && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold"
              title="Offline mode active - routine cached"
            >
              <WifiOff size={12} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Quick Install App Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold items-center gap-1.5 transition-all shadow-sm shadow-cyan-500/10 active:scale-95"
              title="Install IRE Routine on Phone"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
          )}

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
            className="w-9 h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 flex items-center justify-center text-cyan-400 transition-colors"
            title="Visit Department Website"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

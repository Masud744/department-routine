import { useState } from 'react';
import { X, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

function GithubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0d1522] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              {activeTab === 'privacy' ? <ShieldCheck size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Department of IRE — University of Fashion and Technology
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 gap-1.5 border-b border-white/10 bg-black/20 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'privacy'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
              activeTab === 'terms'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terms &amp; Conditions
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-4 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="font-bold text-white text-sm block">How we protect your privacy</span>
                <p className="text-slate-400 leading-normal">
                  We built this app so students and teachers in our department can easily check routines and find empty classrooms. We believe utility tools should respect people's privacy, so this app is designed to run entirely on your own device.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Zero tracking and no personal data collection
                </h4>
                <p>
                  We do not collect names, student IDs, phone numbers, or IP addresses. There are no third-party tracking scripts, advertising trackers, or fingerprinting tools embedded anywhere in the code.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Offline storage on your device
                </h4>
                <p>
                  When you pick your batch, that choice is stored in your browser's local memory on your phone or laptop. Routine schedules are cached so you can open the app even when campus Wi-Fi is slow or disconnected. This data stays on your machine and is never uploaded anywhere.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Faculty contact information
                </h4>
                <p>
                  The faculty emails and phone numbers shown in the directory are official university contact points intended for academic inquiries between students and teachers.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="font-bold text-white text-sm block">About this routine tool</span>
                <p className="text-slate-400 leading-normal">
                  This app is an academic utility created for the students, faculty, and staff of the Department of Internet of Things and Robotics Engineering (IRE) at the University of Fashion and Technology (UFTB).
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Schedule updates and official notices
                </h4>
                <p>
                  We keep the class timetable and room allocations synchronized with the department's latest approved schedule. If an instructor makes an ad-hoc room change or reschedules a class during lectures, their direct announcement takes priority.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Open source and feedback
                </h4>
                <p>
                  This project is open source and maintained by students from the department. If you notice an error in any schedule, want to add a feature, or report a bug, you can open an issue or pull request on GitHub.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400">
                  Responsible use
                </h4>
                <p>
                  The live room vacancy radar is provided to help groups find empty study spaces without disturbing other classes. Please respect active classroom rules and departmental guidelines when using campus facilities.
                </p>
              </div>
            </>
          )}

          {/* Developer Credit & GitHub */}
          <div className="pt-3 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-[#121c2d] border border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <span className="text-white font-bold text-xs block">
                  Developed by Shahriar Alom Masud
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dept. of Internet of Things &amp; Robotics Engineering — UFTB
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href="https://github.com/Masud744"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                  title="GitHub Profile"
                >
                  <GithubIcon size={12} />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/shahriar-alom-masud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                  title="LinkedIn Profile"
                >
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://ire.uftb.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Dept Web</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-3 border-t border-white/10 bg-black/20 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

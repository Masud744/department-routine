import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { LegalModal } from '../legal/LegalModal';

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

export function Footer() {
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="mt-10 pt-5 pb-6 border-t border-white/5 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>Developed by</span>
          <span className="font-semibold text-slate-200">Shahriar Alom Masud</span>
          <span className="text-slate-600">—</span>
          <span className="text-slate-400">Dept. of IRE, UFTB</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-400 flex-wrap">
          <button
            onClick={() => setLegalModalTab('privacy')}
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => setLegalModalTab('terms')}
            className="hover:text-white transition-colors"
          >
            Terms &amp; Conditions
          </button>
          <span className="text-slate-700">•</span>
          <a
            href="https://github.com/Masud744/department-routine"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
            title="GitHub Repository"
          >
            <GithubIcon size={12} />
            <span>GitHub</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://ire.uftb.ac.bd/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors inline-flex items-center gap-0.5"
            title="Department Website"
          >
            <span>ire.uftb.ac.bd</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalTab !== null}
        initialTab={legalModalTab ?? 'privacy'}
        onClose={() => setLegalModalTab(null)}
      />
    </>
  );
}

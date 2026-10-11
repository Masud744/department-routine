import { useState } from 'react';
import { LegalModal } from '../legal/LegalModal';

function GithubIcon({ size = 13 }: { size?: number }) {
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

function LinkedinIcon({ size = 13 }: { size?: number }) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="mt-4 pt-3 pb-1 border-t border-white/5 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 text-slate-400">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span>
              Developed by <strong className="text-slate-200 font-semibold">Shahriar Alom Masud</strong>
            </span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-400">IRE, UFTB</span>

            {/* Social Profiles */}
            <div className="inline-flex items-center gap-2 ml-0.5 text-slate-400">
              <a
                href="https://github.com/Masud744"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                title="GitHub Profile"
              >
                <GithubIcon size={13} />
              </a>
              <a
                href="https://www.linkedin.com/in/shahriar-alom-masud"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#0077B5] transition-colors"
                title="LinkedIn Profile"
              >
                <LinkedinIcon size={13} />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="hidden sm:inline text-slate-700">•</span>
            {/* Minimalist Legal Triggers */}
            <button
              onClick={() => setLegalModalTab('privacy')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Privacy
            </button>
            <span className="text-slate-700">/</span>
            <button
              onClick={() => setLegalModalTab('terms')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Terms
            </button>
          </div>
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

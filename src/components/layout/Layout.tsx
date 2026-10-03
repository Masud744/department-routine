import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-border-light)] mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
          <p className="text-center sm:text-left">
            <a
              href="https://ire.uftb.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-accent)] hover:underline"
            >
              Department of Internet of Things and Robotics Engineering
            </a>{' '}
            · Academic Routine &amp; Room Allocation System
          </p>
          <div className="flex items-center gap-3 text-[var(--color-text-tertiary)] flex-shrink-0">
            <a
              href="https://ire.uftb.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              ire.uftb.ac.bd
            </a>
            <span>·</span>
            <span className="font-medium">UFTB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

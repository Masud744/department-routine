import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Users,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useLiveTime } from '../../hooks/useLiveTime';
import { formatCurrentTime, formatDate, getDayName } from '../../utils/timeUtils';

const NAV_ITEMS = [
  { path: '/', label: 'Live Rooms', icon: LayoutDashboard },
  { path: '/routines', label: 'Routines', icon: CalendarDays },
  { path: '/rooms', label: 'Rooms', icon: DoorOpen },
  { path: '/teachers', label: 'Teachers', icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const now = useLiveTime();

  return (
    <>
      <header className="bg-white border-b border-[var(--color-border-default)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main header row */}
          <div className="flex items-center justify-between h-14">
            {/* Logo / Department name */}
            <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
                <img
                  src="/dept.png"
                  alt="Dept. of IRE Logo"
                  className="w-9 h-9 rounded object-contain flex-shrink-0 bg-white shadow-sm border border-[var(--color-border-light)]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight truncate">
                    Dept. of Internet of Things &amp; Robotics Engineering
                  </h1>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] leading-tight">
                    Routine &amp; Room Allocation
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="https://ire.uftb.ac.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 ml-2 px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded transition-colors font-medium border border-[var(--color-border-light)]"
                title="Visit Department Website"
              >
                <span>ire.uftb.ac.bd</span>
                <ExternalLink size={12} />
              </a>
            </nav>

            {/* Right side: time & mobile menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-[var(--color-text-primary)] tabular-nums">
                  {formatCurrentTime(now)}
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {getDayName(now)} · {formatDate(now)}
                </p>
              </div>
              <div className="sm:hidden text-right">
                <p className="text-xs font-medium text-[var(--color-text-primary)] tabular-nums">
                  {formatCurrentTime(now)}
                </p>
              </div>
              <button
                className="md:hidden p-1.5 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-nav-overlay md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <nav
              className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-[var(--color-border-default)] shadow-sm z-50"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="px-4 py-2 space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
                <a
                  href="https://ire.uftb.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-[var(--color-accent)] font-medium hover:bg-[var(--color-accent-light)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink size={16} />
                    Dept. Website (ire.uftb.ac.bd)
                  </span>
                  <span className="text-[10px] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] px-1.5 py-0.5 rounded">
                    UFTB
                  </span>
                </a>
              </div>
              <div className="px-4 py-2 border-t border-[var(--color-border-light)]">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {getDayName(now)} · {formatDate(now)}
                </p>
              </div>
            </nav>
          </>
        )}
      </header>
    </>
  );
}

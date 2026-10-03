import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, DoorOpen, Users, Search } from 'lucide-react';

interface BottomNavProps {
  onOpenSearch: () => void;
}

export function BottomNav({ onOpenSearch }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F18]/90 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 sm:max-w-md md:max-w-lg lg:max-w-xl sm:mx-auto sm:bottom-4 sm:rounded-2xl sm:border"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around">
        {/* Today / Dashboard */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard size={20} className={isActive ? 'text-cyan-400 scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-1">Today</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] absolute bottom-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* Routine */}
        <NavLink
          to="/routines"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <CalendarDays size={20} className={isActive ? 'text-cyan-400 scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-1">Routine</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] absolute bottom-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* Search Action Button */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
          aria-label="Open search"
        >
          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Search size={18} />
          </div>
          <span className="text-[10px] mt-0.5 text-cyan-400 font-medium">Search</span>
        </button>

        {/* Rooms */}
        <NavLink
          to="/rooms"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <DoorOpen size={20} className={isActive ? 'text-cyan-400 scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-1">Rooms</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] absolute bottom-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* Teachers */}
        <NavLink
          to="/teachers"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Users size={20} className={isActive ? 'text-cyan-400 scale-110 transition-transform' : ''} />
              <span className="text-[10px] mt-1">Faculty</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] absolute bottom-0.5" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

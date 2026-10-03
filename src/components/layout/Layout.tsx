import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SearchModal } from '../search/SearchModal';

export function Layout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B11] text-[#F8FAFC] flex flex-col items-center justify-start antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Mobile App Shell Container */}
      <div className="app-container">
        {/* Mobile Header */}
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Main Content Area with Bottom Nav padding */}
        <main className="flex-1 px-4 py-4 pb-28 overflow-y-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Dock */}
        <BottomNav onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Global Search Sheet Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </div>
  );
}

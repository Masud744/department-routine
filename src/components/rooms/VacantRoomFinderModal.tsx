import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Check,
  Share2,
  DoorOpen,
  Clock,
  MapPin,
  Users,
  Layers,
  Search,
} from 'lucide-react';
import { useLiveTime } from '../../hooks/useLiveTime';
import { getVacantRoomsForStudy } from '../../services/roomAllocationService';
import type { VacantRoomStudyInfo } from '../../services/roomAllocationService';

interface VacantRoomFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VacantRoomFinderModal({ isOpen, onClose }: VacantRoomFinderModalProps) {
  const now = useLiveTime();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'free_now' | 'lecture' | 'lab'>('free_now');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);

  const roomsData = useMemo(() => {
    void now;
    return getVacantRoomsForStudy();
  }, [now]);

  const filteredRooms = useMemo(() => {
    return roomsData.filter((r) => {
      // Type filter
      if (filterType === 'free_now' && !r.isFreeNow) return false;
      if (filterType === 'lecture' && r.metadata.type !== 'lecture') return false;
      if (filterType === 'lab' && r.metadata.type !== 'lab') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.room.toLowerCase().includes(q) || r.metadata.displayName.toLowerCase().includes(q);
        const matchFloor = r.metadata.floor.toLowerCase().includes(q);
        const matchAmenities = r.metadata.amenities.some((a) => a.toLowerCase().includes(q));
        if (!matchName && !matchFloor && !matchAmenities) return false;
      }

      return true;
    });
  }, [roomsData, filterType, searchQuery]);

  const freeCount = useMemo(() => roomsData.filter((r) => r.isFreeNow).length, [roomsData]);

  if (!isOpen) return null;

  const handleCopyInvite = (info: VacantRoomStudyInfo) => {
    let text = `📍 ${info.metadata.displayName} (${info.metadata.floor}) is vacant right now`;
    if (info.freeUntilTime === 'End of Day' || info.freeUntilTime === 'Off Day') {
      text += ` for the rest of the day!`;
    } else if (info.freeUntilTime) {
      text += ` until ${info.freeUntilTime} (${info.freeDurationLabel})!`;
    }
    text += ` Let's do group study there. Check live: ${window.location.origin}/rooms?room=${info.room}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedRoom(info.room);
      setTimeout(() => setCopiedRoom(null), 2500);
    });
  };

  const handleSelectRoom = (room: string) => {
    onClose();
    navigate(`/rooms?room=${encodeURIComponent(room)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container — Full screen on mobile (no top blank gap), clean card on desktop */}
      <div className="relative w-full h-full sm:h-auto max-w-lg bg-[#0e1524] sm:border border-white/15 sm:rounded-3xl rounded-none shadow-2xl sm:max-h-[90vh] flex flex-col z-50 overflow-hidden animate-in fade-in sm:slide-in-from-bottom-4 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10">
              <DoorOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Find Vacant Room Now
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
                  {freeCount} Free Now
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time vacancy for group study & lab work
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3.5 border-b border-white/10 bg-black/20 space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by room number, floor, or amenities (e.g. 2002, AC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setFilterType('free_now')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filterType === 'free_now'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>⚡ Free Right Now</span>
              <span className="text-[10px] opacity-80">({freeCount})</span>
            </button>

            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              All Rooms ({roomsData.length})
            </button>

            <button
              onClick={() => setFilterType('lecture')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterType === 'lecture'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Layers size={12} />
              <span>Lecture Rooms</span>
            </button>

            <button
              onClick={() => setFilterType('lab')}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterType === 'lab'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Sparkles size={12} />
              <span>Specialized Labs</span>
            </button>
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRooms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <DoorOpen size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No rooms matched this filter</p>
              <p className="text-xs text-slate-500">
                Try switching filters to view all rooms or clear search.
              </p>
            </div>
          ) : (
            filteredRooms.map((roomInfo) => {
              const { metadata, isFreeNow, freeDurationLabel } = roomInfo;
              const isCopied = copiedRoom === roomInfo.room;

              return (
                <div
                  key={roomInfo.room}
                  className={`p-4 rounded-2xl border transition-all ${
                    isFreeNow
                      ? 'bg-white/[0.03] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-white/[0.01] border-white/10 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {/* Room Name & Floor */}
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-white tracking-tight">
                          {metadata.displayName}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            metadata.building === 'Admin Building'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : metadata.type === 'lab'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {metadata.building === 'Admin Building'
                            ? 'Admin Building'
                            : metadata.type === 'lab'
                            ? 'Lab Wing'
                            : 'Lecture Hall'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                        <span>{metadata.floor}</span>
                        <span className="text-slate-600">•</span>
                        <Users size={12} className="text-slate-500 flex-shrink-0" />
                        <span>~{metadata.capacity} seats</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex-shrink-0 text-right">
                      {isFreeNow ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                          <span>FREE NOW</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span>OCCUPIED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Free Duration Alert */}
                  <div
                    className={`mt-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
                      isFreeNow
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    }`}
                  >
                    <Clock size={13} className="flex-shrink-0" />
                    <span className="font-semibold">{freeDurationLabel}</span>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {metadata.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyInvite(roomInfo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                      }`}
                      title="Copy room availability to share with friends on WhatsApp or Messenger"
                    >
                      {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                      <span>{isCopied ? 'Copied Invite!' : 'Share with Group'}</span>
                    </button>

                    <button
                      onClick={() => handleSelectRoom(roomInfo.room)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1"
                    >
                      <span>Full Schedule</span>
                      <DoorOpen size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Plus,
  Users,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Meeting } from '../../types';
import { getMeetingGoogleCalendarUrl } from '../../services/googleCalendarService';
import { INITIAL_MEETINGS } from '../../data/mockData';
import { soundEffects } from '../../services/soundEffects';

export const MeetingSchedule: React.FC = () => {
  const {
    meetings,
    currentUser,
    createMeeting,
    setQuickActionModal,
    convertActionItemToTask,
    deleteMeeting
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'all'>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10); // e.g. '2026-11-06'

  const filteredMeetings = meetings.filter(m => {
    if (activeTab === 'today' && m.date !== todayStr) return false;
    if (activeTab === 'upcoming' && m.date < '2026-11-01') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchLoc = (m.location || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc;
    }
    return true;
  });

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header and Controls */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
              <CalendarIcon className="h-5 w-5 text-red-600" />
              <span>Jadwal Meeting & Agenda Rapat Korporat</span>
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              {/* Tabs */}
              <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Mendatang
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'today'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Semua
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.play('success');
                  // Merge INITIAL_MEETINGS Google Calendar events into meetings state
                  INITIAL_MEETINGS.forEach(item => {
                    if (!meetings.some(m => m.id === item.id)) {
                      createMeeting(item);
                    }
                  });
                  setActiveTab('all');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 transition cursor-pointer shadow-2xs"
                title="Import & Sinkronkan semua agenda dari Google Calendar"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Import Google Calendar ({INITIAL_MEETINGS.length})</span>
              </button>

              <button
                onClick={() => setQuickActionModal('meeting')}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Jadwal Baru</span>
              </button>
            </div>
          </div>

          {/* Elongated Search Bar - Memanjang Full Width */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari meeting berdasarkan topik pembahasan, ruang rapat, atau tautan Google Meet..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Meeting Cards List */}
        {filteredMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <CalendarIcon className="h-7 w-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Belum Ada Jadwal Meeting Terdaftar
            </h3>
            <p className="max-w-md text-xs text-slate-500 dark:text-slate-400">
              Tidak ada agenda rapat yang cocok dengan filter aktif saat ini. Anda dapat membuat jadwal meeting baru atau menampilkan seluruh rapat.
            </p>
            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setQuickActionModal('meeting')}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Meeting Baru</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Tampilkan Semua Rapat
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeetings.map(meeting => {
              const isOrganizer = meeting.organizerId === currentUser.id;
              const pendingActionItems = meeting.actionItems.filter(ai => !ai.isConvertedToTask).length;

              return (
                <div
                  key={meeting.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-red-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                <div>
                  {/* Date & Time pill */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-xl bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{meeting.startTime} - {meeting.endTime} WIB</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono">
                      {meeting.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setSelectedMeeting(meeting)}
                    className="mt-3 cursor-pointer text-sm font-bold text-slate-900 hover:text-red-600 transition dark:text-white"
                  >
                    {meeting.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {meeting.description}
                  </p>

                  {/* Location / Link */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{meeting.location}</span>
                  </div>

                  {/* Agenda preview */}
                  {meeting.agenda && meeting.agenda.length > 0 && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-200 text-[10px] uppercase">
                        Poin Agenda:
                      </div>
                      {meeting.agenda.slice(0, 2).map((ag, i) => (
                        <div key={i} className="truncate">
                          • {ag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action items alert & Attendees footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {meeting.actionItems.length > 0 && (
                    <div className="mb-3 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        Action Items ({meeting.actionItems.length})
                      </span>
                      {pendingActionItems > 0 ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {pendingActionItems} belum jadi task
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[10px]">
                          ✓ Seluruhnya jadi task
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {meeting.attendees.map(att => (
                        <img
                          key={att.userId}
                          src={att.avatar}
                          alt={att.name}
                          title={att.name}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={getMeetingGoogleCalendarUrl(meeting)}
                        target="_blank"
                        rel="noreferrer"
                        title="Tambah ke Google Calendar"
                        className="flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                      >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>Calendar</span>
                      </a>
                      {meeting.meetLink && (
                        <a
                          href={meeting.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Meet</span>
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Meeting Detail & Action Items Modal */}
        {selectedMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-red-600 font-mono">
                    {selectedMeeting.date} • {selectedMeeting.startTime} - {selectedMeeting.endTime} WIB
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedMeeting.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Deskripsi</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedMeeting.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Lokasi / Tautan</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span>📍 {selectedMeeting.location}</span>
                    {selectedMeeting.meetLink && (
                      <a
                        href={selectedMeeting.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-red-600 underline flex items-center gap-1"
                      >
                        Buka Tautan Rapat <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Items List with 1-Click Convert to Task! */}
                <div className="rounded-2xl bg-red-50/50 p-4 border border-red-100 dark:bg-red-950/20 dark:border-red-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4" />
                      Action Items Notula Rapat
                    </h4>
                    <span className="text-[10px] text-red-600 dark:text-red-400">
                      Klik tombol untuk konversi jadi Task Kanban
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedMeeting.actionItems.length === 0 ? (
                      <div className="text-[11px] text-slate-500">
                        Tidak ada action items khusus untuk rapat ini.
                      </div>
                    ) : (
                      selectedMeeting.actionItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white p-2.5 shadow-xs dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item.text}
                          </span>

                          {item.isConvertedToTask ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Sudah Jadi Task
                            </span>
                          ) : (
                            <button
                              onClick={() => convertActionItemToTask(selectedMeeting.id, item.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition"
                            >
                              <span>Jadikan Task</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Attendees List */}
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Peserta Pertemuan ({selectedMeeting.attendees.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMeeting.attendees.map(a => (
                      <div
                        key={a.userId}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60"
                      >
                        <img src={a.avatar} alt={a.name} className="h-6 w-6 rounded-full object-cover" />
                        <div className="min-w-0 flex-1 truncate">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{a.name}</div>
                          <div className="text-[10px] text-slate-400">{a.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => {
                    deleteMeeting(selectedMeeting.id);
                    setSelectedMeeting(null);
                  }}
                  className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Batalkan Rapat
                </button>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-red-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

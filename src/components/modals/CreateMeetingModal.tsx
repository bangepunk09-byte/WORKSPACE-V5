import React, { useState } from 'react';
import { X, Calendar, Video, MapPin } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { syncMeetingToGoogleCalendar } from '../../services/googleCalendarService';

export const CreateMeetingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, users, createMeeting } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-03');
  const [startTime, setStartTime] = useState('13:30');
  const [endTime, setEndTime] = useState('14:30');
  const [location, setLocation] = useState('Meeting Room Orion (Lt. 18) / Hybrid');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/wsp-sync-room');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([currentUser.id]);
  const [agendaInput, setAgendaInput] = useState(['Review progress sprint', 'Sinkronisasi blocker lintas tim']);
  const [actionItemsInput, setActionItemsInput] = useState(['Siapkan catatan notula final', 'Update status ticket']);

  const [syncWithGoogleCalendar, setSyncWithGoogleCalendar] = useState(true);

  const toggleAttendee = (id: string) => {
    if (selectedAttendees.includes(id)) {
      if (selectedAttendees.length > 1) {
        setSelectedAttendees(selectedAttendees.filter(a => a !== id));
      }
    } else {
      setSelectedAttendees([...selectedAttendees, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const attendees = selectedAttendees.map(uid => {
      const u = users.find(user => user.id === uid) || currentUser;
      return {
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        role: u.id === currentUser.id ? 'Organizer' : 'Attendee',
        status: 'accepted' as const
      };
    });

    const actionItemsFormatted = actionItemsInput
      .filter(ai => ai.trim().length > 0)
      .map((text, index) => ({
        id: 'ai_' + Date.now() + '_' + index,
        text: text.trim()
      }));

    const newMeetingData = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      meetLink,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerAvatar: currentUser.avatar,
      attendees,
      agenda: agendaInput.filter(a => a.trim().length > 0),
      actionItems: actionItemsFormatted,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString()
    };

    createMeeting(newMeetingData);

    if (syncWithGoogleCalendar) {
      syncMeetingToGoogleCalendar({
        ...newMeetingData,
        id: 'mtg_' + Date.now()
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-600" />
            Jadwalkan Rapat (Meeting) Baru
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Topik / Judul Pertemuan *
            </label>
            <input
              type="text"
              placeholder="contoh: Evaluasi Sinergi Produk Q4 & Review Roadmap"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mulai (WIB)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Selesai (WIB)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Lokasi / Ruang Rapat
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tautan Video (Meet/Zoom)
              </label>
              <input
                type="url"
                value={meetLink}
                onChange={e => setMeetLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Attendees Selector */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Pilih Peserta Undangan ({selectedAttendees.length} dipilih)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-2xl dark:border-slate-800">
              {users.map(u => {
                const isSelected = selectedAttendees.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleAttendee(u.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl p-2 transition ${
                      isSelected
                        ? 'bg-red-50 text-red-700 font-bold dark:bg-red-950 dark:text-red-300'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-red-600"
                    />
                    <img src={u.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <span className="truncate text-[11px]">{u.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync with Google Calendar Toggle Setting */}
          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-2xs">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="font-extrabold text-blue-950 dark:text-blue-200 text-xs">
                  Sync dengan Google Calendar
                </div>
                <div className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                  Otomatis push acara meeting baru ke Google Calendar utama
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={syncWithGoogleCalendar}
                onChange={e => setSyncWithGoogleCalendar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
            >
              Jadwalkan Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

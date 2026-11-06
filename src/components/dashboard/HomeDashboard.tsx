import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CalendarCheck,
  CalendarDays,
  ArrowUpRight,
  Plus,
  Video,
  FileText,
  MessageSquare,
  Users,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Upload,
  Heart,
  Zap,
  MapPin,
  Database,
  Sliders,
  TrendingUp,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Layers,
  EyeOff,
  RotateCcw,
  StickyNote,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ProductivityTrendsChart } from './ProductivityTrendsChart';
import { MemberWorkloadStats } from './MemberWorkloadStats';

import {
  CustomizeOverviewModal,
  OverviewWidgetConfig,
  OverviewWidgetKey,
  DEFAULT_OVERVIEW_CONFIG,
  DEFAULT_WIDGET_ORDER,
  normalizeWidgetOrder,
  WIDGET_DEFINITIONS
} from './CustomizeOverviewModal';

export const HomeDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    meetings,
    documents,
    setActiveTab,
    setQuickActionModal,
    moveTaskStatus,
    setActiveChannelId,
    setIsQuickSearchOpen,
    setIsDbHubOpen
  } = useWorkspace();

  // Overview customizable widgets and order configuration state
  const [overviewConfig, setOverviewConfig] = useState<OverviewWidgetConfig>(() => {
    try {
      const saved = localStorage.getItem('WORKSPACE_OVERVIEW_CONFIG');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_OVERVIEW_CONFIG,
          ...parsed,
          widgetOrder: normalizeWidgetOrder(parsed.widgetOrder)
        };
      }
      return DEFAULT_OVERVIEW_CONFIG;
    } catch {
      return DEFAULT_OVERVIEW_CONFIG;
    }
  });

  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);
  const [isLayoutMode, setIsLayoutMode] = useState<boolean>(false);

  const handleSaveOverviewConfig = (newConfig: OverviewWidgetConfig) => {
    setOverviewConfig(newConfig);
    try {
      localStorage.setItem('WORKSPACE_OVERVIEW_CONFIG', JSON.stringify(newConfig));
    } catch {}
  };

  // In-page quick reorder handlers
  const handleMoveWidgetInPage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= overviewConfig.widgetOrder.length) return;

    const newOrder = [...overviewConfig.widgetOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const updated = { ...overviewConfig, widgetOrder: newOrder };
    handleSaveOverviewConfig(updated);
  };

  const handleHideWidgetInPage = (key: OverviewWidgetKey) => {
    const updated = { ...overviewConfig, [key]: false };
    handleSaveOverviewConfig(updated);
  };

  const handleResetDefaultLayout = () => {
    const updated: OverviewWidgetConfig = {
      ...overviewConfig,
      showHeroGreeting: true,
      showMeetingSchedule: true,
      showPriorityTasks: true,
      showTeamDiscussion: true,
      showProductivityTrends: true,
      showWellnessSection: true,
      showMemberWorkload: true,
      showDocumentsSection: true,
      widgetOrder: [...DEFAULT_WIDGET_ORDER]
    };
    handleSaveOverviewConfig(updated);
  };

  // Weekly Date Strip Selector State
  const [selectedDay, setSelectedDay] = useState<number>(16);

  // Quick Emoji reactions state
  const [reactionsSent, setReactionsSent] = useState<Record<string, number>>({
    '😍': 14,
    '❤️': 28,
    '🔥': 35,
    '⚡': 19,
    '🤝': 22
  });

  const [poppingEmoji, setPoppingEmoji] = useState<string | null>(null);

  const handleAddReaction = (emoji: string) => {
    setReactionsSent(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
    setPoppingEmoji(emoji);
    setTimeout(() => setPoppingEmoji(null), 500);
  };

  // Sticky Notes State for Meeting Notes (Auto-filled Date)
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const [stickyNotes, setStickyNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    color: 'yellow' | 'sky' | 'pink' | 'emerald';
    dateStr: string;
    timeStr: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('WORKSPACE_MEETING_STICKY_NOTES');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'sn_1',
        title: '📌 Sync Weekly Marketing',
        content: 'Bahas bahan tayang reels 3D & jadwal pengunggahan campaign ASLI RI.',
        color: 'yellow',
        dateStr: todayFormatted,
        timeStr: '15.00 WIB'
      },
      {
        id: 'sn_2',
        title: '💡 Catatan Action Sprint',
        content: 'Persiapkan kelengkapan dokumen audit ISO 27001 dan briefing tim staging.',
        color: 'sky',
        dateStr: todayFormatted,
        timeStr: '10.30 WIB'
      }
    ];
  });

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'sky' | 'pink' | 'emerald'>('yellow');

  const handleAddStickyNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const newNote = {
      id: 'sn_' + Date.now(),
      title: newNoteTitle.trim() || '📝 Catatan Meeting',
      content: newNoteContent.trim(),
      color: newNoteColor,
      dateStr: todayFormatted,
      timeStr: nowTime
    };
    const updated = [newNote, ...stickyNotes];
    setStickyNotes(updated);
    try {
      localStorage.setItem('WORKSPACE_MEETING_STICKY_NOTES', JSON.stringify(updated));
    } catch {}
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleDeleteStickyNote = (id: string) => {
    const updated = stickyNotes.filter(n => n.id !== id);
    setStickyNotes(updated);
    try {
      localStorage.setItem('WORKSPACE_MEETING_STICKY_NOTES', JSON.stringify(updated));
    } catch {}
  };

  // Task metrics calculation
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // Tasks worked on in current month
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const tasksWorkedThisMonth = tasks.filter(t => {
    const isThisMonth =
      (t.updatedAt && t.updatedAt.startsWith(currentMonthYear)) ||
      (t.createdAt && t.createdAt.startsWith(currentMonthYear)) ||
      (t.deadline && t.deadline.startsWith(currentMonthYear)) ||
      (t.completedAt && t.completedAt.startsWith(currentMonthYear)) ||
      (t.activity && t.activity.some(a => a.timestamp && a.timestamp.startsWith(currentMonthYear)));
    const isActiveOrDone =
      t.status === 'in_progress' ||
      t.status === 'on_progress' ||
      t.status === 'review' ||
      t.status === 'on_review' ||
      t.status === 'done';
    return isThisMonth || isActiveOrDone;
  });
  const tasksWorkedCount = tasksWorkedThisMonth.length;

  const upcomingMeetings = [...meetings]
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 3);

  const daysOfWeek = [
    { num: 15, day: 'Sen', isToday: false },
    { num: 16, day: 'Sel', isToday: true },
    { num: 17, day: 'Rab', isToday: false },
    { num: 18, day: 'Kam', isToday: false },
    { num: 19, day: 'Jum', isToday: false },
    { num: 20, day: 'Sab', isToday: false }
  ];

  // In-page toolbar when layout mode is active
  const renderWidgetToolbar = (
    key: OverviewWidgetKey,
    index: number,
    title: string
  ) => {
    if (!isLayoutMode) return null;
    const isFirst = index === 0;
    const isLast = index === overviewConfig.widgetOrder.length - 1;

    return (
      <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 backdrop-blur-md flex items-center justify-between text-xs font-bold shadow-lg ring-2 ring-blue-500/40 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-600 text-white text-[10px] font-black shrink-0">
            {index + 1}
          </span>
          <span className="truncate text-[11px]">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={e => {
              e.stopPropagation();
              handleMoveWidgetInPage(index, 'up');
            }}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
              isFirst
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 dark:bg-slate-200 dark:hover:bg-slate-300 active:scale-95'
            }`}
            title="Pindahkan ke atas"
          >
            <ArrowUp className="h-3 w-3" />
            <span className="hidden sm:inline">Naik</span>
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={e => {
              e.stopPropagation();
              handleMoveWidgetInPage(index, 'down');
            }}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] ${
              isLast
                ? 'opacity-30 cursor-not-allowed'
                : 'bg-white/20 hover:bg-white/30 dark:bg-slate-200 dark:hover:bg-slate-300 active:scale-95'
            }`}
            title="Pindahkan ke bawah"
          >
            <ArrowDown className="h-3 w-3" />
            <span className="hidden sm:inline">Turun</span>
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleHideWidgetInPage(key);
            }}
            className="px-2 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white dark:bg-red-100 dark:text-red-700 dark:hover:bg-red-500 dark:hover:text-white text-[10px] transition cursor-pointer flex items-center gap-0.5"
            title="Sembunyikan modul ini"
          >
            <EyeOff className="h-3 w-3" />
            <span className="hidden sm:inline">Tutup</span>
          </button>
        </div>
      </div>
    );
  };

  // 1. Sapaan & Ringkasan Hari Ini
  const renderHeroGreeting = (index: number) => {
    if (!overviewConfig.showHeroGreeting) return null;

    return (
      <div key="showHeroGreeting" className="col-span-12 relative animate-in fade-in duration-300">
        {renderWidgetToolbar('showHeroGreeting', index, 'Sapaan & Ringkasan Hari Ini')}
        <div className="bento-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-200">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="chip-sky rounded-full px-3.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs hover:scale-102 transition-transform">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>WORKSPACE Corporate Hub</span>
                </span>
                <span className="chip-emerald rounded-full px-3.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs hover:scale-102 transition-transform">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sistem Normal</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                  Hi, {currentUser.name.split(' ')[0]}! 👋
                </h1>
                  {/* Subheadline removed */}
              </div>

              {/* Team Members Overlapping Avatars */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tim Kolaborasi:
                </span>
                <div className="flex items-center -space-x-2">
                  {users.slice(0, 5).map(u => (
                    <img
                      key={u.id}
                      src={u.avatar}
                      alt={u.name}
                      title={`${u.name} - ${u.position}`}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-2xs transition-transform hover:scale-115 hover:z-20 cursor-pointer"
                    />
                  ))}
                  {users.length > 5 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900 shadow-2xs hover:scale-110 transition-transform">
                      +{users.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Tasks Count & Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tighter">
                  {tasksWorkedCount}
                </span>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="font-bold text-slate-800 dark:text-slate-200">Task Dikerjakan</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" /> Bulan {currentMonthName}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDbHubOpen(true)}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Pusat Basis Data Modern (IndexedDB & Cloud Sync)"
                >
                  <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Basis Data</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setQuickActionModal('leave')}
                  className="rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CalendarCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ajukan Cuti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickActionModal('task')}
                  className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-red-600" />
                  <span>Tugas Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickActionModal('document')}
                  className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100 dark:hover:bg-slate-750 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/60 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  <span>Upload Dokumen</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 -top-10 h-32 w-32 rounded-full bg-red-400/10 blur-2xl" />
        </div>
      </div>
    );
  };

  // 2. Jadwal Rapat & Agenda
  const renderMeetingSchedule = (index: number) => {
    if (!overviewConfig.showMeetingSchedule) return null;

    return (
      <div key="showMeetingSchedule" className="col-span-12 md:col-span-6 lg:col-span-4 relative flex flex-col animate-in fade-in duration-300">
        {renderWidgetToolbar('showMeetingSchedule', index, 'Jadwal Rapat & Agenda')}
        <div className="bento-card p-6 flex-1 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="chip-sky rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Jadwal Meeting</span>
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {meetings.length} Sesi
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {upcomingMeetings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <CalendarDays className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada jadwal meeting</p>
                  <p className="text-[11px]">Klik "+ Add" untuk membuat agenda rapat baru.</p>
                </div>
              ) : (
                upcomingMeetings.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition space-y-2 group/meet"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="chip-purple rounded-full px-2 py-0.5 text-[10px] font-bold">
                            {m.startTime} — {m.endTime}
                          </span>
                          <span className="chip-sky rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            {m.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover/meet:text-blue-600 dark:group-hover/meet:text-blue-400 transition-colors">
                          {m.title}
                        </h4>
                      </div>
                      {m.meetLink && (
                        <a
                          href={m.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-2.5 py-1 text-[11px] font-bold shrink-0 border border-slate-200 dark:border-slate-700 transition"
                          title="Buka Google Meet"
                        >
                          <Video className="h-3 w-3 text-blue-600" />
                          <span>Meet</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="truncate max-w-[170px] flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{m.location || 'Online Meet'}</span>
                      </span>
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {(m.attendees || []).slice(0, 3).map((att, i) => (
                          <img
                            key={i}
                            src={att.avatar}
                            alt={att.name}
                            title={att.name}
                            className="h-5 w-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickActionModal('meeting')}
              className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
            >
              <Plus className="h-3.5 w-3.5 text-blue-500" />
              <span>Tambah Jadwal Meeting</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              Semua ({meetings.length})
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 3. Tugas Prioritas Hari Ini
  const renderPriorityTasks = (index: number) => {
    if (!overviewConfig.showPriorityTasks) return null;

    return (
      <div key="showPriorityTasks" className="col-span-12 md:col-span-6 lg:col-span-4 relative flex flex-col animate-in fade-in duration-300">
        {renderWidgetToolbar('showPriorityTasks', index, 'Tugas Prioritas Hari Ini')}
        <div className="bento-card p-6 flex-1 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="chip-orange rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Tugas Prioritas Hari Ini</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Lihat Kanban</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <CheckSquare className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Belum ada tugas prioritas</p>
                  <p className="text-[11px]">Klik "+ Tambah Item Tugas Baru" untuk memulai.</p>
                </div>
              ) : (
                tasks.slice(0, 3).map(task => {
                  const isUrgent = task.priority === 'urgent';
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isUrgent ? 'chip-rose' : task.priority === 'high' ? 'chip-orange' : 'chip-sky'
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                            <span className="chip-purple rounded-full px-2 py-0.5 text-[10px] font-semibold">
                              {(task.brand || task.project || 'Asli RI').split(' ')[0]}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => moveTaskStatus(task.id, isDone ? 'in_progress' : 'done')}
                          title={isDone ? 'Buka kembali' : 'Tandai selesai'}
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition active:scale-90 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500 hover:text-emerald-500'
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Deadline: {task.deadline}</span>
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {task.checklists.filter(c => c.completed).length}/{task.checklists.length} Checklist
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setQuickActionModal('task')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer active:scale-98"
          >
            <Plus className="h-3.5 w-3.5 text-red-600" />
            <span>Tambah Item Tugas Baru</span>
          </button>
        </div>
      </div>
    );
  };

  // 4. Diskusi & Aktivitas Tim
  const renderTeamDiscussion = (index: number) => {
    if (!overviewConfig.showTeamDiscussion) return null;

    return (
      <div key="showTeamDiscussion" className="col-span-12 md:col-span-6 lg:col-span-4 relative flex flex-col animate-in fade-in duration-300">
        {renderWidgetToolbar('showTeamDiscussion', index, 'Diskusi & Aktivitas Tim')}
        <div className="bento-card p-6 flex-1 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="chip-purple rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Pesan & Diskusi Tim</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Buka Feed</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={users[0]?.avatar}
                  alt="Saeful Rohman"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-red-500/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{users[0]?.name}</span>
                    <span className="rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1 text-[9px] font-extrabold">
                      BoD
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Hari ini, 09:15 • saeful.rohman@asliri.id
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                "Pembaruan infrastruktur microservices dan audit ISO 27001 tahap akhir telah mencapai 94%. Terima kasih rekan-rekan atas dedikasinya!"
              </p>

              {/* Animated Emojis Bar */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap">
                {['😍', '❤️', '🔥', '⚡', '🤝'].map(emo => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => handleAddReaction(emo)}
                    className={`flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-1 text-xs hover:scale-108 active:scale-92 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs ${
                      poppingEmoji === emo ? 'scale-125 bg-blue-50 border-blue-400' : ''
                    }`}
                  >
                    <span className="transition-transform">{emo}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {reactionsSent[emo] || 10}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              onClick={() => {
                setActiveTab('chat');
                setActiveChannelId('chn_tech');
              }}
              className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group hover:border-blue-300 dark:hover:border-slate-600 transition hover:shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  #tech
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    #tech-engineering
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cluster staging sudah ter-update...
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                2 Baru
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-98"
          >
            <MessageSquare className="h-3.5 w-3.5 text-red-500" />
            <span>Buka Obrolan Tim</span>
          </button>
        </div>
      </div>
    );
  };

  // 5. Tren Beban Kerja & Performa (Team)
  const renderProductivityTrends = (index: number) => {
    if (!overviewConfig.showProductivityTrends) return null;

    // Responsive span: 8 cols if wellness is also active, otherwise full 12 cols
    const colSpan = overviewConfig.showWellnessSection ? 'col-span-12 lg:col-span-8' : 'col-span-12';

    return (
      <div key="showProductivityTrends" className={`${colSpan} relative animate-in fade-in duration-300`}>
        {renderWidgetToolbar('showProductivityTrends', index, 'Tren Beban Kerja & Performa')}
        <div className="bento-card p-6 h-full flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Performa & Beban Kerja Tim</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring penyelesaian tugas dan ketepatan waktu operasional.
              </p>
            </div>

            {/* Weekly Days Strip */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              {daysOfWeek.map(d => {
                const isSelected = selectedDay === d.num;
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => setSelectedDay(d.num)}
                    className={`flex flex-col items-center justify-center w-9 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] font-medium opacity-80">{d.day}</span>
                    <span>{d.num}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ProductivityTrendsChart />
        </div>
      </div>
    );
  };

  // 6. Checklist Tracker Catatan Meeting Hari Ini (Tanggal Terisi Otomatis)
  const renderWellnessSection = (index: number) => {
    if (!overviewConfig.showWellnessSection) return null;

    return (
      <div key="showWellnessSection" className="col-span-12 md:col-span-6 lg:col-span-4 relative flex flex-col animate-in fade-in duration-300">
        {renderWidgetToolbar('showWellnessSection', index, 'Checklist Tracker Catatan Meeting Hari Ini')}
        <div className="bento-card p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <span className="chip-sky rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
                <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Tracker Meeting Hari Ini</span>
              </span>
              <span className="text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                📅 {todayFormatted}
              </span>
            </div>

            {/* Form to quick add checklist item if active */}
            {isAddingNote && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 mb-3 animate-in fade-in zoom-in-95 duration-150">
                <input
                  type="text"
                  placeholder="Judul / Poin Checklist Meeting..."
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Detail agenda / action item..."
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newNoteTitle.trim()) return;
                      const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                      const newNote = {
                        id: 'sn_' + Date.now(),
                        title: newNoteTitle.trim(),
                        content: newNoteContent.trim(),
                        color: 'yellow' as const,
                        dateStr: todayFormatted,
                        timeStr: nowTime,
                        completed: false
                      };
                      const updated = [newNote, ...stickyNotes];
                      setStickyNotes(updated);
                      try {
                        localStorage.setItem('WORKSPACE_MEETING_STICKY_NOTES', JSON.stringify(updated));
                      } catch {}
                      setNewNoteTitle('');
                      setNewNoteContent('');
                      setIsAddingNote(false);
                    }}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    Tambah Checklist
                  </button>
                </div>
              </div>
            )}

            {/* Checklist Tracker List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
              {stickyNotes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
                  <CheckSquare className="h-7 w-7 mx-auto opacity-40 text-slate-400" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Belum Ada Checklist Meeting</p>
                  <p className="text-[11px]">Klik "+ Tambah Checklist Agenda" di bawah.</p>
                </div>
              ) : (
                stickyNotes.map((note: any) => {
                  const isDone = note.completed;
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        const updated = stickyNotes.map((n: any) =>
                          n.id === note.id ? { ...n, completed: !n.completed } : n
                        );
                        setStickyNotes(updated);
                        try {
                          localStorage.setItem('WORKSPACE_MEETING_STICKY_NOTES', JSON.stringify(updated));
                        } catch {}
                      }}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 shadow-2xs ${
                        isDone
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-75'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-blue-300'
                      }`}
                    >
                      <button
                        type="button"
                        className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-500'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                            {note.title}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStickyNote(note.id);
                            }}
                            className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer shrink-0"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {note.content && (
                          <p className={`text-[11px] mt-0.5 leading-relaxed ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                            {note.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 mt-1 border-t border-slate-100 dark:border-slate-700/50">
                          <span>🕒 {note.timeStr || 'Hari Ini'}</span>
                          <span>{note.dateStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {!isAddingNote && (
            <button
              type="button"
              onClick={() => setIsAddingNote(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/70 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 py-2.5 text-xs font-bold text-blue-700 dark:text-blue-300 transition cursor-pointer active:scale-98"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Tambah Checklist Agenda Meeting</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // 7. Beban Kerja & Kapasitas Personel Tim (Default below Performa Tim)
  const renderMemberWorkload = (index: number) => {
    if (!overviewConfig.showMemberWorkload) return null;

    return (
      <div key="showMemberWorkload" className="col-span-12 relative animate-in fade-in duration-300">
        {renderWidgetToolbar('showMemberWorkload', index, 'Beban Kerja & Kapasitas Personel Tim')}
        <MemberWorkloadStats />
      </div>
    );
  };

  // 8. Dokumen & SOP Perusahaan
  const renderDocumentsSection = (index: number) => {
    if (!overviewConfig.showDocumentsSection) return null;

    return (
      <div key="showDocumentsSection" className="col-span-12 relative animate-in fade-in duration-300">
        {renderWidgetToolbar('showDocumentsSection', index, 'Dokumen & SOP Perusahaan')}
        <div className="bento-card p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="chip-sky rounded-full px-3 py-1 text-xs font-bold inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Dokumen Panduan & SOP Resmi</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Buka Document Center ({documents.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {documents.slice(0, 3).map(doc => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition flex items-start gap-3 group hover:scale-101"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 shrink-0 font-bold text-xs uppercase shadow-2xs group-hover:scale-105 transition-transform">
                  {doc.fileType}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{doc.downloadsCount} diunduh</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Dispatcher for each widget key
  const renderWidgetByKey = (key: OverviewWidgetKey, index: number) => {
    switch (key) {
      case 'showHeroGreeting':
        return renderHeroGreeting(index);
      case 'showMeetingSchedule':
        return renderMeetingSchedule(index);
      case 'showPriorityTasks':
        return renderPriorityTasks(index);
      case 'showTeamDiscussion':
        return renderTeamDiscussion(index);
      case 'showProductivityTrends':
        return renderProductivityTrends(index);
      case 'showWellnessSection':
        return renderWellnessSection(index);
      case 'showMemberWorkload':
        return renderMemberWorkload(index);
      case 'showDocumentsSection':
        return renderDocumentsSection(index);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Top Header & Overview Customization / Layout Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Ringkasan Operasional & Tim
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Full Customization Modal Button */}
          <button
            type="button"
            onClick={() => setShowCustomizeModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer active:scale-95"
            title="Kustomisasi modul & widget Overview"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Kustomisasi Overview</span>
          </button>
        </div>
      </div>

      {/* In-Page Layout Mode Guide Banner */}
      {isLayoutMode && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ring-1 ring-blue-400/40 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <div className="font-extrabold text-sm">Mode Pengaturan Tata Letak Aktif</div>
              <div className="text-[11px] text-blue-100">
                Gunakan tombol panah <strong>Naik</strong> / <strong>Turun</strong> di setiap kartu untuk menyusun urutan, atau buka <strong>Kustomisasi Overview</strong> untuk drag & drop.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaultLayout}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="Kembalikan urutan default: Beban Kerja Personel di bawah Performa Tim"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLayoutMode(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold transition cursor-pointer shadow-xs active:scale-95"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* 12-COLUMN RESPONSIVE GRID RENDERING WIDGETS IN EXACT widgetOrder */}
      <div className="grid grid-cols-12 gap-5 items-stretch">
        {overviewConfig.widgetOrder.map((key, index) => renderWidgetByKey(key, index))}
      </div>

      {/* Overview Customization Modal with Drag & Drop */}
      {showCustomizeModal && (
        <CustomizeOverviewModal
          currentConfig={overviewConfig}
          onSave={handleSaveOverviewConfig}
          onClose={() => setShowCustomizeModal(false)}
        />
      )}
    </div>
  );
};

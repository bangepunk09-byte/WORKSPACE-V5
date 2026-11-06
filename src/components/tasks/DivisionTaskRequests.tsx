import React, { useState } from 'react';
import {
  GitPullRequest,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  User,
  ArrowRight,
  ArrowRightLeft,
  X,
  Check,
  FileText,
  Paperclip,
  Sparkles,
  Inbox,
  Send,
  Kanban,
  AlertTriangle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { DivisionTaskRequest } from '../../types';

export const DivisionTaskRequests: React.FC = () => {
  const {
    currentUser,
    users,
    divisions,
    divisionRequests,
    createDivisionRequest,
    acceptDivisionRequest,
    declineDivisionRequest,
    setActiveTab
  } = useWorkspace();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeclineReqId, setSelectedDeclineReqId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqTargetDept, setReqTargetDept] = useState('Product & Design');
  const [reqTargetAssigneeId, setReqTargetAssigneeId] = useState('');
  const [reqPriority, setReqPriority] = useState<DivisionTaskRequest['priority']>('high');
  const [reqDeadline, setReqDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reqDescription, setReqDescription] = useState('');
  const [reqAttachmentName, setReqAttachmentName] = useState('');

  // Division options
  const divisionOptions = [
    'Technology & Engineering',
    'Product & Design',
    'Marketing & Brand',
    'People Operations & Culture',
    'Finance & Legal',
    'HRGA'
  ];

  // Target dept users for optional assignment
  const targetDeptUsers = users.filter(u =>
    u.department.toLowerCase().includes(reqTargetDept.toLowerCase()) ||
    reqTargetDept.toLowerCase().includes(u.department.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDescription.trim()) return;

    const targetUser = users.find(u => u.id === reqTargetAssigneeId);

    createDivisionRequest({
      title: reqTitle.trim(),
      description: reqDescription.trim(),
      requestorId: currentUser.id,
      requestorName: currentUser.name,
      requestorAvatar: currentUser.avatar,
      requestorDept: currentUser.department,
      requestorPosition: currentUser.position,
      targetDept: reqTargetDept,
      targetAssigneeId: targetUser?.id,
      targetAssigneeName: targetUser?.name,
      targetAssigneeAvatar: targetUser?.avatar,
      priority: reqPriority,
      deadline: reqDeadline,
      attachmentName: reqAttachmentName.trim() || undefined
    });

    // Reset form
    setReqTitle('');
    setReqDescription('');
    setReqAttachmentName('');
    setShowCreateModal(false);
  };

  const handleConfirmDecline = () => {
    if (!selectedDeclineReqId) return;
    declineDivisionRequest(selectedDeclineReqId, declineReason.trim());
    setSelectedDeclineReqId(null);
    setDeclineReason('');
  };

  // Filter requests
  const filteredRequests = divisionRequests.filter(req => {
    // 1. Tab filter
    if (activeTabFilter === 'incoming') {
      const isMyDept = req.targetDept.toLowerCase().includes(currentUser.department.toLowerCase()) ||
        currentUser.department.toLowerCase().includes(req.targetDept.toLowerCase());
      if (!isMyDept && req.targetAssigneeId !== currentUser.id) return false;
    } else if (activeTabFilter === 'outgoing') {
      if (req.requestorId !== currentUser.id) return false;
    }

    // 2. Status filter
    if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchDesc = req.description.toLowerCase().includes(q);
      const matchRequestor = req.requestorName.toLowerCase().includes(q);
      const matchDept = req.requestorDept.toLowerCase().includes(q) || req.targetDept.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchRequestor && !matchDept) return false;
    }

    return true;
  });

  const pendingCount = divisionRequests.filter(r => r.status === 'pending').length;
  const acceptedCount = divisionRequests.filter(r => r.status === 'accepted').length;

  const getPriorityStyle = (priority: DivisionTaskRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header Card */}
      <div className="rounded-[32px] border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
              <GitPullRequest className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  Permintaan Tugas Antar Divisi
                </h1>
                <span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-0.5 text-xs font-bold border border-blue-200 dark:border-blue-900">
                  {divisionRequests.length} Total Request
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Ajukan Request Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          {/* Main Tabs: All, Incoming, Outgoing */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTabFilter('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTabFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span>Semua Permintaan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('incoming')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTabFilter === 'incoming'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Inbox className="h-3.5 w-3.5 text-blue-600" />
              <span>Ditujukan ke Divisi Saya</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabFilter('outgoing')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTabFilter === 'outgoing'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Send className="h-3.5 w-3.5 text-purple-600" />
              <span>Diajukan oleh Saya</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul / pemohon..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Tindakan ({pendingCount})</option>
              <option value="accepted">Diterima / Masuk To-Do ({acceptedCount})</option>
              <option value="declined">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Request Cards formatted cleanly */}
      {filteredRequests.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Tidak ada permintaan tugas yang ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tombol "Ajukan Request Baru" di atas untuk meminta bantuan atau koordinasi tugas dengan divisi lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map(req => {
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';
            const isDeclined = req.status === 'declined';

            return (
              <div
                key={req.id}
                className="rounded-[28px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md flex flex-col justify-between space-y-4"
              >
                {/* 1. Header Card: Requestor Profile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Requestor Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={req.requestorAvatar}
                        alt={req.requestorName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {req.requestorName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {req.requestorPosition || 'Pemohon Tugas'}
                        </div>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider border ${getPriorityStyle(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  {/* Division Routing: Requestor Dept ➔ Target Dept */}
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 text-xs font-semibold border border-slate-100 dark:border-slate-800">
                    <span className="text-blue-600 dark:text-blue-400 truncate font-bold">
                      {req.requestorDept}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-purple-600 dark:text-purple-400 truncate font-bold">
                      {req.targetDept}
                    </span>
                  </div>

                  {/* Task Request Title */}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {req.title}
                  </h3>

                  {/* Brief / Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {req.description}
                  </p>

                  {/* Metadata Row: Deadline & Attachment */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-red-500" />
                      <span>Target: {req.deadline}</span>
                    </div>

                    {req.attachmentName && (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[200px]">
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{req.attachmentName}</span>
                      </div>
                    )}

                    <div className="ml-auto text-xs text-slate-400">
                      Diajukan: {req.createdAt}
                    </div>
                  </div>
                </div>

                {/* 2. Status & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isPending && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                        <span>Menunggu Diterima</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDeclineReqId(req.id);
                            setDeclineReason('');
                          }}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => acceptDivisionRequest(req.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          <span>Terima & Masuk To-Do</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                          Diterima oleh {req.acceptedBy?.name || 'Personel'} • Telah masuk To-Do
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('tasks')}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:underline shrink-0 cursor-pointer"
                      >
                        <Kanban className="h-3.5 w-3.5" />
                        <span>Buka di Board ➔</span>
                      </button>
                    </div>
                  )}

                  {isDeclined && (
                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Permintaan ditolak: {req.declinedReason || 'Kapasitas divisi sedang penuh.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Buat Request Tugas Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ajukan Permintaan Tugas Lintas Divisi
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kirim brief tugas formal ke departemen tujuan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Judul Request */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tugas / Pekerjaan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desain Banner UI Promo & Asset Marketing Q4"
                  value={reqTitle}
                  onChange={e => setReqTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Routing: Divisi Pemohon (Auto) & Divisi Tujuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Divisi Pemohon (Anda)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.department}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Divisi Tujuan *
                  </label>
                  <select
                    value={reqTargetDept}
                    onChange={e => {
                      setReqTargetDept(e.target.value);
                      setReqTargetAssigneeId('');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {divisionOptions
                      .filter(d => !d.toLowerCase().includes(currentUser.department.toLowerCase()))
                      .map(d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Personel Spesifik (Opsional) & Prioritas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Personel Spesifik (Opsional)
                  </label>
                  <select
                    value={reqTargetAssigneeId}
                    onChange={e => setReqTargetAssigneeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Siapa saja di divisi {reqTargetDept}</option>
                    {targetDeptUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={reqPriority}
                    onChange={e => setReqPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="urgent">Urgent (Segera)</option>
                    <option value="high">High (Penting)</option>
                    <option value="medium">Medium (Standar)</option>
                    <option value="low">Low (Fleksibel)</option>
                  </select>
                </div>
              </div>

              {/* Tenggat Waktu & Lampiran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenggat Waktu Selesai *
                  </label>
                  <input
                    type="date"
                    required
                    value={reqDeadline}
                    onChange={e => setReqDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    File Lampiran / Link Dokumen
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Brief_Desain_Google_Drive.pdf"
                    value={reqAttachmentName}
                    onChange={e => setReqAttachmentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Rincian Deskripsi / Brief Pekerjaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Spesifikasi Kebutuhan *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan kebutuhan tugas, deliverable yang diharapkan, format berkas, serta konteks pekerjaan secara detail..."
                  value={reqDescription}
                  onChange={e => setReqDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Permintaan ke Divisi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tolak Request */}
      {selectedDeclineReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Konfirmasi Penolakan Request</span>
            </h3>
            <p className="text-xs text-slate-500">
              Berikan alasan singkat kepada pemohon tugas agar dapat dilakukan penyesuaian:
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Kapasitas sprint minggu ini sedang penuh atau scope perlu diperjelas..."
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedDeclineReqId(null)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-1.5 text-xs font-bold text-white transition cursor-pointer"
              >
                Tolak Permintaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

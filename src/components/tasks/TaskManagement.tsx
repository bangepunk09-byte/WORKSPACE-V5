import React, { useState, useEffect } from 'react';
import {
  Kanban,
  List,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Check,
  Clock,
  AlertCircle,
  MoreVertical,
  CheckSquare,
  MessageSquare,
  Paperclip,
  User,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Trash2,
  X,
  Flag,
  FileBarChart,
  ShieldAlert,
  Send,
  AlertTriangle,
  FileText,
  Building2,
  Lock,
  Sparkles,
  Printer,
  CalendarDays,
  Clapperboard,
  Film,
  Video,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  Mail,
  Archive,
  RotateCcw,
  Link as LinkIcon,
  Sliders,
  GitPullRequest,
  Bot,
  Cpu,
  FileSpreadsheet
} from 'lucide-react';
import { GanttChartTimeline } from './GanttChartTimeline';
import { TaskProductivityChart } from './TaskProductivityChart';
import { ArchiveView } from './ArchiveView';
import { AutomationSettingsModal } from './AutomationSettingsModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskExportImportModal } from '../modals/TaskExportImportModal';
import {
  CustomizeTaskLayoutModal,
  TaskWidgetConfig,
  DEFAULT_TASK_WIDGET_CONFIG,
  TaskWidgetKey,
  DEFAULT_TASK_WIDGET_ORDER
} from './CustomizeTaskLayoutModal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { soundEffects } from '../../services/soundEffects';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCheckpoint,
  TaskReportItem,
  VideoDraftScene,
  SlideDraftItem,
  PosterDraftItem,
  CreativeBriefFormat,
  TaskApproval
} from '../../types';

// Group / Division Definitions
interface GroupMeta {
  id: string;
  name: string;
  departmentMatch: string;
  color: string;
}

const TASK_GROUPS: GroupMeta[] = [
  { id: 'tech', name: 'Technology & Engineering', departmentMatch: 'Technology & Engineering', color: 'bg-blue-600' },
  { id: 'product', name: 'Product & Design', departmentMatch: 'Product & Design', color: 'bg-purple-600' },
  { id: 'hr', name: 'People Operations & HR', departmentMatch: 'People Operations & Culture', color: 'bg-emerald-600' },
  { id: 'marketing', name: 'Marketing & Brand', departmentMatch: 'Marketing & Brand', color: 'bg-amber-600' },
  { id: 'finance', name: 'Finance & Legal', departmentMatch: 'Finance & Legal', color: 'bg-rose-600' }
];

export const TaskManagement: React.FC = () => {
  const {
    currentUser,
    users,
    tasks,
    setTasks,
    divisions,
    selectedTaskGroup,
    setSelectedTaskGroup,
    moveTaskStatus,
    setQuickActionModal,
    deleteTask,
    toggleChecklistItem,
    toggleTaskCheckpoint,
    addTaskCheckpoint,
    addTaskReport,
    sendTaskForApproval,
    processTaskApproval,
    updateTask,
    updateTaskBriefFormat,
    updateTaskVideoDraft,
    updateTaskSlideDraft,
    updateTaskPosterDraft,
    channels,
    addAuditLog,
    archiveTask,
    unarchiveTask,
    managedBrands,
    setIsBrandModalOpen,
    divisionRequests,
    setActiveTab,
    automationConfigs,
    updateDivisionAutomationConfig,
    toggleDivisionAdvancedMode,
    runWeeklyGeneration,
    runAutoArchive,
    restoreTaskFromArchive,
    automationHistory,
    automationToast,
    setAutomationToast
  } = useWorkspace();

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Task layout customization state
  const [showCustomizeLayoutModal, setShowCustomizeLayoutModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [layoutSavedToast, setLayoutSavedToast] = useState(false);
  const [cardDisplayMode, setCardDisplayMode] = useState<'standard' | 'detailed'>(() => {
    try {
      const saved = localStorage.getItem('TASK_CARD_DISPLAY_MODE');
      if (saved === 'detailed' || saved === 'standard') return saved;
      const layoutCfg = localStorage.getItem('task_management_layout_config');
      if (layoutCfg) {
        const parsed = JSON.parse(layoutCfg);
        if (parsed.cardStyle) return parsed.cardStyle;
      }
    } catch {}
    return 'standard';
  });

  const handleImportTasks = (importedList: Partial<Task>[]) => {
    const newTasks: Task[] = importedList.map((t, idx) => ({
      id: 'tsk_imp_' + Date.now() + '_' + idx,
      title: t.title || 'Imported Task',
      titleFontWeight: t.titleFontWeight || 'bold',
      description: t.description || '',
      status: (t.status || 'todo') as any,
      priority: (t.priority || 'medium') as any,
      brand: t.brand || 'ASLI RI',
      contentType: t.contentType || 'Regular',
      category: t.contentType || 'Regular',
      requestorId: currentUser.id,
      requestorName: currentUser.name,
      assigneeId: users[0]?.id || currentUser.id,
      assigneeName: t.assigneeName || users[0]?.name || currentUser.name,
      assigneeAvatar: users[0]?.avatar || currentUser.avatar,
      assigneeDept: activeGroupId === 'all' ? 'Marketing & Brand' : activeGroupId,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      groupId: activeGroupId === 'all' ? 'tech' : activeGroupId,
      groupName: activeGroupId === 'all' ? 'Semua Divisi' : activeGroupId,
      deadline: t.deadline || new Date().toISOString().slice(0, 10),
      publishDate: t.publishDate || '20 Nov 2026',
      labels: [t.contentType || 'Regular'],
      checklists: [],
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now() + '_' + idx,
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Diimpor dari file CSV/Excel (Font disesuaikan)',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    setTasks(prev => [...newTasks, ...prev]);
    try {
      soundEffects.play('success');
    } catch {}
  };
  const [taskLayoutConfig, setTaskLayoutConfig] = useState<TaskWidgetConfig>(() => {
    try {
      const saved = localStorage.getItem('task_management_layout_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultOrder = DEFAULT_TASK_WIDGET_ORDER;
        const currentOrder = Array.isArray(parsed.widgetOrder) ? parsed.widgetOrder : defaultOrder;
        const sanitized = Array.from(new Set([...currentOrder, ...defaultOrder])).filter(k => defaultOrder.includes(k as TaskWidgetKey)) as TaskWidgetKey[];
        return {
          ...DEFAULT_TASK_WIDGET_CONFIG,
          ...parsed,
          widgetOrder: sanitized
        };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TASK_WIDGET_CONFIG;
  });

  const handleSaveLayoutConfig = (newConfig: TaskWidgetConfig) => {
    setTaskLayoutConfig(newConfig);
    if (newConfig.cardStyle) {
      setCardDisplayMode(newConfig.cardStyle);
      try {
        localStorage.setItem('TASK_CARD_DISPLAY_MODE', newConfig.cardStyle);
      } catch (e) {
        console.error(e);
      }
    }
    try {
      localStorage.setItem('task_management_layout_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    setLayoutSavedToast(true);
    setTimeout(() => {
      setLayoutSavedToast(false);
    }, 3500);
  };

  // Determine user's home group ID based on their department
  const userHomeGroup = TASK_GROUPS.find(g =>
    currentUser.department.toLowerCase().includes(g.departmentMatch.toLowerCase()) ||
    g.departmentMatch.toLowerCase().includes(currentUser.department.toLowerCase())
  ) || TASK_GROUPS[0];

  // Active group: Non-super admins are strictly locked to their division
  const activeGroupId = isSuperAdmin ? (selectedTaskGroup || 'all') : userHomeGroup.id;

  // Active division automation configuration
  const currentDivisionConfig = automationConfigs[activeGroupId] || (activeGroupId === 'all' ? automationConfigs['marketing'] : undefined);

  // Access check: Super admin can access anything. Others can only access their home division.
  const hasAccessToCurrentGroup = isSuperAdmin || activeGroupId === userHomeGroup.id;

  // DEFAULT VIEW MODE IS NOW EXPLICITLY 'kanban' (BOARD) WITH 'archive' TAB SUPPORT
  const [viewMode, setViewMode] = useState<'overview' | 'kanban' | 'timeline' | 'list' | 'archive'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [mobileStageFilter, setMobileStageFilter] = useState<string>('all');

  // Approval modal state: for sending task to channel/group for manager approval
  const [approvalModalTask, setApprovalModalTask] = useState<Task | null>(null);
  const [approvalCustomMessage, setApprovalCustomMessage] = useState('');
  const [approvalChannelId, setApprovalChannelId] = useState<string>('chn_general');
  const [approvalManagerIds, setApprovalManagerIds] = useState<string[]>([]);

  const openApprovalModal = (task: Task) => {
    setApprovalModalTask(task);
    setApprovalCustomMessage(`Mohon review dan persetujuan untuk tugas: "${task.title}"`);
    const divOrGroup = (task.groupName || task.assigneeDept || '').toLowerCase();
    const matchedChan = channels.find(c => c.name.toLowerCase().includes(divOrGroup) || divOrGroup.includes(c.name.toLowerCase()));
    if (matchedChan) {
      setApprovalChannelId(matchedChan.id);
    } else if (channels.length > 0) {
      setApprovalChannelId(channels[0].id);
    }
  };

  // Mini Report Modal state & Email Dispatch
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProductivityTrend, setShowProductivityTrend] = useState(true);

  // Email report dispatch state
  const managersList = users.filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin');
  const [reportTargetManagerEmail, setReportTargetManagerEmail] = useState('');
  const [reportCcList, setReportCcList] = useState<string[]>(['executive@asliri.id']);
  const [reportCcInput, setReportCcInput] = useState('');
  const [reportMemo, setReportMemo] = useState('');
  const [isSendingReportEmail, setIsSendingReportEmail] = useState(false);
  const [reportEmailSentSuccess, setReportEmailSentSuccess] = useState(false);

  const handleAddCc = () => {
    if (!reportCcInput.trim()) return;
    const clean = reportCcInput.trim().toLowerCase();
    if (!reportCcList.includes(clean)) {
      setReportCcList(prev => [...prev, clean]);
    }
    setReportCcInput('');
  };

  const handleRemoveCc = (item: string) => {
    setReportCcList(prev => prev.filter(c => c !== item));
  };

  const handleSendReportEmail = () => {
    const finalManager = reportTargetManagerEmail || (managersList[0]?.email || 'manager@asliri.id');
    setIsSendingReportEmail(true);
    setTimeout(() => {
      setIsSendingReportEmail(false);
      setReportEmailSentSuccess(true);
      addAuditLog(
        'REPORT_DISPATCH_EMAIL',
        'Executive Report',
        `Ringkasan eksekutif sprint berhasil dikirim ke Manajer: ${finalManager} (CC: ${reportCcList.join(', ') || 'None'})`
      );
      setTimeout(() => setReportEmailSentSuccess(false), 4500);
    }, 700);
  };

  // New Checkpoint form inside task modal
  const [newCheckpointTitle, setNewCheckpointTitle] = useState('');
  const [newCheckpointDate, setNewCheckpointDate] = useState('');

  // New Progress Report / Note form inside task modal
  const [reportType, setReportType] = useState<'progress_update' | 'blocker' | 'note'>('progress_update');
  const [reportContent, setReportContent] = useState('');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Filter tasks based on group
  const groupFilteredTasks = tasks.filter(t => {
    if (activeGroupId === 'all') return true;
    return t.groupId === activeGroupId || t.assigneeDept === TASK_GROUPS.find(g => g.id === activeGroupId)?.departmentMatch;
  });

  // Support ESC key to close task detail or approval modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedTask(null);
        setApprovalModalTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Brand lookup helper with logo & color
  const getBrandInfo = (brandName?: string, brandId?: string, cachedLogo?: string, cachedColor?: string) => {
    const found = managedBrands.find(
      b => (brandId && b.id === brandId) || (brandName && b.name.toLowerCase() === brandName.toLowerCase())
    );
    if (found) return found;
    return {
      id: brandId || 'custom',
      name: brandName || 'Asli RI',
      logo: cachedLogo || '',
      color: cachedColor || '#dc2626',
      category: 'General Client'
    };
  };

  // Filter tasks based on search & selectors
  const filteredTasks = groupFilteredTasks.filter(t => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (assigneeFilter === 'mine' && t.assigneeId !== currentUser.id) return false;
    if (assigneeFilter !== 'all' && assigneeFilter !== 'mine' && t.assigneeId !== assigneeFilter) return false;
    if (brandFilter !== 'all') {
      const bName = (t.brand || 'Asli RI').toLowerCase();
      const bFilter = brandFilter.toLowerCase();
      if (bName !== bFilter && t.brandId !== brandFilter) return false;
    }
    if (contentTypeFilter !== 'all') {
      const ct = (t.contentType || 'Regular').toLowerCase();
      if (ct !== contentTypeFilter.toLowerCase()) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchBrand = (t.brand || '').toLowerCase().includes(q);
      const matchCode = (t.taskCode || '').toLowerCase().includes(q);
      const matchProject = (t.project || '').toLowerCase().includes(q);
      const matchAssignee = t.assigneeName.toLowerCase().includes(q);
      return matchTitle || matchBrand || matchCode || matchProject || matchAssignee;
    }
    return true;
  });

  // Mini Report Statistics Calculation (Active Tasks only)
  const activeGroupTasks = groupFilteredTasks.filter(t => !t.isArchived);
  const totalTasks = activeGroupTasks.length;
  const completedTasks = activeGroupTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = activeGroupTasks.filter(t => t.status === 'on_progress' || t.status === 'in_progress').length;
  const urgentTasks = activeGroupTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Checkpoints total & completed
  const allCheckpoints = activeGroupTasks.flatMap(t => t.checkpoints || []);
  const totalCheckpoints = allCheckpoints.length;
  const completedCheckpoints = allCheckpoints.filter(cp => cp.isCompleted).length;
  const checkpointPercentage = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

  // Column visual styles matching spacious, high-end pastel board design
  const columnStyles: Record<string, {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    addBtnBorder: string;
    addBtnText: string;
    addBtnHover: string;
    titleColor: string;
    accentDot: string;
  }> = {
    not_started: {
      bg: 'bg-[#F2EFFE] dark:bg-indigo-950/25',
      border: 'border-indigo-200/80 dark:border-indigo-900/50',
      badgeBg: 'bg-white dark:bg-indigo-900/80',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      addBtnBorder: 'border-indigo-300 dark:border-indigo-800',
      addBtnText: 'text-indigo-600 dark:text-indigo-300',
      addBtnHover: 'hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40',
      titleColor: 'text-indigo-950 dark:text-indigo-200',
      accentDot: 'bg-indigo-500'
    },
    on_progress: {
      bg: 'bg-[#EAF3FD] dark:bg-blue-950/25',
      border: 'border-blue-200/80 dark:border-blue-900/50',
      badgeBg: 'bg-white dark:bg-blue-900/80',
      badgeText: 'text-blue-700 dark:text-blue-300',
      addBtnBorder: 'border-blue-300 dark:border-blue-800',
      addBtnText: 'text-blue-600 dark:text-blue-300',
      addBtnHover: 'hover:bg-blue-100/60 dark:hover:bg-blue-950/40',
      titleColor: 'text-blue-950 dark:text-blue-200',
      accentDot: 'bg-sky-500'
    },
    on_review: {
      bg: 'bg-[#FEF5E8] dark:bg-amber-950/25',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      badgeBg: 'bg-white dark:bg-amber-900/80',
      badgeText: 'text-amber-700 dark:text-amber-300',
      addBtnBorder: 'border-amber-300 dark:border-amber-800',
      addBtnText: 'text-amber-600 dark:text-amber-300',
      addBtnHover: 'hover:bg-amber-100/60 dark:hover:bg-amber-950/40',
      titleColor: 'text-amber-950 dark:text-amber-200',
      accentDot: 'bg-amber-500'
    },
    done: {
      bg: 'bg-[#EBFBF3] dark:bg-emerald-950/25',
      border: 'border-emerald-200/80 dark:border-emerald-900/50',
      badgeBg: 'bg-white dark:bg-emerald-900/80',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      addBtnBorder: 'border-emerald-300 dark:border-emerald-800',
      addBtnText: 'text-emerald-600 dark:text-emerald-300',
      addBtnHover: 'hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40',
      titleColor: 'text-emerald-950 dark:text-emerald-200',
      accentDot: 'bg-emerald-500'
    }
  };

  // 4 requested flow stages: Not started - On Progress - On Review - Done
  const columns: {
    id: TaskStatus;
    label: string;
    filterFn: (t: Task) => boolean;
    count: number;
  }[] = [
    {
      id: 'not_started',
      label: 'Not started',
      filterFn: t => t.status === 'not_started' || t.status === 'todo' || t.status === 'backlog',
      count: filteredTasks.filter(t => t.status === 'not_started' || t.status === 'todo' || t.status === 'backlog').length
    },
    {
      id: 'on_progress',
      label: 'On Progress',
      filterFn: t => t.status === 'on_progress' || t.status === 'in_progress',
      count: filteredTasks.filter(t => t.status === 'on_progress' || t.status === 'in_progress').length
    },
    {
      id: 'on_review',
      label: 'On Review',
      filterFn: t => t.status === 'on_review' || t.status === 'review',
      count: filteredTasks.filter(t => t.status === 'on_review' || t.status === 'review').length
    },
    {
      id: 'done',
      label: 'Done',
      filterFn: t => t.status === 'done' && !t.isArchived,
      count: filteredTasks.filter(t => t.status === 'done' && !t.isArchived).length
    }
  ];

  const archivedTasks = groupFilteredTasks.filter(t => t.status === 'done' && t.isArchived);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: TaskStatus) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      moveTaskStatus(id, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'High', bg: 'bg-[#FEE8E8] text-[#E02424] dark:bg-rose-950/70 dark:text-rose-300' };
      case 'high':
        return { label: 'High', bg: 'bg-[#FEE8E8] text-[#E02424] dark:bg-rose-950/70 dark:text-rose-300' };
      case 'medium':
        return { label: 'Medium', bg: 'bg-[#FDF1DB] text-[#D97706] dark:bg-amber-950/70 dark:text-amber-300' };
      default:
        return { label: 'Low', bg: 'bg-[#E7F8F0] text-[#057A55] dark:bg-emerald-950/70 dark:text-emerald-300' };
    }
  };

  const formatDueDisplay = (deadline: string) => {
    if (!deadline) return 'Today 11:00';
    try {
      const d = new Date(deadline);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (d.toDateString() === today.toDateString()) {
        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');
        return `Today ${hh}:${mm || '00'}`;
      } else if (d.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow 16:00`;
      } else {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[d.getDay()]} 11:00`;
      }
    } catch {
      return 'Today 11:00';
    }
  };

  const handleAddCheckpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCheckpointTitle.trim()) return;
    addTaskCheckpoint(selectedTask.id, newCheckpointTitle, newCheckpointDate || undefined);
    setNewCheckpointTitle('');
    setNewCheckpointDate('');

    // Keep selectedTask state updated in modal
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleAddReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !reportContent.trim()) return;
    addTaskReport(selectedTask.id, {
      type: reportType,
      content: reportContent
    });
    setReportContent('');

    // Keep selectedTask state updated in modal
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const sanitizedWidgetOrder: TaskWidgetKey[] = (() => {
    const defaultOrder = DEFAULT_TASK_WIDGET_ORDER;
    const currentOrder = taskLayoutConfig.widgetOrder || defaultOrder;
    const filtered = currentOrder.filter(k => defaultOrder.includes(k));
    defaultOrder.forEach(k => {
      if (!filtered.includes(k)) filtered.push(k);
    });
    return filtered;
  })();

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. GROUP SWITCHER & ACCESS CONTROL BAR */}
      <div className="flex items-center justify-start gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto no-scrollbar">
        {/* 4 Controls strictly in 1 horizontal line */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-nowrap shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Board:</span>
            <select
              value={activeGroupId}
              onChange={e => setSelectedTaskGroup(e.target.value)}
              className="h-10 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-xs font-bold text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs cursor-pointer shrink-0"
            >
              {isSuperAdmin && (
                <option value="all">🌐 Semua Divisi (Global Overview)</option>
              )}
              {TASK_GROUPS.map(g => (
                <option
                  key={g.id}
                  value={g.id}
                  disabled={!isSuperAdmin && g.id !== userHomeGroup.id}
                >
                  {g.name} {!isSuperAdmin && g.id !== userHomeGroup.id ? '🔒 (Terkunci)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Single Unified Automation & Schedule Button */}
          <button
            type="button"
            onClick={() => setShowAutomationModal(true)}
            className={`h-10 flex items-center gap-2 rounded-full border px-4 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 shrink-0 whitespace-nowrap ${
              currentDivisionConfig?.isAdvancedModeEnabled
                ? 'border-emerald-300 bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-400/30'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Buka Pengaturan Otomasi Jadwal (Senin 09:00 WIB & Jumat 23:00 WIB), Kuota Brand, dan Template Card"
          >
            <Bot className={`h-4 w-4 ${currentDivisionConfig?.isAdvancedModeEnabled ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>
              {currentDivisionConfig?.isAdvancedModeEnabled
                ? `⚡ Otomasi: ON (${currentDivisionConfig.brands?.reduce((acc: number, b: any) => acc + (b.weeklyCount || 0), 0) || 23} Task/Mgg)`
                : 'Pengaturan Otomasi: OFF'}
            </span>
          </button>

          {/* Single Layout Customization Button */}
          <button
            type="button"
            onClick={() => setShowCustomizeLayoutModal(true)}
            className="h-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
            title="Kustomisasi Tata Letak Widget Task Management"
          >
            <Sliders className="h-4 w-4 text-red-600" />
            <span>Kustomisasi Layout</span>
          </button>
        </div>
      </div>

      {/* ACCESS DENIED STATE FOR UNAUTHORIZED GROUPS */}
      {!hasAccessToCurrentGroup ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 mb-3">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Akses Board Terbatas
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Sesuai kebijakan keamanan perusahaan, Anda hanya diizinkan mengakses board divisi Anda (<strong>{currentUser.department}</strong>). Hanya <strong>Super Admin</strong> yang memiliki otorisasi penuh lintas divisi.
          </p>
          <button
            onClick={() => setSelectedTaskGroup(userHomeGroup.id)}
            className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition"
          >
            Beralih ke Board Saya ({userHomeGroup.name})
          </button>
        </div>
      ) : (
        <>
          {/* Toast Notification when Layout is Saved */}
          {layoutSavedToast && (
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tata letak widget Task Management berhasil disimpan dan disesuaikan!</span>
              </div>
              <button
                type="button"
                onClick={() => setLayoutSavedToast(false)}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Automation Toast */}
          {automationToast && (
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{automationToast.message}</span>
              </div>
            </div>
          )}

          {viewMode === 'archive' ? (
            <ArchiveView
              tasks={tasks}
              users={users}
              managedBrands={managedBrands}
              currentUser={currentUser}
              activeGroupId={activeGroupId}
              onRestoreTask={restoreTaskFromArchive}
              onSelectTask={task => setSelectedTask(task)}
              onRunAutoArchiveNow={() => runAutoArchive(activeGroupId)}
            />
          ) : (
            sanitizedWidgetOrder.map(widgetKey => {
            if (widgetKey === 'executiveSummary') {
              if (!taskLayoutConfig.executiveSummary) return null;
              return (
                <div key="executiveSummary" className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4 text-red-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Mini Report & Statistik Capaian Tim: {activeGroupId === 'all' ? 'Semua Divisi' : TASK_GROUPS.find(g => g.id === activeGroupId)?.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowProductivityTrend(!showProductivityTrend)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900 transition self-start sm:self-auto cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{showProductivityTrend ? 'Sembunyikan Grafik Tren' : 'Tampilkan Grafik Tren'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition self-start sm:self-auto cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-red-600" />
                        <span>Lihat Laporan Lengkap Tim</span>
                      </button>
                    </div>
                  </div>
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {/* KPI Content */}
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tugas</div>
                      <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</div>
                      <div className="mt-1 text-xs text-slate-400">Aktif di board ini</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Selesai (Done)</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedTasks}</span>
                        <span className="text-xs font-bold text-slate-400">({completionPercentage}%)</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sedang Dikerjakan</div>
                      <div className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
                      <div className="mt-1 text-xs text-slate-400">Fokus pengerjaan aktif</div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Checkpoint Milestones</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">{completedCheckpoints}/{totalCheckpoints}</span>
                        <span className="text-xs font-bold text-slate-400">({checkpointPercentage}%)</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-slate-950 dark:bg-white rounded-full" style={{ width: `${checkpointPercentage}%` }} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50/50 p-3 dark:border-red-950/60 dark:bg-red-950/20 col-span-2 sm:col-span-1">
                      <div className="text-xs font-semibold text-red-600 dark:text-red-400">Prioritas Urgent</div>
                      <div className="mt-1 text-xl font-extrabold text-red-600 dark:text-red-400">{urgentTasks}</div>
                      <div className="mt-1 text-xs text-red-500/80">Perlu perhatian khusus</div>
                    </div>
                  </div>
                </div>
              );
            }

            if (widgetKey === 'productivityChart') {
              if (!taskLayoutConfig.productivityChart || !showProductivityTrend) return null;
              return (
                <TaskProductivityChart
                  key="productivityChart"
                  tasks={filteredTasks}
                  users={users}
                  currentUser={currentUser}
                />
              );
            }

            if (widgetKey === 'searchFilterBar') {
              if (!taskLayoutConfig.searchFilterBar) return null;
              return (
                <div key="searchFilterBar" className="rounded-3xl border border-slate-200/90 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  {/* Top row (matching contohh_4efa146e.jpg): Search input on left, Action buttons + Avatars on right */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                    {/* Left side: Search input */}
                    <div className="relative w-full sm:w-72 md:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search here"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-full border border-slate-200/90 bg-slate-50/70 pl-10 pr-8 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white shadow-2xs transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Right side: Kelola Brand + Add task + Add member + Avatars */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsBrandModalOpen(true)}
                        className="flex items-center gap-1.5 rounded-full border border-red-200/90 bg-red-50/80 hover:bg-red-100/80 px-3.5 py-2 text-xs font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 shadow-2xs transition cursor-pointer"
                        title="Kelola daftar brand, pasang logo kustom, dan atur warna brand"
                      >
                        <Building2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                        <span>Kelola Brand ({managedBrands.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickActionModal('task')}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-sky-600" />
                        <span>Add task</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickActionModal('meeting')}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-sky-600" />
                        <span>Add member</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowExportImportModal(true)}
                        className="flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-2 text-xs font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 shadow-2xs transition cursor-pointer"
                        title="Export & Import file CSV / Excel (Dukungan Font Bold / Regular)"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Export / Import CSV</span>
                      </button>

                      {/* Overlapping member avatars */}
                      <div className="flex items-center -space-x-2 ml-1">
                        {users.slice(0, 2).map(u => (
                          <img
                            key={u.id}
                            src={u.avatar}
                            alt={u.name}
                            title={u.name}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                          />
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                          +{users.length > 2 ? users.length - 2 : 5}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row (matching contohh_4efa146e.jpg): View Switcher Tabs on left + Filter Dropdowns right beside it */}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    {/* View switcher tab pill */}
                    <div className="flex items-center rounded-full border border-slate-200/90 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-800 shadow-2xs shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewMode('kanban')}
                        title="Board 4 Stages"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          viewMode === 'kanban'
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Kanban className="h-3.5 w-3.5" />
                        <span>Board</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        title="Table List View"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          viewMode === 'list'
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>List</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('timeline')}
                        title="Gantt Timeline Focus"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          viewMode === 'timeline'
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Gantt Chart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('overview')}
                        title="Overview (Board + Gantt Timeline Bawah)"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          viewMode === 'overview'
                            ? 'bg-[#0052CC] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Overview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('archive')}
                        title="Halaman Arsip Dokumen Tugas Selesai (Done)"
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          (viewMode as string) === 'archive'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        <span>ARCHIVE</span>
                        {tasks.filter(t => t.isArchived).length > 0 && (
                          <span className="rounded-full bg-amber-100 text-amber-900 px-1.5 py-0.2 text-xs font-black">
                            {tasks.filter(t => t.isArchived).length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Filter Dropdowns on right side of bottom row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={brandFilter}
                        onChange={e => setBrandFilter(e.target.value)}
                        className="rounded-full border border-slate-200/90 bg-slate-50/80 text-xs font-bold text-slate-700 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
                      >
                        <option value="all">Semua Brand ({managedBrands.length})</option>
                        {['ASLI RI', 'TIXFLY', 'TRINITY', 'BEEZY', 'BANK ABDI', 'TOMMY FONDY', 'SATE ASLI CEMPE'].map(b => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                        {managedBrands.map(b => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={contentTypeFilter}
                        onChange={e => setContentTypeFilter(e.target.value)}
                        className="rounded-full border border-slate-200/90 bg-slate-50/80 text-xs font-bold text-slate-700 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
                      >
                        <option value="all">Content Type: Semua</option>
                        <option value="Regular">Regular</option>
                        <option value="Video">Video</option>
                        <option value="Design">Design</option>
                        <option value="Carousel">Carousel</option>
                      </select>

                      <select
                        value={priorityFilter}
                        onChange={e => setPriorityFilter(e.target.value)}
                        className="rounded-full border border-slate-200/90 bg-slate-50/80 text-xs font-bold text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
                      >
                        <option value="all">All tasks</option>
                        <option value="urgent">Urgent</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>

                      <select
                        value={assigneeFilter}
                        onChange={e => setAssigneeFilter(e.target.value)}
                        className="rounded-full border border-slate-200/90 bg-slate-50/80 text-xs font-bold text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
                      >
                        <option value="all">All members</option>
                        <option value="mine">My tasks</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>

                      {/* Card Style Toggle: Versi Standar vs Detail */}
                      <div className="flex items-center rounded-full border border-slate-200/90 bg-slate-50/80 p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-2xs shrink-0 sm:ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setCardDisplayMode('standard');
                            try { localStorage.setItem('TASK_CARD_DISPLAY_MODE', 'standard'); } catch {}
                          }}
                          title="Tampilan Card Versi Standar (Sesuai Referensi Gambar, Ringkas & Bebas Bloat)"
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            cardDisplayMode === 'standard'
                              ? 'bg-[#0052CC] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          <Kanban className="h-3.5 w-3.5" />
                          <span>Card Standar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCardDisplayMode('detailed');
                            try { localStorage.setItem('TASK_CARD_DISPLAY_MODE', 'detailed'); } catch {}
                          }}
                          title="Tampilan Card Versi Lengkap (Dengan Progress, Aksi Approval, & Komentar)"
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            cardDisplayMode === 'detailed'
                              ? 'bg-[#0052CC] text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Card Lengkap</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

      if (widgetKey === 'taskBoard') {
        if (!taskLayoutConfig.taskBoard) return null;
        return (
          <React.Fragment key="taskBoard">
            {/* 4. GANTT CHART TIMELINE ONLY (When in dedicated 'timeline' view) */}
          {viewMode === 'timeline' && (
            <div className="space-y-4">
              <GanttChartTimeline
                tasks={filteredTasks}
                users={users}
                currentUser={currentUser}
                activeGroupName={
                  activeGroupId === 'all'
                    ? 'All Divisions'
                    : TASK_GROUPS.find(g => g.id === activeGroupId)?.name || 'Unified Workspace'
                }
                onSelectTask={task => setSelectedTask(task)}
                onAddTask={() => setQuickActionModal('task')}
                onToggleTaskComplete={taskId => {
                  const target = tasks.find(t => t.id === taskId);
                  if (target) {
                    moveTaskStatus(target.id, target.status === 'done' ? 'on_progress' : 'done');
                  }
                }}
              />
            </div>
          )}

          {/* 5. 4-STAGE SPACIOUS STATUS COLUMNS (Shown in 'overview' and 'kanban' views) */}
          {(viewMode === 'overview' || viewMode === 'kanban') && (
            <div className="space-y-3">
              {viewMode === 'overview' && (
                <div className="flex items-center justify-between pt-2 px-1">
                  <div className="flex items-center gap-2">
                    <Kanban className="h-4 w-4 text-slate-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Task Stages & Workflows (Not started → On Progress → On Review → Done)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Geser (drag & drop) untuk memindahkan status tugas
                  </span>
                </div>
              )}

              {/* Mobile Stage Selector Tabs (Easy stage jump on phone screens) */}
              <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setMobileStageFilter('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition ${
                    mobileStageFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Semua Kolom ({filteredTasks.length})
                </button>
                {columns.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setMobileStageFilter(c.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition ${
                      mobileStageFilter === c.id
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {c.label} ({c.count})
                  </button>
                ))}
              </div>

              {/* Grid: 4 columns with compact gap-3 sm:gap-3.5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5 pb-4">
                {columns.map(col => {
                  const colTasks = filteredTasks.filter(col.filterFn);
                  const style = columnStyles[col.id] || columnStyles.not_started;
                  const isVisibleOnMobile = mobileStageFilter === 'all' || mobileStageFilter === col.id;

                  return (
                    <div
                      key={col.id}
                      onDragOver={e => handleDragOver(e, col.id)}
                      onDragLeave={e => handleDragLeave(e, col.id)}
                      onDrop={e => handleDrop(e, col.id)}
                      className={`${isVisibleOnMobile ? 'flex' : 'hidden md:flex'} flex-col rounded-3xl border ${style.border} ${style.bg} p-3.5 sm:p-4 min-h-[580px] shadow-xs transition-all duration-200 ease-out ${
                        dragOverColId === col.id ? 'ring-2 ring-sky-400 bg-sky-50/70 dark:bg-sky-950/40 scale-[1.01]' : ''
                      }`}
                    >
                      {/* Column Header: [Count Circle] [Title] [...] [+] */}
                      <div className="flex items-center justify-between pb-4 pt-1 px-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${style.badgeBg} ${style.badgeText} text-xs font-black shadow-xs`}
                          >
                            {col.count}
                          </div>
                          <span className={`text-sm font-black ${style.titleColor}`}>
                            {col.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {col.id === 'done' ? (
                            <button
                              type="button"
                              onClick={() => setShowArchivedModal(true)}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 px-3 py-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 shadow-2xs transition cursor-pointer"
                              title="Tugas selesai > 7 hari otomatis diarsipkan"
                            >
                              <Archive className="h-3.5 w-3.5" />
                              <span>Arsip ({archivedTasks.length})</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setQuickActionModal('task')}
                              className={`rounded-xl p-1.5 ${style.addBtnText} hover:bg-white/60 dark:hover:bg-slate-800/60 transition cursor-pointer`}
                              title="Add task"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Task Cards List with compact space-y-2.5 */}
                      <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-visible pt-2.5 pb-3 px-1.5 -mx-1.5">
                        {colTasks.length === 0 ? (
                          <div className={`flex h-40 flex-col items-center justify-center rounded-[24px] border border-dashed p-4 text-center text-slate-400 transition-colors ${
                            dragOverColId === col.id ? 'border-sky-400 bg-sky-50/50 dark:bg-sky-950/20 text-sky-600' : 'border-slate-300/80 dark:border-slate-800'
                          }`}>
                            <p className="text-xs font-bold">Lepaskan kartu tugas di sini</p>
                            <p className="text-[11px] text-slate-400/80 mt-1">Kolom {col.label}</p>
                          </div>
                        ) : (
                          colTasks.map((task, taskIdx) => {
                            const priorityBadge = getPriorityBadge(task.priority);
                            const totalComments = task.comments?.length || 8;
                            const totalAttachments = task.attachments?.length || 1;
                            const isDone = task.status === 'done';

                            // Progress percentage from checkpoints or checklists
                            let progressPct = 0;
                            if (isDone) {
                              progressPct = 100;
                            } else if (task.checkpoints && task.checkpoints.length > 0) {
                              const doneCount = task.checkpoints.filter(cp => cp.isCompleted).length;
                              progressPct = Math.round((doneCount / task.checkpoints.length) * 100);
                            } else if (task.checklists && task.checklists.length > 0) {
                              const doneCount = task.checklists.filter(c => c.completed).length;
                              progressPct = Math.round((doneCount / task.checklists.length) * 100);
                            } else {
                              progressPct = col.id === 'on_progress' ? 65 : (col.id === 'on_review' ? 85 : 0);
                            }

                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={e => handleDragStart(e, task.id)}
                                onDragEnd={() => {
                                  setDraggedTaskId(null);
                                  setDragOverColId(null);
                                }}
                                onClick={() => setSelectedTask(task)}
                                className={`kanban-task-card group relative select-none rounded-[24px] border p-3 sm:p-3.5 transition-all duration-200 ease-out cursor-grab active:cursor-grabbing dark:border-slate-800/90 dark:bg-slate-900 ${
                                  draggedTaskId === task.id
                                    ? 'is-dragging scale-[1.03] -translate-y-2 rotate-1 shadow-2xl ring-2 ring-blue-500 border-blue-400 bg-white/95 dark:bg-slate-900/95 z-50'
                                    : 'bg-white shadow-xs border-white/90 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                              >
                                {/* Top Category Tag: Brand Badge & Content Type Badge (Matching image_64dba214.png) */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {(() => {
                                      const brandInfo = getBrandInfo(task.brand, task.brandId, task.brandLogo, task.brandColor);
                                      return (
                                        <span
                                          className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-extrabold truncate shadow-2xs"
                                          style={{
                                            borderColor: `${brandInfo.color}35`,
                                            backgroundColor: `${brandInfo.color}15`,
                                            color: brandInfo.color
                                          }}
                                        >
                                          {brandInfo.logo ? (
                                            <img
                                              src={brandInfo.logo}
                                              alt={brandInfo.name}
                                              className="h-3.5 w-3.5 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                                            />
                                          ) : (
                                            <span
                                              className="h-2 w-2 rounded-full shrink-0"
                                              style={{ backgroundColor: brandInfo.color }}
                                            />
                                          )}
                                          <span className="truncate">{brandInfo.name}</span>
                                        </span>
                                      );
                                    })()}
                                    {(task.requestorName || task.reporterName) && (
                                      <span
                                        className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[100px]"
                                        title={`Requestor: ${task.requestorName || task.reporterName}`}
                                      >
                                        Oleh: {(task.requestorName || task.reporterName).split(' ')[0]}
                                      </span>
                                    )}
                                  </div>
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
                                    {task.contentType || 'Regular'}
                                  </span>
                                </div>

                                {/* Task Title matching reference */}
                                <h4 className={`text-[13px] ${task.titleFontWeight === 'regular' ? 'font-normal' : 'font-extrabold'} text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors`}>
                                  {task.title}
                                </h4>

                                {/* Category & Publish Date metadata (Matching image_64dba214.png) */}
                                <div className="space-y-1 mb-3 text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                    {task.category === 'Video' || task.title.toLowerCase().includes('video') ? (
                                      <Video className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    ) : (
                                      <ImageIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span>{task.category || (task.title.toLowerCase().includes('video') ? 'Video' : 'Design')}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>Publish: {task.publishDate || (task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '15 Nov')}</span>
                                  </div>
                                </div>

                                {/* TAMPILAN KARTU: VERSI STANDAR (Sesuai Referensi image_64dba214.png) vs VERSI LENGKAP */}
                                {cardDisplayMode === 'standard' ? (
                                  <div className="flex items-center justify-between pt-1 mt-1">
                                    {/* Left: Multi-Assignee Avatars or Single Avatar */}
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {task.assignees && task.assignees.length > 1 ? (
                                        <div className="flex items-center -space-x-1.5 shrink-0" title={`Assignees: ${task.assignees.map(a => a.name).join(', ')}`}>
                                          {task.assignees.slice(0, 3).map((a, idx) => (
                                            <img
                                              key={a.id || idx}
                                              src={a.avatar}
                                              alt={a.name}
                                              className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                                            />
                                          ))}
                                          {task.assignees.length > 3 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                                              +{task.assignees.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <img
                                          src={task.assigneeAvatar}
                                          alt={task.assigneeName}
                                          title={task.assigneeName}
                                          className="h-6 w-6 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0"
                                        />
                                      )}
                                      {task.checklists && task.checklists.length > 0 && (
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1">
                                          ✓ {task.checklists.filter(c => c.completed).length}/{task.checklists.length}
                                        </span>
                                      )}
                                    </div>

                                    {/* Right: Deadline Badge / Content ✓ */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {col.id === 'on_review' || isDone ? (
                                        <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                          Content ✓
                                        </span>
                                      ) : (
                                        <span className="rounded-lg bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                          {formatDueDisplay(task.deadline).includes('hari') ? formatDueDisplay(task.deadline).replace('hari lagi', 'H-').replace(/\s+/g, '') : 'H-4'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Progress Bar & Milestone Status (Matching image_5dedaf7e.png) */}
                                <div className="mb-3.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50">
                                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Progress</span>
                                    <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}>
                                      {progressPct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isDone
                                          ? 'bg-emerald-500'
                                          : col.id === 'on_review'
                                          ? 'bg-amber-500'
                                          : 'bg-sky-500'
                                      }`}
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Middle Row: Multi-Assignee Avatars + Due Time + Blue Checkmark Circle */}
                                <div className="flex items-center justify-between mb-3.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {task.assignees && task.assignees.length > 1 ? (
                                      <div className="flex items-center -space-x-1.5 shrink-0" title={`Assignees: ${task.assignees.map(a => a.name).join(', ')}`}>
                                        {task.assignees.slice(0, 3).map((a, idx) => (
                                          <img
                                            key={a.id || idx}
                                            src={a.avatar}
                                            alt={a.name}
                                            className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                                          />
                                        ))}
                                        {task.assignees.length > 3 && (
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                                            +{task.assignees.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <img
                                        src={task.assigneeAvatar}
                                        alt={task.assigneeName}
                                        title={task.assigneeName}
                                        className="h-6 w-6 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0"
                                      />
                                    )}
                                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                                      {formatDueDisplay(task.deadline)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {col.id === 'on_review' || isDone ? (
                                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        Content ✓
                                      </span>
                                    ) : (
                                      <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        {formatDueDisplay(task.deadline).includes('hari') ? formatDueDisplay(task.deadline).replace('hari lagi', 'H-').replace(/\s+/g, '') : 'H-4'}
                                      </span>
                                    )}

                                    {/* Blue Checkmark Circle (Matching image_83ee1f6e.png & image_5dedaf7e.png) */}
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        const nextStatus: TaskStatus = isDone ? 'on_progress' : 'done';
                                        moveTaskStatus(task.id, nextStatus);
                                      }}
                                      title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                                      className={`flex h-6 w-6 items-center justify-center rounded-full transition active:scale-90 shrink-0 ${
                                        isDone
                                          ? 'bg-sky-500 text-white shadow-2xs'
                                          : 'border-2 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                                      }`}
                                    >
                                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </button>
                                  </div>
                                </div>

                                {/* Video Draft Scene Badge & Google Links indicator */}
                                {task.videoDraftScenes && task.videoDraftScenes.length > 0 && (
                                  <div className="mb-2.5 flex items-center justify-between rounded-xl bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40">
                                    <div className="flex items-center gap-1.5">
                                      <Clapperboard className="h-3 w-3 text-indigo-600" />
                                      <span>{task.videoDraftScenes.length} Scene Video Draft</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono opacity-80">
                                      {task.videoDraftScenes.reduce((acc, s) => acc + (s.googleLinks?.length || 0), 0)} Link
                                    </span>
                                  </div>
                                )}

                                {/* Bottom Row: Comments, Attachments + Pastel Priority Badge */}
                                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                                    <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300">
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      <span>{totalComments}</span>
                                    </span>
                                    <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300">
                                      <Paperclip className="h-3.5 w-3.5" />
                                      <span>{totalAttachments}</span>
                                    </span>
                                  </div>

                                  {/* Soft Pastel Priority Badge */}
                                  <span className={`px-2.5 py-0.5 rounded-xl text-xs font-bold ${priorityBadge.bg}`}>
                                    {priorityBadge.label}
                                  </span>
                                </div>

                                {/* Manager Approval Banner & Action */}
                                {task.approvalRequest ? (
                                  <div className={`mt-2.5 rounded-xl p-2 text-xs font-bold border transition ${
                                    task.approvalRequest.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                                      : task.approvalRequest.status === 'declined'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                                      : 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1 truncate">
                                        <Send className="h-3 w-3 shrink-0" />
                                        <span className="truncate">
                                          {task.approvalRequest.status === 'approved'
                                            ? '✓ Disetujui Manajer (Auto Done)'
                                            : task.approvalRequest.status === 'declined'
                                            ? '✕ Approval Ditolak'
                                            : `⏳ Review Manajer (${task.approvalRequest.requiredApprovals.filter(a => a.status === 'approved').length}/${task.approvalRequest.requiredApprovals.length})`}
                                        </span>
                                      </div>

                                      {/* If current user is one of the approvers or super_admin and status is pending */}
                                      {task.approvalRequest.status === 'pending' && (() => {
                                        const isRequester = task.approvalRequest?.requestedBy === currentUser.id || task.reporterId === currentUser.id;

                                        if (isRequester) {
                                          return (
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100/90 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md">
                                              Menunggu Manajer Lain
                                            </span>
                                          );
                                        }

                                        return (
                                          <div className="flex items-center gap-1 shrink-0 ml-1">
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation();
                                                processTaskApproval(task.id, currentUser.id, 'approved', 'Disetujui dari card board');
                                              }}
                                              title="Setujui (Approve) & Otomatis Selesai"
                                              className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-xs font-bold font-extrabold text-white hover:bg-emerald-700 shadow-2xs"
                                            >
                                              ✓ Setujui
                                            </button>
                                            <button
                                              type="button"
                                              onClick={e => {
                                                e.stopPropagation();
                                                processTaskApproval(task.id, currentUser.id, 'declined', 'Perlu revisi');
                                              }}
                                              title="Tolak (Decline)"
                                              className="rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold font-extrabold text-white hover:bg-rose-700 shadow-2xs"
                                            >
                                              ✕ Tolak
                                            </button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        openApprovalModal(task);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs transition"
                                    >
                                      <Send className="h-2.5 w-2.5 text-blue-600" />
                                      <span>Kirim Approval</span>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                            );
                          })
                        )}
                        {dragOverColId === col.id && draggedTaskId !== null && (
                          <div className="rounded-[22px] border-2 border-dashed border-sky-400 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/20 py-4 text-center text-xs font-bold text-sky-600 dark:text-sky-300 animate-pulse select-none">
                            ↓ Pindahkan kartu ke {col.label}
                          </div>
                        )}
                      </div>

                      {/* Bottom Add New Task button with matching dashed border & color */}
                      {col.id !== 'done' && (
                        <button
                          type="button"
                          onClick={() => setQuickActionModal('task')}
                          className={`w-full mt-3 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed ${style.addBtnBorder} ${style.addBtnText} ${style.addBtnHover} py-2 text-xs font-bold transition shadow-2xs cursor-pointer`}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add new task</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. GANTT CHART TIMELINE AT THE BOTTOM IN OVERVIEW MODE */}
          {viewMode === 'overview' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Gantt Chart Timeline (Ringkas & Terkoneksi)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Timeline proyek & milestone per divisi
                </span>
              </div>
              <GanttChartTimeline
                tasks={filteredTasks}
                users={users}
                currentUser={currentUser}
                activeGroupName={
                  activeGroupId === 'all'
                    ? 'All Divisions'
                    : TASK_GROUPS.find(g => g.id === activeGroupId)?.name || 'Unified Workspace'
                }
                onSelectTask={task => setSelectedTask(task)}
                onAddTask={() => setQuickActionModal('task')}
                onToggleTaskComplete={taskId => {
                  const target = tasks.find(t => t.id === taskId);
                  if (target) {
                    moveTaskStatus(target.id, target.status === 'done' ? 'on_progress' : 'done');
                  }
                }}
              />
            </div>
          )}

          {/* 6. VIEW: TABLE LIST VIEW */}
          {viewMode === 'list' && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-3">Judul Task</th>
                      <th className="px-4 py-3">Proyek & Divisi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Prioritas</th>
                      <th className="px-4 py-3">Milestone Checkpoints</th>
                      <th className="px-4 py-3">Assignee</th>
                      <th className="px-4 py-3">Deadline</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTasks.map(t => {
                      const priority = getPriorityBadge(t.priority);
                      const totalCp = (t.checkpoints || []).length;
                      const doneCp = (t.checkpoints || []).filter(c => c.isCompleted).length;

                      return (
                        <tr
                          key={t.id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => setSelectedTask(t)}
                        >
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                onClick={e => {
                                  e.stopPropagation();
                                  moveTaskStatus(t.id, t.status === 'done' ? 'in_progress' : 'done');
                                }}
                                className={`h-4 w-4 cursor-pointer transition ${
                                  t.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'
                                }`}
                              />
                              <span className={t.status === 'done' ? 'line-through text-slate-400' : ''}>
                                {t.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const bInfo = getBrandInfo(t.brand, t.brandId, t.brandLogo, t.brandColor);
                                return (
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-extrabold truncate"
                                    style={{
                                      borderColor: `${bInfo.color}35`,
                                      backgroundColor: `${bInfo.color}15`,
                                      color: bInfo.color
                                    }}
                                  >
                                    {bInfo.logo ? (
                                      <img
                                        src={bInfo.logo}
                                        alt={bInfo.name}
                                        className="h-3 w-3 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                                      />
                                    ) : (
                                      <span
                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: bInfo.color }}
                                      />
                                    )}
                                    <span>{bInfo.name}</span>
                                  </span>
                                );
                              })()}
                              {(t.requestorName || t.reporterName) && (
                                <span className="text-xs text-slate-400">
                                  Oleh: {(t.requestorName || t.reporterName).split(' ')[0]}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">{t.groupName || t.assigneeDept}</div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={
                                t.status === 'done'
                                  ? 'done'
                                  : t.status === 'review' || t.status === 'on_review'
                                  ? 'on_review'
                                  : t.status === 'in_progress' || t.status === 'on_progress'
                                  ? 'on_progress'
                                  : 'not_started'
                              }
                              onClick={e => e.stopPropagation()}
                              onChange={e => moveTaskStatus(t.id, e.target.value as TaskStatus)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            >
                              <option value="not_started">Not started</option>
                              <option value="on_progress">On Progress</option>
                              <option value="on_review">On Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${priority.bg}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {totalCp > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{doneCp}/{totalCp}</span>
                                <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <div className="h-full bg-slate-950 dark:bg-white" style={{ width: `${(doneCp / totalCp) * 100}%` }} />
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={t.assigneeAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                              <span>{t.assigneeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{t.deadline}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteTask(t.id);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                              title="Hapus Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    }

    if (widgetKey === 'quickBridgeRequests') {
      if (!taskLayoutConfig.quickBridgeRequests) return null;
      return (
        <div key="quickBridgeRequests" className="rounded-3xl border border-blue-200/90 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-4 dark:border-blue-900/60 dark:from-blue-950/30 dark:to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs shrink-0">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  Permintaan Tugas Antar Divisi
                </h4>
                <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
                  {divisionRequests?.length || 0} Total Request
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Akses cepat untuk koordinasi dan delegasi tugas lintas divisi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('division_requests')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
          >
            Kelola Permintaan Divisi →
          </button>
        </div>
      );
    }

    return null;
  })
)}

      {/* 7. TASK DETAILS DRAWER (Matching reference image_64dba214.png) */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateStatus={(taskId, newStatus) => {
            moveTaskStatus(taskId, newStatus);
            if (selectedTask && selectedTask.id === taskId) {
              setSelectedTask({ ...selectedTask, status: newStatus });
            }
          }}
          onUpdateTask={updatedTask => {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setSelectedTask(updatedTask);
          }}
          onRestoreTask={taskId => {
            restoreTaskFromArchive(taskId);
            setSelectedTask(null);
          }}
          onRequestApproval={task => {
            setSelectedTask(null);
            setApprovalModalTask(task);
          }}
          currentUser={currentUser}
        />
      )}

      {/* 8. MINI REPORT MODAL (RINGKASAN EKSEKUTIF CAPAIAN TIM) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Laporan Ringkas Kinerja & Milestones Tim
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Divisi: {activeGroupId === 'all' ? 'Seluruh Divisi Perusahaan' : TASK_GROUPS.find(g => g.id === activeGroupId)?.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Periode Sprint: Q4 2026 • Dihasilkan otomatis oleh WORKSPACE Operating System
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-xs text-slate-400">Total Deliverables</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{totalTasks} Task</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-xs text-slate-400">Tingkat Penyelesaian</div>
                  <div className="text-base font-extrabold text-emerald-600 mt-1">{completionPercentage}%</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700">
                  <div className="text-xs text-slate-400">Milestone Checkpoint</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{completedCheckpoints}/{totalCheckpoints}</div>
                </div>
              </div>

              {/* Status List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Ringkasan Task Kunci:
                </div>
                {groupFilteredTasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px]">
                    <span className="font-medium truncate max-w-[280px] text-slate-800 dark:text-slate-200">{t.title}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase">{t.status}</span>
                  </div>
                ))}
              </div>

              {/* Email Dispatch Section to Manager & CC (Requested Feature) */}
              <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      Kirim Laporan Lengkap ke Email Manager & Tim
                    </span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    Otomatisasi Email
                  </span>
                </div>

                {reportEmailSentSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Laporan berhasil dikirimkan ke email Manager & seluruh penerima CC!</span>
                  </div>
                )}

                {/* Manager Target Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kirim ke Email Manager Utama:
                  </label>
                  <select
                    value={reportTargetManagerEmail || (managersList[0]?.email || '')}
                    onChange={e => setReportTargetManagerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {managersList.map(m => (
                      <option key={m.id} value={m.email}>
                        {m.name} ({m.position} • {m.email})
                      </option>
                    ))}
                    <option value="custom">-- Masukkan Alamat Lain --</option>
                  </select>
                  {reportTargetManagerEmail === 'custom' && (
                    <input
                      type="email"
                      placeholder="Masukkan alamat email manager (contoh: vp@perusahaan.com)"
                      onChange={e => setReportTargetManagerEmail(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  )}
                </div>

                {/* CC Recipients Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Penerima CC (Tembusan Rekan / Pimpinan):
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {reportCcList.map((cc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        <span>{cc}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCc(cc)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Tambah email CC (misal: dirut@asliri.id, finance@asliri.id)..."
                      value={reportCcInput}
                      onChange={e => setReportCcInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCc();
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCc}
                      className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      Tambah CC
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendReportEmail}
                  disabled={isSendingReportEmail}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-blue-700 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>
                    {isSendingReportEmail
                      ? 'Mengirim Laporan...'
                      : `Kirim Laporan Lengkap via Email (${reportCcList.length} CC)`}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Ringkasan</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-xl bg-slate-950 dark:bg-white px-4 py-1.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL KIRIM CARD KE GROUP UNTUK APPROVAL MANAJER */}
      {approvalModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Kirim Card ke Group untuk Approval
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kirim kartu tugas terstruktur ke channel dengan tombol Setujui/Tolak otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalModalTask(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Task summary preview formatted exactly like Chat Approval Card */}
              <div className="rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-slate-900/10 p-4 space-y-3 dark:border-amber-600/40">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <FileBarChart className="h-4 w-4" />
                    <span>Card Approval Tugas (Tampilan di Chat)</span>
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    ON REVIEW
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                    {approvalModalTask.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {approvalModalTask.project} • Assignee: <strong>{approvalModalTask.assigneeName}</strong>
                  </p>
                  {approvalModalTask.deadline && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Deadline: {approvalModalTask.deadline}
                    </p>
                  )}
                </div>

                {/* Simulated action buttons */}
                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 flex items-center gap-2">
                  <div className="flex-1 rounded-xl bg-white/70 dark:bg-slate-800 py-1.5 text-[11px] font-bold text-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    ✕ Tolak
                  </div>
                  <div className="flex-1 rounded-xl bg-emerald-500 py-1.5 text-[11px] font-black text-center text-white shadow-xs">
                    ✓ Setujui (Approve)
                  </div>
                </div>
              </div>

              {/* Target Channel Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Channel / Grup Tujuan *
                </label>
                <select
                  value={approvalChannelId}
                  onChange={e => setApprovalChannelId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.name} ({c.type === 'channel' ? 'Channel Tim' : 'Pesan Langsung'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Managers / Approvers Multi-Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Manajer Penyetuju (Bisa lebih dari 1)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {users
                    .filter(u => u.role === 'manager' || u.role === 'super_admin' || u.role === 'admin' || u.id !== currentUser.id)
                    .map(m => {
                      const isSelected = approvalManagerIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => {
                            if (isSelected) {
                              setApprovalManagerIds(approvalManagerIds.filter(id => id !== m.id));
                            } else {
                              setApprovalManagerIds([...approvalManagerIds, m.id]);
                            }
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                            isSelected
                              ? 'border-blue-300 bg-blue-50/80 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-blue-600 pointer-events-none"
                            />
                            <img src={m.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                            <div>
                              <div className="font-bold leading-none">{m.name}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{m.department} • {m.role}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-bold text-blue-600">Dipilih</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
                💡 <strong>Catatan Sistem:</strong> Ketika semua manajer yang dipilih memberikan persetujuan (Approve), kartu ini akan <strong>secara otomatis dipindahkan ke status Done (Selesai)</strong>.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovalModalTask(null)}
                className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetChn = channels.find(c => c.id === approvalChannelId) || channels[0];
                  // If no specific manager was checked, default to managers in system
                  const finalManagerIds = approvalManagerIds.length > 0
                    ? approvalManagerIds
                    : users.filter(u => u.role === 'manager' || u.role === 'super_admin').map(u => u.id).slice(0, 2);

                  sendTaskForApproval(approvalModalTask.id, targetChn.id, finalManagerIds, approvalCustomMessage);
                  setApprovalModalTask(null);
                  setApprovalManagerIds([]);
                }}
                className="rounded-2xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md transition cursor-pointer"
              >
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Automation Settings Modal */}
      <AutomationSettingsModal
        isOpen={showAutomationModal}
        onClose={() => setShowAutomationModal(false)}
        activeDivisionId={activeGroupId === 'all' ? 'marketing' : activeGroupId}
        divisionName={activeGroupId === 'all' ? 'Marketing & Brand' : (TASK_GROUPS.find(g => g.id === activeGroupId)?.name || activeGroupId)}
        divisions={TASK_GROUPS.map(g => ({ id: g.id, name: g.name }))}
        config={currentDivisionConfig || automationConfigs['marketing']}
        historyLogs={automationHistory}
        onSaveConfig={cfg => updateDivisionAutomationConfig(cfg.divisionId, cfg)}
        onRunGenerateNow={(divId, force) => runWeeklyGeneration(divId, force)}
        onRunArchiveNow={divId => runAutoArchive(divId)}
        userRole={currentUser.role}
      />

      {/* Customize Task Layout Modal */}
      <CustomizeTaskLayoutModal
        isOpen={showCustomizeLayoutModal}
        onClose={() => setShowCustomizeLayoutModal(false)}
        config={taskLayoutConfig}
        onSave={handleSaveLayoutConfig}
      />

      {/* Task CSV / Excel Export & Import Modal */}
      <TaskExportImportModal
        isOpen={showExportImportModal}
        onClose={() => setShowExportImportModal(false)}
        tasks={filteredTasks}
        onImportTasks={handleImportTasks}
      />
        </>
      )}
    </div>
  );
};

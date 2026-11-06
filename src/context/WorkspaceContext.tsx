import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { modernDb } from '../services/modernDatabase';
import { soundEffects } from '../services/soundEffects';
import {
  User,
  Post,
  Task,
  Channel,
  ChatMessage,
  Meeting,
  DocumentItem,
  NotificationItem,
  AuditLog,
  ThemeSettings,
  TaskStatus,
  UserRole,
  AvailabilityStatus,
  StickerData,
  WorkspaceInfo,
  TaskCheckpoint,
  TaskReportItem,
  CreativeBriefFormat,
  VideoDraftScene,
  SlideDraftItem,
  PosterDraftItem,
  TaskApproval,
  TaskApprovalRequest,
  ActiveHuddle,
  HuddleParticipant,
  BrandDriveFolder,
  Attachment,
  DivisionItem,
  LeaveRequest,
  LeaveApproval,
  LeaveType,
  DivisionTaskRequest,
  PendingUserApproval,
  ManagedBrand,
  Comment,
  DivisionAutomationConfig,
  AutomationHistoryLog
} from '../types';
import {
  createDefaultDivisionConfig,
  getInitialTasksWithSampleAutomation,
  generateWeeklyTasksForDivision,
  archiveDoneTasks,
  restoreArchivedTask,
  getWIBNow
} from '../services/automationService';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_TASKS,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
  INITIAL_MEETINGS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WORKSPACE_INFO,
  INITIAL_BRAND_DRIVE_FOLDERS,
  INITIAL_DIVISIONS,
  INITIAL_DIVISION_REQUESTS,
  INITIAL_MANAGED_BRANDS
} from '../data/mockData';

interface WorkspaceContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;

  // Workspace Info & Customization
  workspaceInfo: WorkspaceInfo;
  updateWorkspaceInfo: (info: Partial<WorkspaceInfo>) => void;

  // Auth & Session
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  registerUser: (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    position: string;
    role: UserRole;
    avatar?: string;
  }) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;
  toggleUserActiveStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;

  // Right Side Notification Drawer
  isRightNotificationOpen: boolean;
  setIsRightNotificationOpen: (open: boolean) => void;
  toggleRightNotifications: () => void;
  
  // Feed
  posts: Post[];
  createPost: (post: Omit<Post, 'id' | 'likes' | 'bookmarks' | 'reposts' | 'comments' | 'createdAt'>) => void;
  likePost: (postId: string) => void;
  reactToPost: (postId: string, emoji: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string, content: string, extra?: { parentId?: string; replyToName?: string; stickerUrl?: string; gifUrl?: string }) => void;
  votePoll: (postId: string, optionId: string) => void;
  togglePinPost: (postId: string) => void;
  deletePost: (postId: string) => void;

  // Tasks with Group Access Control, Checkpoints & Reports
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedTaskGroup: string;
  setSelectedTaskGroup: (group: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>) => void;
  updateTask: (task: Task) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  toggleTaskCheckpoint: (taskId: string, checkpointId: string) => void;
  addTaskCheckpoint: (taskId: string, title: string, targetDate?: string) => void;
  addTaskReport: (taskId: string, report: { type: 'progress_update' | 'blocker' | 'note'; content: string }) => void;
  addTaskComment: (taskId: string, content: string) => void;
  deleteTask: (taskId: string) => void;
  updateTaskBriefFormat: (taskId: string, format: CreativeBriefFormat) => void;
  updateTaskVideoDraft: (taskId: string, scenes: VideoDraftScene[]) => void;
  updateTaskSlideDraft: (taskId: string, slides: SlideDraftItem[]) => void;
  updateTaskPosterDraft: (taskId: string, poster: PosterDraftItem) => void;
  sendTaskForApproval: (taskId: string, targetChannelId: string, managerIds: string[], notes?: string) => void;
  processTaskApproval: (taskId: string, managerId: string, decision: 'approved' | 'declined', comment?: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;

  // Huddle (Voice & Video Call)
  activeHuddle: ActiveHuddle | null;
  startHuddle: (title: string, type: 'channel' | 'direct' | 'division', targetId: string, isVoiceOnly?: boolean) => void;
  endHuddle: () => void;
  toggleHuddleMinimize: () => void;
  toggleHuddleMic: () => void;
  toggleHuddleVideo: () => void;
  toggleHuddleScreenShare: () => void;
  toggleHuddleRecording: () => void;
  sendHuddleReaction: (emoji: string) => void;

  // Channels & Messages
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  markChannelAsRead: (channelId: string) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (channelId: string, content: string, attachments?: Attachment[], voiceNote?: any, sticker?: StickerData, extra?: any) => void;
  toggleReaction: (channelId: string, messageId: string, emoji: string) => void;
  createChannel: (name: string, description: string, isPrivate: boolean, memberIds: string[], dept?: string) => void;
  updateChannelSettings: (channelId: string, settings: Partial<Channel>) => void;
  toggleStarChannel: (channelId: string) => void;
  togglePinMessage: (channelId: string, messageId: string) => void;
  toggleStarMessage: (channelId: string, messageId: string) => void;
  startDirectMessage: (targetUserId: string) => void;

  // Leave Requests & Approvals
  submitLeaveRequest: (channelId: string, leaveData: any, bossUser: User, hrUser: User) => void;
  processLeaveApproval: (channelId: string, messageId: string, role: 'boss' | 'hr', decision: 'approved' | 'declined', reason?: string) => void;
  leaveApprovalToast: string | null;
  setLeaveApprovalToast: (toast: string | null) => void;

  // Divisions
  divisions: DivisionItem[];
  addDivision: (divData: Omit<DivisionItem, 'id'>) => void;
  deleteDivision: (id: string) => void;
  updateDivision: (updated: DivisionItem) => void;

  // Meetings
  meetings: Meeting[];
  createMeeting: (meetingData: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (updated: Meeting) => void;
  convertActionItemToTask: (meetingId: string, actionItemId: string) => void;
  deleteMeeting: (id: string) => void;

  // Documents
  documents: DocumentItem[];
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'downloads'>) => void;
  deleteDocument: (id: string) => void;
  toggleStarDoc: (id: string) => void;
  recordDocDownload: (id: string) => void;

  // Brand Drive Folders
  brandDriveFolders: BrandDriveFolder[];
  addBrandDriveFolder: (folderData: Omit<BrandDriveFolder, 'id' | 'createdAt'>) => void;
  updateBrandDriveFolder: (folder: BrandDriveFolder) => void;
  deleteBrandDriveFolder: (id: string) => void;
  toggleStarBrandDriveFolder: (id: string) => void;

  // Managed Brands (Label Management)
  managedBrands: ManagedBrand[];
  addManagedBrand: (brandData: Omit<ManagedBrand, 'id' | 'createdAt'>) => void;
  updateManagedBrand: (id: string, updates: Partial<ManagedBrand>) => void;
  deleteManagedBrand: (id: string) => void;
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;
  editingBrand: ManagedBrand | null;
  setEditingBrand: (brand: ManagedBrand | null) => void;

  // Notifications
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;

  // User Management & Roles
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserStatus: (status: AvailabilityStatus) => void;
  inviteUser: (userData: any) => User;

  // Audit Logs & Search
  auditLogs: AuditLog[];
  addAuditLog: (action: string, resource: string, details: string) => void;
  isQuickSearchOpen: boolean;
  setIsQuickSearchOpen: (open: boolean) => void;
  quickActionModal: string | null;
  setQuickActionModal: (modal: string | null) => void;
  isDbHubOpen: boolean;
  setIsDbHubOpen: (open: boolean) => void;
  resetAllData: () => void;
  resetToInitialCorporateData: () => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  setSoundMuted: (muted: boolean) => void;
  playTestSound: (type?: 'notification' | 'chat' | 'phone' | 'task') => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;

  // Advanced Task Management Automation Mode
  automationConfigs: Record<string, DivisionAutomationConfig>;
  updateDivisionAutomationConfig: (divisionId: string, updates: Partial<DivisionAutomationConfig>) => Promise<void>;
  toggleDivisionAdvancedMode: (divisionId: string) => Promise<boolean>;
  runWeeklyGeneration: (divisionId: string, force?: boolean) => Promise<{ success: boolean; generatedCount: number; details: string; log: AutomationHistoryLog }>;
  runAutoArchive: (divisionId: string) => Promise<{ success: boolean; archivedCount: number; details: string; log: AutomationHistoryLog }>;
  restoreTaskFromArchive: (taskId: string) => void;
  automationHistory: AutomationHistoryLog[];
  automationToast: { type: 'success' | 'warning' | 'error' | 'info'; message: string } | null;
  setAutomationToast: (toast: { type: 'success' | 'warning' | 'error' | 'info'; message: string } | null) => void;
  // Cross-Division Task Requests (Permintaan Tugas Antar Divisi)
  divisionRequests: DivisionTaskRequest[];
  createDivisionRequest: (data: Omit<DivisionTaskRequest, 'id' | 'createdAt' | 'status'>) => void;
  acceptDivisionRequest: (requestId: string) => void;
  declineDivisionRequest: (requestId: string, reason?: string) => void;

  // External Email Approvals
  pendingApprovals: PendingUserApproval[];
  submitUserApprovalRequest: (data: {
    name: string;
    email: string;
    password?: string;
    department: string;
    position: string;
    avatar?: string;
    nickname?: string;
    birthDate?: string;
    employeeId?: string;
    location?: string;
    employmentType?: 'Full-time' | 'Contract' | 'Probation' | 'Intern' | 'Freelance';
    phone?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    emergencyContact?: { name: string; relation: string; phone: string };
    bankAccount?: { bankName: string; accountNumber: string; accountHolder: string };
  }) => void;
  approveUserRegistration: (id: string) => void;
  rejectUserRegistration: (id: string) => void;
  customStickers: { id: string; name: string; url: string }[];
  addCustomSticker: (name: string, url: string) => void;
  selectedDirectoryUserId: string | null;
  setSelectedDirectoryUserId: (id: string | null) => void;
  openEmployeeProfileByName: (name: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'WORKSPACE_APP_PROD_EMPTY_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = loadFromStorage<User[]>('users', INITIAL_USERS);
    // Keep only super_admin accounts (usr_saeful, usr_epunk)
    const superAdminOnly = loaded.filter(u => u.id === 'usr_saeful' || u.id === 'usr_epunk');
    if (superAdminOnly.length === 0) return INITIAL_USERS;
    return superAdminOnly.map(u => ({ ...u, role: 'super_admin' as const }));
  });
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = loadFromStorage<User | null>('currentUser', null);
    if (saved && (saved.id === 'usr_saeful' || saved.id === 'usr_epunk')) return { ...saved, role: 'super_admin' };
    return INITIAL_USERS[0]; // Saeful Rohman
  });

  const [activeTab, setActiveTabState] = useState<string>(() => loadFromStorage('activeTab', 'dashboard'));
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    let mode: 'light' | 'dark' = 'light';
    try {
      const explicit = localStorage.getItem('theme') || localStorage.getItem('WORKSPACE_THEME');
      if (explicit === 'dark' || explicit === 'light') {
        mode = explicit;
      } else {
        const savedSettings = loadFromStorage<Partial<ThemeSettings> | null>('themeSettings', null);
        if (savedSettings?.mode === 'dark' || savedSettings?.mode === 'light') {
          mode = savedSettings.mode;
        }
      }
    } catch {}
    const base = loadFromStorage<Partial<ThemeSettings>>('themeSettings', {});
    return {
      accentColor: base.accentColor || 'royal-blue',
      sidebarCollapsed: base.sidebarCollapsed ?? false,
      density: base.density || 'comfortable',
      cardRadius: base.cardRadius || 'smooth',
      bgPattern: base.bgPattern || 'clean',
      customPrimaryColor: base.customPrimaryColor || '#1e3a8a',
      customAccentColor: base.customAccentColor || '#dc2626',
      fontSize: base.fontSize || 'very-large',
      ...base,
      mode
    } as ThemeSettings;
  });

  const [posts, setPosts] = useState<Post[]>(() => loadFromStorage('posts', INITIAL_POSTS));
  const [tasks, setTasks] = useState<Task[]>(() => {
    const loaded = loadFromStorage<Task[]>('tasks', []);
    if (!loaded || loaded.length === 0) {
      const seeded = getInitialTasksWithSampleAutomation();
      saveToStorage('tasks', seeded);
      return seeded;
    }
    return loaded;
  });

  // Advanced Task Management Automation State per Division
  const [automationConfigs, setAutomationConfigs] = useState<Record<string, DivisionAutomationConfig>>(() => {
    const defaultConfigs: Record<string, DivisionAutomationConfig> = {
      marketing: createDefaultDivisionConfig('marketing', 'Marketing & Brand', true),
      tech: createDefaultDivisionConfig('tech', 'Technology & Engineering', false),
      product: createDefaultDivisionConfig('product', 'Product & Design', false),
      hr: createDefaultDivisionConfig('hr', 'People Operations & HR', false),
      finance: createDefaultDivisionConfig('finance', 'Finance & Legal', false)
    };
    return loadFromStorage('automationConfigs', defaultConfigs);
  });

  const [automationHistory, setAutomationHistory] = useState<AutomationHistoryLog[]>(() => {
    return loadFromStorage('automationHistory', [
      {
        id: 'log-seed-1',
        divisionId: 'marketing',
        divisionName: 'Marketing & Brand',
        type: 'weekly_generation',
        status: 'success',
        timestampWIB: getWIBNow().formattedWIB,
        tasksAffected: 23,
        details: '23 task mingguan otomatis dibuat untuk 7 brand (Content Type: Regular).',
        triggeredBy: 'cron_scheduler'
      }
    ]);
  });

  const [automationToast, setAutomationToast] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [channels, setChannels] = useState<Channel[]>(() => {
    const loaded = loadFromStorage<Channel[]>('channels', INITIAL_CHANNELS);
    return loaded.map(c => ({
      ...c,
      unreadCount: 0,
      memberIds: ['usr_saeful', 'usr_epunk'],
      lastMessage: '',
      lastMessageTime: ''
    }));
  });
  const [activeChannelId, setActiveChannelIdState] = useState<string>(() => loadFromStorage('activeChannelId', 'chn_general'));

  const [customStickers, setCustomStickers] = useState<{ id: string; name: string; url: string }[]>(() =>
    loadFromStorage('customStickers', [])
  );
  const [selectedDirectoryUserId, setSelectedDirectoryUserId] = useState<string | null>(null);

  const addCustomSticker = (name: string, url: string) => {
    const newStk = { id: 'stk_' + Date.now(), name, url };
    setCustomStickers(prev => [newStk, ...prev]);
  };

  const openEmployeeProfileByName = (name: string) => {
    const found = users.find(u => u.name.toLowerCase() === name.toLowerCase() || u.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      setSelectedDirectoryUserId(found.id);
      setActiveTab('directory');
    }
  };

  useEffect(() => {
    saveToStorage('customStickers', customStickers);
  }, [customStickers]);

  const markChannelAsRead = (channelId: string) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId && c.unreadCount ? { ...c, unreadCount: 0 } : c))
    );
  };

  const setActiveChannelId = (id: string) => {
    setActiveChannelIdState(id);
    markChannelAsRead(id);
  };

  // Automatically clear unread count for the active channel
  useEffect(() => {
    if (activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  }, [activeChannelId]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const loaded = loadFromStorage<Record<string, ChatMessage[]>>('messages', INITIAL_MESSAGES);
    if (loaded && (loaded.chn_tech || loaded.chn_general || loaded.dm_nadia)) {
      return {};
    }
    return loaded || {};
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const loaded = loadFromStorage<Meeting[]>('meetings', INITIAL_MEETINGS);
    if (!loaded || loaded.length === 0) {
      saveToStorage('meetings', INITIAL_MEETINGS);
      return INITIAL_MEETINGS;
    }
    return loaded;
  });
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadFromStorage('documents', INITIAL_DOCUMENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS));

  // Workspace Info Customization State
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo>(() => loadFromStorage('workspaceInfo', INITIAL_WORKSPACE_INFO));
  
  // Authentication & Session - Default false so users must register/login with Google first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadFromStorage('isAuthenticated', false));
  
  // Right side notification drawer toggle state - default true so it stays visible persistently
  const [isRightNotificationOpen, setIsRightNotificationOpen] = useState<boolean>(() => loadFromStorage('isRightNotificationOpen', true));

  // Task group partition state
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string>(() => loadFromStorage('selectedTaskGroup', 'all'));

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [isDbHubOpen, setIsDbHubOpen] = useState(false);

  // Active Live Huddle (Voice & Video)
  const [activeHuddle, setActiveHuddle] = useState<ActiveHuddle | null>(null);

  // Brand Google Drive Master Directories
  const [brandDriveFolders, setBrandDriveFolders] = useState<BrandDriveFolder[]>(() => loadFromStorage('brandDriveFolders', INITIAL_BRAND_DRIVE_FOLDERS));

  // Managed Brands (Label Management) State
  const [managedBrands, setManagedBrands] = useState<ManagedBrand[]>(() =>
    loadFromStorage('managedBrands', INITIAL_MANAGED_BRANDS)
  );
  const [isBrandModalOpen, setIsBrandModalOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<ManagedBrand | null>(null);

  useEffect(() => {
    saveToStorage('managedBrands', managedBrands);
  }, [managedBrands]);

  // Dynamic Divisions State
  const [divisions, setDivisions] = useState<DivisionItem[]>(() => loadFromStorage('divisions', INITIAL_DIVISIONS));

  // Cross-Division Task Requests State
  const [divisionRequests, setDivisionRequests] = useState<DivisionTaskRequest[]>(() =>
    loadFromStorage('divisionRequests', INITIAL_DIVISION_REQUESTS)
  );

  // External Email Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<PendingUserApproval[]>(() =>
    loadFromStorage('pendingApprovals', [])
  );

  useEffect(() => {
    saveToStorage('pendingApprovals', pendingApprovals);
  }, [pendingApprovals]);

  const submitUserApprovalRequest = (data: {
    name: string;
    email: string;
    department: string;
    position: string;
    avatar?: string;
    nickname?: string;
    birthDate?: string;
    employeeId?: string;
    location?: string;
    employmentType?: 'Full-time' | 'Contract' | 'Probation' | 'Intern' | 'Freelance';
    phone?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    emergencyContact?: { name: string; relation: string; phone: string };
    bankAccount?: { bankName: string; accountNumber: string; accountHolder: string };
  }) => {
    const newReq: PendingUserApproval = {
      id: 'pa_' + Date.now(),
      name: data.name,
      email: data.email,
      avatar: data.avatar || '',
      department: data.department,
      position: data.position,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      nickname: data.nickname,
      birthDate: data.birthDate,
      employeeId: data.employeeId,
      location: data.location,
      employmentType: data.employmentType,
      phone: data.phone,
      gender: data.gender,
      emergencyContact: data.emergencyContact,
      bankAccount: data.bankAccount
    };
    setPendingApprovals(prev => [newReq, ...prev]);

    // Send notification to Super Admin
    const superAdmin = users.find(u => u.role === 'super_admin') || users[0];
    if (superAdmin) {
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        recipientId: superAdmin.id,
        senderName: data.name,
        senderAvatar: data.avatar || '',
        type: 'system',
        title: 'Permohonan Akses Akun Baru',
        message: `${data.name} (${data.email}) meminta akses ke workspace. Silakan setujui di Panel Admin.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    addAuditLog('USER_APPROVAL_REQUEST', 'Authentication', `Permohonan akses akun eksternal dari ${data.email} dikirim ke Super Admin`);
  };

  const approveUserRegistration = (id: string) => {
    const req = pendingApprovals.find(p => p.id === id);
    if (!req) return;
    const newUser: User = {
      id: 'usr_ext_' + Date.now(),
      name: req.name,
      email: req.email,
      avatar: req.avatar || '',
      role: 'employee',
      department: req.department,
      position: req.position,
      phone: req.phone || '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: req.location || 'Headquarters – Jakarta',
      status: 'online',
      joinedDate: new Date().toISOString().split('T')[0],
      employeeId: req.employeeId || 'EMP-' + Math.floor(2026000 + Math.random() * 9000),
      employmentType: req.employmentType || 'Contract',
      gender: req.gender || 'Laki-laki',
      birthDate: req.birthDate || '1995-01-01',
      emergencyContact: req.emergencyContact,
      bankAccount: req.bankAccount
    };
    setUsers(prev => [newUser, ...prev]);
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    addAuditLog('USER_APPROVAL_ACCEPT', 'Authentication', `Super Admin menyetujui akses akun ${req.email}`);
  };

  const rejectUserRegistration = (id: string) => {
    const req = pendingApprovals.find(p => p.id === id);
    if (!req) return;
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    addAuditLog('USER_APPROVAL_REJECT', 'Authentication', `Super Admin menolak akses akun ${req.email}`);
  };

  // Audio Ringtones & Chimes Mute State
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEffects.getIsMuted());

  // Global Leave Request Approval Toast
  const [leaveApprovalToast, setLeaveApprovalToast] = useState<string | null>(null);

  // Sync state to localStorage & modern IndexedDB Engine
  useEffect(() => {
    saveToStorage('divisionRequests', divisionRequests);
  }, [divisionRequests]);

  useEffect(() => { 
    saveToStorage('divisions', divisions); 
    modernDb.saveBatch('divisions', divisions);
  }, [divisions]);

  useEffect(() => { 
    saveToStorage('brandDriveFolders', brandDriveFolders); 
    modernDb.saveBatch('brandDriveFolders', brandDriveFolders);
  }, [brandDriveFolders]);

  useEffect(() => { 
    saveToStorage('users', users); 
    modernDb.saveBatch('users', users);
  }, [users]);

  useEffect(() => { saveToStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('activeTab', activeTab); }, [activeTab]);
  useEffect(() => { saveToStorage('themeSettings', themeSettings); }, [themeSettings]);
  useEffect(() => { saveToStorage('workspaceInfo', workspaceInfo); }, [workspaceInfo]);
  useEffect(() => { saveToStorage('isAuthenticated', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { saveToStorage('selectedTaskGroup', selectedTaskGroup); }, [selectedTaskGroup]);

  useEffect(() => { 
    saveToStorage('posts', posts); 
    modernDb.saveBatch('posts', posts);
  }, [posts]);

  useEffect(() => { 
    saveToStorage('tasks', tasks); 
    modernDb.saveBatch('tasks', tasks);
  }, [tasks]);

  useEffect(() => { 
    saveToStorage('channels', channels); 
    modernDb.saveBatch('channels', channels);
  }, [channels]);

  useEffect(() => { saveToStorage('activeChannelId', activeChannelId); }, [activeChannelId]);
  useEffect(() => { saveToStorage('messages', messages); }, [messages]);

  useEffect(() => { 
    saveToStorage('meetings', meetings); 
    modernDb.saveBatch('meetings', meetings);
  }, [meetings]);

  useEffect(() => { 
    saveToStorage('documents', documents); 
    modernDb.saveBatch('documents', documents);
  }, [documents]);

  useEffect(() => { 
    saveToStorage('notifications', notifications); 
    modernDb.saveBatch('notifications', notifications);
  }, [notifications]);

  useEffect(() => { 
    saveToStorage('auditLogs', auditLogs); 
    modernDb.saveBatch('auditLogs', auditLogs);
  }, [auditLogs]);

  useEffect(() => { saveToStorage('isRightNotificationOpen', isRightNotificationOpen); }, [isRightNotificationOpen]);

  // Sync dark mode class on HTML document and body, attribute, and localStorage keys
  useEffect(() => {
    const isDark = themeSettings.mode === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('theme', themeSettings.mode);
      localStorage.setItem('WORKSPACE_THEME', themeSettings.mode);
    } catch {}
  }, [themeSettings.mode]);

  // Apply theme shapes, background patterns, and custom colors
  useEffect(() => {
    const root = document.documentElement;
    const radiusMap: Record<string, string> = {
      sharp: '6px',
      rounded: '12px',
      smooth: '20px',
      pill: '9999px'
    };
    const cardRadiusMap: Record<string, string> = {
      sharp: '8px',
      rounded: '16px',
      smooth: '24px',
      pill: '36px'
    };
    root.style.setProperty('--ui-radius', cardRadiusMap[themeSettings.cardRadius || 'smooth'] || '24px');
    root.style.setProperty('--btn-radius', radiusMap[themeSettings.cardRadius || 'smooth'] || '20px');

    const PRESET_COLORS: Record<string, { primary: string; accent: string }> = {
      'navy-crimson': { primary: '#0f172a', accent: '#dc2626' },
      'royal-blue': { primary: '#1e3a8a', accent: '#2563eb' },
      'emerald': { primary: '#064e3b', accent: '#059669' },
      'purple': { primary: '#3b0764', accent: '#9333ea' },
      'amber': { primary: '#451a03', accent: '#f59e0b' }
    };

    const preset = PRESET_COLORS[themeSettings.accentColor] || PRESET_COLORS['navy-crimson'];
    root.style.setProperty('--primary-color', themeSettings.customPrimaryColor || preset.primary);
    root.style.setProperty('--accent-color', themeSettings.customAccentColor || preset.accent);

    // Chat bubble color application
    const BUBBLE_COLORS: Record<string, string> = {
      red: '#dc2626',
      blue: '#2563eb',
      emerald: '#059669',
      purple: '#7c3aed',
      amber: '#d97706',
      navy: '#0f172a'
    };

    const bubbleBg = themeSettings.chatBubbleColor === 'custom' && themeSettings.customChatBubbleColor
      ? themeSettings.customChatBubbleColor
      : (BUBBLE_COLORS[themeSettings.chatBubbleColor || 'red'] || '#dc2626');
    root.style.setProperty('--chat-bubble-bg', bubbleBg);

    // Dynamic Font Size Scaling (Normal - Large - Very Large)
    const FONT_SCALES: Record<string, string> = {
      normal: '16.5px',
      large: '18.5px',
      'very-large': '20.5px'
    };
    const activeFontSize = FONT_SCALES[themeSettings.fontSize || 'very-large'] || '20.5px';
    root.style.setProperty('--app-font-size', activeFontSize);
    document.documentElement.style.fontSize = activeFontSize;

    // 6 Varian Font Workspace (DM Sans, Helvetica, Segoe UI, Satoshi, Inter, Jakarta Sans)
    const FONT_FAMILIES: Record<string, string> = {
      'dm-sans': "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      'helvetica': "'Helvetica Neue', Helvetica, -apple-system, Arial, sans-serif",
      'segoe-ui': "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
      'satoshi': "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
      'inter': "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      'jakarta-sans': "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    };
    const activeFontFamily = FONT_FAMILIES[themeSettings.fontFamily || 'dm-sans'] || FONT_FAMILIES['dm-sans'];
    root.style.setProperty('--font-sans', activeFontFamily);
    document.documentElement.style.fontFamily = activeFontFamily;
    document.body.style.fontFamily = activeFontFamily;

    // Dynamic Button Hover, Selector Active, and Icon Accent Colors
    if (themeSettings.buttonHoverColor) {
      root.style.setProperty('--btn-hover-color', themeSettings.buttonHoverColor);
    } else {
      root.style.removeProperty('--btn-hover-color');
    }
    if (themeSettings.selectorActiveColor) {
      root.style.setProperty('--selector-active-color', themeSettings.selectorActiveColor);
    } else {
      root.style.removeProperty('--selector-active-color');
    }
    // Dynamic Background Solid and Gradient
    if (themeSettings.customBgSolidColor) {
      root.style.setProperty('--custom-bg-solid', themeSettings.customBgSolidColor);
    } else {
      root.style.removeProperty('--custom-bg-solid');
    }
    if (themeSettings.customBgGradient) {
      root.style.setProperty('--custom-bg-gradient', themeSettings.customBgGradient);
    } else {
      root.style.removeProperty('--custom-bg-gradient');
    }

    const patternClasses = [
      'bg-pattern-clean',
      'bg-pattern-dots',
      'bg-pattern-mesh',
      'bg-pattern-grid',
      'bg-pattern-aurora',
      'bg-pattern-solid',
      'bg-pattern-gradient'
    ];
    patternClasses.forEach(cls => {
      document.body.classList.remove(cls);
      document.documentElement.classList.remove(cls);
    });
    if (themeSettings.bgPattern && themeSettings.bgPattern !== 'clean') {
      document.body.classList.add(`bg-pattern-${themeSettings.bgPattern}`);
      document.documentElement.classList.add(`bg-pattern-${themeSettings.bgPattern}`);
    }

    saveToStorage('themeSettings', themeSettings);
  }, [
    themeSettings.cardRadius,
    themeSettings.bgPattern,
    themeSettings.accentColor,
    themeSettings.customPrimaryColor,
    themeSettings.customAccentColor,
    themeSettings.chatBubbleColor,
    themeSettings.customChatBubbleColor,
    themeSettings.fontSize,
    themeSettings.fontFamily,
    themeSettings.buttonHoverColor,
    themeSettings.selectorActiveColor,
    themeSettings.iconAccentColor,
    themeSettings.customBgSolidColor,
    themeSettings.customBgGradient
  ]);

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeSettings(prev => {
      const next = { ...prev, mode };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  const toggleTheme = () => {
    setThemeSettings(prev => {
      const next = {
        ...prev,
        mode: (prev.mode === 'dark' ? 'light' : 'dark') as 'light' | 'dark'
      };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => {
      const next = { ...prev, ...newSettings };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  // Division Actions
  const addDivision = (divData: Omit<DivisionItem, 'id'>) => {
    const newDiv: DivisionItem = {
      ...divData,
      id: 'div_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDivisions(prev => [...prev, newDiv]);

    // Automatically create private group channel for this division
    const channelNameSlug = divData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newChannelId = 'chn_div_' + Date.now();

    const divisionMemberIds = users
      .filter(u => u.department?.toLowerCase().includes(divData.departmentMatch.toLowerCase()) || divData.departmentMatch.toLowerCase().includes(u.department?.toLowerCase() || ''))
      .map(u => u.id);

    if (!divisionMemberIds.includes(currentUser.id)) {
      divisionMemberIds.push(currentUser.id);
    }

    const newPrivateChannel: Channel = {
      id: newChannelId,
      name: channelNameSlug,
      type: 'channel',
      description: `Channel grup privat otomatis untuk divisi ${divData.name}`,
      isPrivate: true,
      memberIds: divisionMemberIds.length > 0 ? divisionMemberIds : [currentUser.id],
      dept: divData.departmentMatch,
      unreadCount: 1,
      lastMessage: `🎉 Channel grup privat divisi "${divData.name}" berhasil dibuat!`,
      lastMessageTime: new Date().toISOString()
    };

    setChannels(prev => [...prev, newPrivateChannel]);

    // Send initial welcome notification message into the private channel
    setMessages(prev => ({
      ...prev,
      [newChannelId]: [
        {
          id: 'msg_' + Date.now(),
          channelId: newChannelId,
          senderId: 'sys_bot',
          senderName: 'SYSTEM AUTOMATION',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          content: `🎉 **CHANNEL GRUP PRIVAT DIVISI "${divData.name.toUpperCase()}" BERHASIL DIBUAT**\n\nChannel privat ini secara otomatis dibuat untuk seluruh anggota divisi **${divData.name}**. Gunakan ruang ini untuk komunikasi, koordinasi, dan approval tim.`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          reactions: [],
          type: 'text'
        }
      ]
    }));

    addAuditLog('DIVISION_CREATE', 'Division Hub', `Menambahkan divisi baru: "${newDiv.name}" & otomatis membuat channel privat "#${channelNameSlug}"`);
  };

  const deleteDivision = (id: string) => {
    setDivisions(prev => prev.filter(d => d.id !== id));
    addAuditLog('DIVISION_DELETE', 'Division Hub', `Menghapus divisi ${id}`);
  };

  const updateDivision = (updated: DivisionItem) => {
    setDivisions(prev => prev.map(d => d.id === updated.id ? updated : d));
    addAuditLog('DIVISION_UPDATE', 'Division Hub', `Memperbarui divisi: "${updated.name}"`);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (tab === 'notifications') {
      setNotifications(items => items.map(n => ({ ...n, read: true })));
    }
    if (tab === 'chat' && activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addAuditLog = (action: string, resource: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      resource,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '10.240.12.8 (Internal HQ)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    addAuditLog('USER_SWITCH_CONTEXT', 'User Session', `Beralih profil ke ${user.name} (${user.role})`);
  };

  // FEED ACTIONS
  const createPost = (newPostData: Omit<Post, 'id' | 'likes' | 'bookmarks' | 'reposts' | 'comments' | 'createdAt'>) => {
    const newPost: Post = {
      ...newPostData,
      id: 'post_' + Date.now(),
      likes: [],
      bookmarks: [],
      reposts: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
    addAuditLog('POST_CREATE', 'Social Feed', `Mempublikasikan kiriman baru: "${newPost.content.substring(0, 40)}..."`);
  };

  const likePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const hasLiked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id]
        };
      })
    );
  };

  const reactToPost = (postId: string, emoji: string) => {
    soundEffects.playEmojiPopSound();
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const currentReactions = p.reactions && p.reactions.length > 0 ? p.reactions : [
          { emoji: '😍', userIds: p.likes.slice(0, 14) },
          { emoji: '❤️', userIds: p.likes },
          { emoji: '🔥', userIds: p.likes.slice(0, 35) },
          { emoji: '⚡', userIds: p.likes.slice(0, 19) },
          { emoji: '🤝', userIds: p.likes.slice(0, 22) }
        ];

        let found = false;
        const updatedReactions = currentReactions.map(r => {
          if (r.emoji === emoji) {
            found = true;
            const hasUser = r.userIds.includes(currentUser.id);
            const newUserIds = hasUser
              ? r.userIds.filter(id => id !== currentUser.id)
              : [...r.userIds, currentUser.id];
            return { ...r, userIds: newUserIds };
          }
          return r;
        }).filter(r => r.userIds.length > 0);

        if (!found) {
          updatedReactions.push({ emoji, userIds: [currentUser.id] });
        }

        const totalLikes = updatedReactions.reduce((acc, r) => (r.emoji === '❤️' || r.emoji === '😍' ? acc + r.userIds.length : acc), 0);

        return {
          ...p,
          reactions: updatedReactions,
          likes: totalLikes > 0 ? Array.from(new Set([...p.likes, currentUser.id])) : p.likes
        };
      })
    );
  };

  const bookmarkPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const hasBookmarked = p.bookmarks.includes(currentUser.id);
        return {
          ...p,
          bookmarks: hasBookmarked ? p.bookmarks.filter(id => id !== currentUser.id) : [...p.bookmarks, currentUser.id]
        };
      })
    );
  };

  const addComment = (
    postId: string,
    content: string,
    extra?: { parentId?: string; replyToName?: string; stickerUrl?: string; gifUrl?: string }
  ) => {
    if (!content.trim() && !extra?.stickerUrl && !extra?.gifUrl) return;
    const commentObj: Comment = {
      id: 'comm_' + Date.now(),
      postId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.position,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      parentId: extra?.parentId,
      replyToName: extra?.replyToName,
      stickerUrl: extra?.stickerUrl,
      gifUrl: extra?.gifUrl
    };
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, commentObj] } : p))
    );
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId || !p.pollOptions) return p;
        const updatedOptions = p.pollOptions.map(opt => {
          const filtered = opt.votes.filter(uid => uid !== currentUser.id);
          if (opt.id === optionId) {
            return { ...opt, votes: [...filtered, currentUser.id] };
          }
          return { ...opt, votes: filtered };
        });
        return { ...p, pollOptions: updatedOptions };
      })
    );
  };

  const togglePinPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // TASK ACTIONS
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'tsk_' + Date.now(),
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Membuat task baru',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    soundEffects.playNewTaskSound();
    addAuditLog('TASK_CREATE', 'Kanban Board', `Membuat task: "${newTask.title}"`);
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t)));
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const isNowDone = newStatus === 'done';
        if (isNowDone && t.status !== 'done') {
          soundEffects.playNewTaskSound();
          // Trigger celebratory confetti!
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {
            // ignore
          }
        }
        return {
          ...t,
          status: newStatus,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
          activity: [
            {
              id: 'act_' + Date.now(),
              userId: currentUser.id,
              userName: currentUser.name,
              action: `Mengubah status ke ${newStatus.toUpperCase()}`,
              timestamp: new Date().toISOString()
            },
            ...t.activity
          ]
        };
      })
    );
    addAuditLog('TASK_MOVE', 'Kanban Board', `Task ${taskId} diubah status menjadi ${newStatus}`);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newChecklists = t.checklists.map(c =>
          c.id === itemId ? { ...c, completed: !c.completed } : c
        );
        return {
          ...t,
          checklists: newChecklists,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const commentObj = {
      id: 'tc_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toISOString()
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          comments: [...t.comments, commentObj],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog('TASK_DELETE', 'Kanban Board', `Menghapus task ${taskId}`);
  };

  const toggleTaskCheckpoint = (taskId: string, checkpointId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const currentCheckpoints = t.checkpoints || [];
        const updated = currentCheckpoints.map(cp => {
          if (cp.id !== checkpointId) return cp;
          const isDone = !cp.isCompleted;
          return {
            ...cp,
            isCompleted: isDone,
            completedAt: isDone ? new Date().toISOString() : undefined
          };
        });
        return {
          ...t,
          checkpoints: updated,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskCheckpoint = (taskId: string, title: string, targetDate?: string) => {
    if (!title.trim()) return;
    const newCheckpoint: TaskCheckpoint = {
      id: 'cp_' + Date.now(),
      title: title.trim(),
      isCompleted: false,
      targetDate
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checkpoints: [...(t.checkpoints || []), newCheckpoint],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskReport = (taskId: string, report: { type: 'progress_update' | 'blocker' | 'note'; content: string }) => {
    if (!report.content.trim()) return;
    const newReport: TaskReportItem = {
      id: 'rep_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      type: report.type,
      content: report.content.trim(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          reports: [newReport, ...(t.reports || [])],
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_REPORT', 'Task Progress', `Menambahkan laporan/catatan pada task: ${taskId}`);
  };

  const updateTaskVideoDraft = (taskId: string, scenes: VideoDraftScene[]) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          videoDraftScenes: scenes,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Video Storyboard', `Memperbarui draft storyboard video (${scenes.length} scene)`);
  };

  const updateTaskBriefFormat = (taskId: string, format: CreativeBriefFormat) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          briefFormat: format,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Creative Brief', `Mengubah format brief card menjadi: ${format}`);
  };

  const updateTaskSlideDraft = (taskId: string, slides: SlideDraftItem[]) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          slideDraftItems: slides,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Slide Draft', `Memperbarui draft slide presentasi/carousel (${slides.length} slide)`);
  };

  const updateTaskPosterDraft = (taskId: string, poster: PosterDraftItem) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          posterDraftItem: poster,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Poster Draft', `Memperbarui brief poster single key visual`);
  };

  const sendTaskForApproval = (taskId: string, targetChannelId: string, managerIds: string[], notes?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    // Resolve target channel or create DM dynamically if user selected a person
    let actualChannelId = targetChannelId;
    let targetChan = channels.find(c => c.id === targetChannelId);

    if (!targetChan) {
      let targetUserId = targetChannelId;
      if (targetUserId.startsWith('dm_')) {
        targetUserId = targetUserId.replace(/^dm_/, '');
      }
      const targetUser = users.find(u => u.id === targetUserId || u.id === targetChannelId);
      if (targetUser) {
        const existingDm = channels.find(c => c.type === 'direct' && c.otherUserId === targetUser.id);
        if (existingDm) {
          actualChannelId = existingDm.id;
          targetChan = existingDm;
        } else {
          const newDm: Channel = {
            id: 'dm_' + targetUser.id + '_' + Date.now(),
            name: targetUser.name,
            type: 'direct',
            otherUserId: targetUser.id,
            avatar: targetUser.avatar,
            memberIds: [currentUser.id, targetUser.id],
            unreadCount: 0,
            lastMessage: 'Pengajuan approval tugas...',
            lastMessageTime: 'Baru saja'
          };
          setChannels(prev => [newDm, ...prev]);
          actualChannelId = newDm.id;
          targetChan = newDm;
        }
      }
    }

    const managerApprovals: TaskApproval[] = managerIds.map(mId => {
      const mgr = users.find(u => u.id === mId);
      return {
        id: 'app_' + Date.now() + '_' + mId,
        managerId: mId,
        managerName: mgr?.name || 'Manager',
        managerRole: mgr?.role || 'Manager',
        managerAvatar: mgr?.avatar || '',
        status: 'pending'
      };
    });

    const channelDisplayName = targetChan
      ? (targetChan.type === 'channel' ? `#${targetChan.name}` : targetChan.name)
      : 'Group / Chat Personal';

    const approvalReq: TaskApprovalRequest = {
      targetChannelId: actualChannelId,
      targetChannelName: channelDisplayName,
      targetGroupId: targetTask.groupId,
      requestedAt: new Date().toISOString(),
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      status: 'pending',
      requiredApprovals: managerApprovals
    };

    const updatedTask: Task = {
      ...targetTask,
      status: 'on_review', // CARD AUTOMATICALLY SHIFTS TO ON REVIEW!
      approvalRequest: approvalReq,
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Mengajukan approval ke ${channelDisplayName} (${managerApprovals.map(m => m.managerName).join(', ')})`,
          timestamp: new Date().toISOString()
        },
        ...(targetTask.activity || [])
      ],
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));

    if (actualChannelId) {
      const messageContent = notes?.trim()
        ? notes.trim()
        : `Mohon review dan persetujuan untuk tugas: "${targetTask.title}"`;

      sendMessage(
        actualChannelId,
        messageContent,
        undefined,
        undefined,
        undefined,
        { attachedTask: updatedTask }
      );
    }

    setAutomationToast({
      type: 'success',
      message: `⚡ Card "${targetTask.title}" telah dikirim ke ${channelDisplayName} untuk approval. Status kartu otomatis bergeser ke ON REVIEW.`
    });

    soundEffects.play('success');
    addAuditLog('APPROVAL_REQUEST', 'Task Management', `Mengirimkan tugas "${targetTask.title}" untuk approval ke ${channelDisplayName}`);
  };

  const processTaskApproval = (taskId: string, managerId: string, decision: 'approved' | 'declined', comment?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || !targetTask.approvalRequest) return;

    const manager = users.find(u => u.id === managerId) || currentUser;
    const currentApprovals = targetTask.approvalRequest.requiredApprovals.map(app => {
      if (app.managerId === managerId || (currentUser.role === 'super_admin' && app.status === 'pending')) {
        return {
          ...app,
          status: decision,
          comment: comment || (decision === 'approved' ? 'Disetujui' : 'Perlu revisi'),
          timestamp: new Date().toISOString()
        };
      }
      return app;
    });

    const allApproved = currentApprovals.every(a => a.status === 'approved');
    const isDeclined = decision === 'declined';

    // SHIFT AUTOMATICALLY TO DONE IF APPROVED, OR BACK TO ON_PROGRESS IF DECLINED!
    const newStatus: TaskStatus = allApproved ? 'done' : isDeclined ? 'on_progress' : 'on_review';
    const newApprovalStatus = allApproved ? 'approved' : isDeclined ? 'declined' : 'pending';

    if (allApproved) {
      try {
        confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });
      } catch {}
      soundEffects.play('success');
    } else if (isDeclined) {
      soundEffects.play('click');
    }

    const updatedTask: Task = {
      ...targetTask,
      status: newStatus,
      completedAt: allApproved ? new Date().toISOString() : undefined,
      approvalRequest: {
        ...targetTask.approvalRequest,
        status: newApprovalStatus,
        requiredApprovals: currentApprovals
      },
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `${decision === 'approved' ? 'Menyetujui' : 'Menolak'} approval task (${manager.name}): ${comment || ''}`,
          timestamp: new Date().toISOString()
        },
        ...(targetTask.activity || [])
      ],
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));

    setAutomationToast({
      type: allApproved ? 'success' : isDeclined ? 'warning' : 'info',
      message: allApproved
        ? `🎉 Task "${targetTask.title}" telah DISETUJUI oleh seluruh manajer dan otomatis bergeser ke kolom DONE!`
        : isDeclined
        ? `⚠️ Task "${targetTask.title}" ditolak/minta revisi dan bergeser kembali ke IN PROGRESS.`
        : `Persetujuan dicatat (${manager.name}). Menunggu manajer lain.`
    });

    if (targetTask.approvalRequest?.targetChannelId) {
      if (allApproved) {
        sendMessage(
          targetTask.approvalRequest.targetChannelId,
          `🎉 **TASK TELAH DISETUJUI & SELESAI (DONE)!**\n\nTugas: **${targetTask.title}**\nSeluruh Manager telah memberikan persetujuan. Kartu tugas secara otomatis dipindahkan ke kolom **Done / Selesai**.`
        );
      } else if (isDeclined) {
        sendMessage(
          targetTask.approvalRequest.targetChannelId,
          `⚠️ **APPROVAL DITOLAK / PERLU REVISI**\n\nTugas: **${targetTask.title}**\nDitolak oleh: **${manager.name}**\nAlasan: "${comment || 'Perlu perbaikan sebelum approval disetujui.'}"\nStatus tugas dikembalikan ke **On Progress**.`
        );
      }
    }

    addAuditLog(
      decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_DECLINED',
      'Task Management',
      `${manager.name} ${decision === 'approved' ? 'menyetujui' : 'menolak'} tugas "${targetTask.title}"`
    );
  };

  const archiveTask = (taskId: string) => {
    const wib = getWIBNow();
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              isArchived: true,
              archivedAt: new Date().toISOString(),
              archiveFolder: wib.monthYear,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      saveToStorage('tasks', updated);
      return updated;
    });
    addAuditLog('TASK_ARCHIVE', 'Task Management', `Mengarsipkan tugas: ${taskId}`);
  };

  const unarchiveTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId
          ? { ...t, isArchived: false, archivedAt: undefined, archiveFolder: undefined, updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage('tasks', updated);
      return updated;
    });
    addAuditLog('TASK_UNARCHIVE', 'Task Management', `Memulihkan tugas dari arsip: ${taskId}`);
  };

  const restoreTaskFromArchive = (taskId: string) => {
    setTasks(prev => {
      const updated = restoreArchivedTask(taskId, prev);
      saveToStorage('tasks', updated);
      return updated;
    });
    addAuditLog('TASK_RESTORE', 'Task Management', `Memulihkan tugas ${taskId} ke Board aktif`);
    setAutomationToast({
      type: 'success',
      message: 'Tugas berhasil dipulihkan dan dikembalikan ke Board aktif!'
    });
  };

  // Sync automation configs and history with backend server on mount
  useEffect(() => {
    const syncBackend = async () => {
      try {
        const res = await fetch('/api/automation/configs');
        if (res.ok) {
          const data = await res.json();
          if (data && data.configs) {
            setAutomationConfigs(prev => ({ ...prev, ...data.configs }));
          }
        }
      } catch (err) {
        // Backend offline fallback handled gracefully
      }

      try {
        const resH = await fetch('/api/automation/history');
        if (resH.ok) {
          const dataH = await resH.json();
          if (dataH && Array.isArray(dataH.history)) {
            setAutomationHistory(dataH.history);
          }
        }
      } catch (err) {
        // History fallback
      }
    };

    syncBackend();
  }, []);

  const updateDivisionAutomationConfig = async (
    divisionId: string,
    updates: Partial<DivisionAutomationConfig>
  ) => {
    const existing = automationConfigs[divisionId] || createDefaultDivisionConfig(divisionId, divisionId, false);
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const nextConfigs = { ...automationConfigs, [divisionId]: updated };
    setAutomationConfigs(nextConfigs);
    saveToStorage('automationConfigs', nextConfigs);

    try {
      await fetch(`/api/automation/configs/${divisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      // offline fallback
    }
  };

  const toggleDivisionAdvancedMode = async (divisionId: string): Promise<boolean> => {
    const current = automationConfigs[divisionId]?.isAdvancedModeEnabled ?? false;
    const nextMode = !current;
    await updateDivisionAutomationConfig(divisionId, { isAdvancedModeEnabled: nextMode });
    setAutomationToast({
      type: nextMode ? 'success' : 'info',
      message: nextMode
        ? `Advanced Mode diaktifkan untuk divisi! Otomasi Senin 09.00 WIB & Jumat 23.00 WIB aktif.`
        : `Advanced Mode dinonaktifkan. Divisi beralih ke mode manual biasa.`
    });
    return nextMode;
  };

  const runWeeklyGeneration = async (
    divisionId: string,
    force: boolean = false
  ): Promise<{ success: boolean; generatedCount: number; details: string; log: AutomationHistoryLog }> => {
    let config = automationConfigs[divisionId];
    if (!config) {
      config = createDefaultDivisionConfig(divisionId, divisionId, true);
    }

    try {
      const response = await fetch('/api/automation/run-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisionId, force, clientTasks: tasks })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newTasks && data.newTasks.length > 0) {
          const nextTasks = [...data.newTasks, ...tasks];
          setTasks(nextTasks);
          saveToStorage('tasks', nextTasks);
        }
        if (data.log) {
          setAutomationHistory(prev => [data.log, ...prev]);
        }
        setAutomationToast({
          type: data.status === 'skipped_duplicate' ? 'info' : 'success',
          message: data.details
        });
        return {
          success: data.success,
          generatedCount: data.generatedCount || 0,
          details: data.details,
          log: data.log
        };
      }
    } catch (err) {
      console.warn('Backend API unavailable, executing client-side generator');
    }

    // Client-side fallback execution
    const divisionName = config.divisionName || divisionId;
    const res = generateWeeklyTasksForDivision(divisionId, divisionName, config, tasks, 'manual_admin', force);
    if (res.newTasks.length > 0) {
      const nextTasks = [...res.newTasks, ...tasks];
      setTasks(nextTasks);
      saveToStorage('tasks', nextTasks);
    }
    setAutomationHistory(prev => [res.log, ...prev]);
    setAutomationToast({
      type: res.status === 'skipped_duplicate' ? 'info' : 'success',
      message: res.details
    });
    return {
      success: res.status === 'success',
      generatedCount: res.newTasks.length,
      details: res.details,
      log: res.log
    };
  };

  const runAutoArchive = async (
    divisionId: string = 'all'
  ): Promise<{ success: boolean; archivedCount: number; details: string; log: AutomationHistoryLog }> => {
    try {
      const response = await fetch('/api/automation/run-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisionId, clientTasks: tasks })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.archivedTasks && data.archivedTasks.length > 0) {
          const archivedIds = data.archivedTasks.map((t: Task) => t.id);
          const nextTasks = tasks.map(t =>
            archivedIds.includes(t.id) ? { ...t, isArchived: true, archivedAt: new Date().toISOString() } : t
          );
          setTasks(nextTasks);
          saveToStorage('tasks', nextTasks);
        }
        if (data.log) {
          setAutomationHistory(prev => [data.log, ...prev]);
        }
        setAutomationToast({
          type: 'success',
          message: data.details
        });
        return {
          success: true,
          archivedCount: data.archivedCount || 0,
          details: data.details,
          log: data.log
        };
      }
    } catch (err) {
      console.warn('Backend API unavailable, executing client-side archiver');
    }

    // Client-side fallback
    const divisionName = divisionId === 'all' ? 'Semua Divisi' : (automationConfigs[divisionId]?.divisionName || divisionId);
    const res = archiveDoneTasks(divisionId, divisionName, tasks, 'manual_admin');
    setTasks(res.updatedTasks);
    saveToStorage('tasks', res.updatedTasks);
    setAutomationHistory(prev => [res.log, ...prev]);
    setAutomationToast({
      type: 'success',
      message: res.log.details
    });
    return {
      success: true,
      archivedCount: res.archivedCount,
      details: res.log.details,
      log: res.log
    };
  };

  // CALL ACTIONS (Private Call & Group Call)
  const startHuddle = (title: string, type: 'channel' | 'direct' | 'division', targetId: string, isVoiceOnly: boolean = false) => {
    let participants: HuddleParticipant[] = [];

    if (type === 'direct') {
      // 1-on-1 Private Call: strictly ONLY 2 participants (currentUser + recipient)
      const targetChannel = channels.find(c => c.id === targetId);
      const recipientId = targetChannel?.otherUserId || targetId;
      const otherUser = users.find(u => u.id === recipientId) || users.find(u => u.id !== currentUser.id);

      participants = [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.position || currentUser.role,
          isMuted: false,
          isVideoOn: !isVoiceOnly,
          isSpeaking: true,
          isScreenSharing: false
        }
      ];

      if (otherUser && otherUser.id !== currentUser.id) {
        participants.push({
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          role: otherUser.position || otherUser.role,
          isMuted: false,
          isVideoOn: !isVoiceOnly,
          isSpeaking: false,
          isScreenSharing: false
        });
      }
    } else {
      // Group Call: channel / division members
      const targetChannel = channels.find(c => c.id === targetId);
      let groupMembers = targetChannel?.memberIds?.length
        ? users.filter(u => targetChannel.memberIds.includes(u.id) && u.id !== currentUser.id)
        : users.filter(u => u.id !== currentUser.id);

      if (groupMembers.length === 0) {
        groupMembers = users.filter(u => u.id !== currentUser.id).slice(0, 4);
      }

      participants = [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.position || currentUser.role,
          isMuted: false,
          isVideoOn: !isVoiceOnly,
          isSpeaking: true,
          isScreenSharing: false
        },
        ...groupMembers.slice(0, 5).map((u, i) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          role: u.position || u.role,
          isMuted: i > 0,
          isVideoOn: !isVoiceOnly && i === 0,
          isSpeaking: i === 0,
          isScreenSharing: false
        }))
      ];
    }

    setActiveHuddle({
      id: 'call_' + Date.now(),
      title,
      type,
      targetId,
      startedAt: new Date().toISOString(),
      participants,
      isMinimized: false,
      isVoiceOnly,
      isRecording: false
    });

    soundEffects.playPhoneRingSound(12);
    addAuditLog('CALL_START', 'Komunikasi Terpadu', `Memulai ${type === 'direct' ? 'Private Call 1-on-1' : 'Group Call'} (${isVoiceOnly ? 'Suara' : 'Video HD'}) di ${title}`);
  };

  const endHuddle = () => {
    soundEffects.stopPhoneRingSound();
    setActiveHuddle(null);
    addAuditLog('CALL_END', 'Komunikasi Terpadu', `Mengakhiri panggilan`);
  };

  const toggleHuddleMinimize = () => {
    setActiveHuddle(prev => (prev ? { ...prev, isMinimized: !prev.isMinimized } : null));
  };

  const toggleHuddleMic = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isMuted: !p.isMuted, isSpeaking: p.isMuted } : p
        )
      };
    });
  };

  const toggleHuddleVideo = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isVideoOn: !p.isVideoOn } : p
        )
      };
    });
  };

  const toggleHuddleScreenShare = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isScreenSharing: !p.isScreenSharing } : p
        )
      };
    });
  };

  const toggleHuddleRecording = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isRecording: !prev.isRecording
      };
    });
  };

  const sendHuddleReaction = (emoji: string) => {
    // emoji event broadcasted to active room
  };

  const updateWorkspaceInfo = (info: Partial<WorkspaceInfo>) => {
    if (currentUser.role !== 'super_admin') {
      console.warn('Hanya Super Admin yang berwenang mengubah konfigurasi workspace.');
      return;
    }
    setWorkspaceInfo(prev => ({ ...prev, ...info }));
    addAuditLog('WORKSPACE_UPDATE', 'Pengaturan Workspace', `Memperbarui konfigurasi workspace`);
  };

  const login = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    addAuditLog('AUTH_LOGIN', 'Sesi Pengguna', `${user.name} berhasil login`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('AUTH_LOGOUT', 'Sesi Pengguna', `${currentUser.name} keluar sistem`);
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    position: string;
    role: UserRole;
    avatar?: string;
  }) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'employee',
      department: userData.department,
      position: userData.position,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      phone: '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: 'Headquarters - Jakarta',
      status: 'online',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthenticated(true);
    addAuditLog('USER_REGISTER', 'Pendaftaran Akun Baru', `User ${newUser.name} berhasil didaftarkan ke divisi ${newUser.department}`);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    return newUser;
  };

  const toggleRightNotifications = () => {
    setIsRightNotificationOpen(prev => {
      const next = !prev;
      if (next) {
        // When opening the notification center, mark all notifications as read so the badge clears
        setNotifications(items => items.map(n => ({ ...n, read: true })));
      }
      return next;
    });
  };

  // CHAT ACTIONS
  const sendMessage = (
    channelId: string,
    content: string,
    attachments?: Attachment[],
    voiceNote?: { duration: string; url: string },
    sticker?: StickerData,
    extra?: { imageUrl?: string; attachedTask?: Task; leaveRequest?: LeaveRequest }
  ) => {
    if (!content.trim() && !attachments?.length && !voiceNote && !sticker && !extra?.imageUrl && !extra?.attachedTask && !extra?.leaveRequest) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
      attachments,
      voiceNote,
      sticker,
      imageUrl: extra?.imageUrl,
      attachedTask: extra?.attachedTask,
      leaveRequest: extra?.leaveRequest
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));
    soundEffects.playChatSound();

    // Update last message in channels
    setChannels(prev =>
      prev.map(c =>
        c.id === channelId
          ? {
              ...c,
              lastMessage: sticker
                ? `✨ Stiker: ${sticker.text || sticker.emoji}`
                : content || (voiceNote ? '🎤 Pesan suara' : '📎 Berkas lampiran'),
              lastMessageTime: 'Baru saja'
            }
          : c
      )
    );

    // Realistic auto-reply simulation for demo if chatting with someone else
    const targetChannel = channels.find(c => c.id === channelId);
    if (targetChannel && targetChannel.type === 'direct' && targetChannel.otherUserId) {
      const colleague = users.find(u => u.id === targetChannel.otherUserId);
      if (colleague && colleague.id !== currentUser.id) {
        setTimeout(() => {
          const autoReplies = [
            `Baik Pak ${currentUser.name}, saya catat dan langsung saya tindak lanjuti! 👍`,
            `Terima kasih infonya! Saya sedang meninjau dokumennya sekarang.`,
            `Noted Pak! Nanti saya update progresnya sebelum jam istirahat.`,
            `Siap Pak ${currentUser.name}, sinkronisasi datanya sudah aman di staging.`
          ];
          const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          const replyMsg: ChatMessage = {
            id: 'msg_reply_' + Date.now(),
            channelId,
            senderId: colleague.id,
            senderName: colleague.name,
            senderAvatar: colleague.avatar,
            content: randomReply,
            createdAt: new Date().toISOString(),
            reactions: [{ emoji: '👍', userIds: [currentUser.id] }]
          };
          setMessages(m => ({
            ...m,
            [channelId]: [...(m[channelId] || []), replyMsg]
          }));
          soundEffects.playChatSound();
        }, 1200);
      }
    }
  };

  const toggleReaction = (channelId: string, messageId: string, emoji: string) => {
    setMessages(prev => {
      const list = prev[channelId] || [];
      const updatedList = list.map(msg => {
        if (msg.id !== messageId) return msg;
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        let nextReactions = [...msg.reactions];
        if (existingReaction) {
          if (existingReaction.userIds.includes(currentUser.id)) {
            const newUserIds = existingReaction.userIds.filter(id => id !== currentUser.id);
            if (newUserIds.length === 0) {
              nextReactions = nextReactions.filter(r => r.emoji !== emoji);
            } else {
              nextReactions = nextReactions.map(r =>
                r.emoji === emoji ? { ...r, userIds: newUserIds } : r
              );
            }
          } else {
            nextReactions = nextReactions.map(r =>
              r.emoji === emoji ? { ...r, userIds: [...r.userIds, currentUser.id] } : r
            );
          }
        } else {
          nextReactions.push({ emoji, userIds: [currentUser.id] });
        }
        return { ...msg, reactions: nextReactions };
      });
      return { ...prev, [channelId]: updatedList };
    });
  };

  const deleteMessage = (channelId: string, messageId: string) => {
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      const updatedMsgs = channelMsgs.filter(m => m.id !== messageId);
      
      // Synchronize last message in channels list
      setChannels(prevChans =>
        prevChans.map(c => {
          if (c.id !== channelId) return c;
          const lastMsg = updatedMsgs.length > 0 ? updatedMsgs[updatedMsgs.length - 1] : null;
          return {
            ...c,
            lastMessage: lastMsg
              ? lastMsg.sticker
                ? `✨ Stiker: ${lastMsg.sticker.text || lastMsg.sticker.emoji}`
                : lastMsg.content || (lastMsg.voiceNote ? '🎤 Pesan suara' : '📎 Berkas lampiran')
              : 'Belum ada percakapan',
            lastMessageTime: lastMsg ? 'Baru saja' : ''
          };
        })
      );

      return { ...prev, [channelId]: updatedMsgs };
    });
    addAuditLog('CHAT_DELETE_MESSAGE', 'Pesan Chat', `Menghapus pesan (${messageId}) di channel ${channelId}`);
  };

  const createChannel = (name: string, description: string, isPrivate: boolean, memberIds: string[], dept?: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: 'chn_' + Date.now(),
      name: slug,
      type: 'channel',
      description,
      isPrivate,
      memberIds: [...new Set([...memberIds, currentUser.id])],
      dept,
      unreadCount: 0,
      lastMessage: 'Channel baru dibuat.',
      lastMessageTime: 'Baru saja'
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
    addAuditLog('CHANNEL_CREATE', 'Messaging', `Membuat channel #${slug}`);
  };

  const startDirectMessage = (targetUserId: string) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;
    const existingDm = channels.find(
      c => c.type === 'direct' && c.otherUserId === targetUserId
    );
    if (existingDm) {
      setActiveChannelId(existingDm.id);
      setActiveTab('chat');
    } else {
      const newDm: Channel = {
        id: 'dm_' + targetUserId + '_' + Date.now(),
        name: targetUser.name,
        type: 'direct',
        otherUserId: targetUserId,
        memberIds: [currentUser.id, targetUserId],
        unreadCount: 0,
        lastMessage: 'Memulai percakapan langsung...',
        lastMessageTime: 'Baru saja'
      };
      setChannels(prev => [newDm, ...prev]);
      setActiveChannelId(newDm.id);
      setActiveTab('chat');
    }
  };

  // LEAVE REQUEST & APPROVAL WORKFLOW
  const submitLeaveRequest = (
    channelId: string,
    leaveData: Omit<LeaveRequest, 'id' | 'createdAt' | 'bossApproval' | 'hrApproval' | 'overallStatus'>,
    bossUser: User,
    hrUser: User
  ) => {
    const leaveId = 'leave_' + Date.now();
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: leaveId,
      createdAt: new Date().toISOString(),
      bossApproval: {
        approverId: bossUser.id,
        approverName: bossUser.name,
        approverRole: 'boss',
        approverTitle: `${bossUser.position || 'Atasan Langsung'} (${bossUser.department})`,
        approverAvatar: bossUser.avatar,
        status: 'pending'
      },
      hrApproval: {
        approverId: hrUser.id,
        approverName: hrUser.name,
        approverRole: 'hr',
        approverTitle: `${hrUser.position || 'HR Director'} (Human Resources)`,
        approverAvatar: hrUser.avatar,
        status: 'pending'
      },
      overallStatus: 'pending'
    };

    const formattedMessage = `📋 **Form Pengajuan Izin Cuti**: ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari kerja) diajukan oleh **${leaveData.requesterName}** kepada Atasan (**${bossUser.name}**) dan HR (**${hrUser.name}**).`;

    sendMessage(
      channelId,
      formattedMessage,
      leaveData.attachmentUrl
        ? [
            {
              name: leaveData.attachmentName || 'Surat_Keterangan_Cuti.pdf',
              url: leaveData.attachmentUrl,
              type: 'document',
              size: '1.2 MB'
            }
          ]
        : undefined,
      undefined,
      undefined,
      { leaveRequest: newLeave }
    );

    // Add persistent notifications to Boss and HR
    const notifBoss: NotificationItem = {
      id: 'notif_leave_boss_' + Date.now(),
      recipientId: bossUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'leave_request',
      title: 'Pengajuan Cuti Baru',
      message: `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari). Menunggu persetujuan Anda.`,
      link: channelId,
      targetTab: 'chat',
      read: false,
      createdAt: new Date().toISOString()
    };

    const notifHR: NotificationItem = {
      id: 'notif_leave_hr_' + (Date.now() + 1),
      recipientId: hrUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'leave_request',
      title: 'Pengajuan Cuti Baru',
      message: `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari). Menunggu validasi HR.`,
      link: channelId,
      targetTab: 'chat',
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notifBoss, notifHR, ...prev]);
    setLeaveApprovalToast(`Pengajuan cuti ${leaveData.leaveTypeLabel} berhasil dikirim ke ${bossUser.name} (Atasan) & ${hrUser.name} (HR)!`);
    setTimeout(() => setLeaveApprovalToast(null), 4000);

    addAuditLog('LEAVE_REQUEST', 'Human Resources', `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari kerja)`);
  };

  const processLeaveApproval = (
    channelId: string,
    messageId: string,
    approverRole: 'boss' | 'hr',
    decision: 'approved' | 'declined',
    comment?: string
  ) => {
    let bothApproved = false;
    let requesterUser: { name: string; id: string; dates: string; type: string } | null = null;
    let bossName = '';
    let hrName = '';

    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      const updatedMsgs = channelMsgs.map(msg => {
        if (msg.id !== messageId || !msg.leaveRequest) return msg;

        const currentLeave = msg.leaveRequest;
        const nowIso = new Date().toISOString();

        const updatedBoss: LeaveApproval =
          approverRole === 'boss'
            ? {
                ...currentLeave.bossApproval,
                approverId: currentUser.id,
                approverName: currentUser.name,
                approverAvatar: currentUser.avatar,
                status: decision,
                comment: comment || (decision === 'approved' ? 'Disetujui oleh Atasan Langsung' : 'Ditolak oleh Atasan'),
                timestamp: nowIso
              }
            : currentLeave.bossApproval;

        const updatedHr: LeaveApproval =
          approverRole === 'hr'
            ? {
                ...currentLeave.hrApproval,
                approverId: currentUser.id,
                approverName: currentUser.name,
                approverAvatar: currentUser.avatar,
                status: decision,
                comment: comment || (decision === 'approved' ? 'Disetujui dan diverifikasi oleh Tim HR' : 'Ditolak oleh HR'),
                timestamp: nowIso
              }
            : currentLeave.hrApproval;

        bossName = updatedBoss.approverName;
        hrName = updatedHr.approverName;
        requesterUser = {
          name: currentLeave.requesterName,
          id: currentLeave.requesterId,
          dates: `${currentLeave.startDate} s/d ${currentLeave.endDate}`,
          type: currentLeave.leaveTypeLabel
        };

        const isBossAppr = updatedBoss.status === 'approved';
        const isHrAppr = updatedHr.status === 'approved';
        const isAnyDeclined = updatedBoss.status === 'declined' || updatedHr.status === 'declined';

        let newOverall: LeaveRequest['overallStatus'] = 'pending';
        if (isAnyDeclined) {
          newOverall = 'declined';
        } else if (isBossAppr && isHrAppr) {
          newOverall = 'fully_approved';
          bothApproved = true;
        } else if (isBossAppr) {
          newOverall = 'boss_approved';
        } else if (isHrAppr) {
          newOverall = 'hr_approved';
        }

        return {
          ...msg,
          leaveRequest: {
            ...currentLeave,
            bossApproval: updatedBoss,
            hrApproval: updatedHr,
            overallStatus: newOverall
          }
        };
      });

      return {
        ...prev,
        [channelId]: updatedMsgs
      };
    });

    // If both approved, trigger celebration effects and notifications
    if (bothApproved && requesterUser) {
      try {
        confetti({ particleCount: 90, spread: 85, origin: { y: 0.55 } });
      } catch {}

      const celebrationToastMsg = `🎉 CUTI TELAH DISETUJUI! Pengajuan cuti ${(requesterUser as any).name} (${(requesterUser as any).dates}) resmi disetujui penuh oleh Atasan (${bossName}) dan HR (${hrName}).`;
      setLeaveApprovalToast(celebrationToastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 8000);

      // Add persistent Notification
      const approvalNotif: NotificationItem = {
        id: 'notif_leave_approved_' + Date.now(),
        recipientId: (requesterUser as any).id,
        senderId: currentUser.id,
        senderName: 'Sistem HR & Atasan',
        type: 'leave_request',
        title: '🎉 Cuti Telah Disetujui!',
        message: `Pengajuan ${(requesterUser as any).type} Anda (${(requesterUser as any).dates}) telah DISETUJUI PENUH oleh Atasan (${bossName}) dan HR (${hrName}).`,
        link: channelId,
        targetTab: 'chat',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [approvalNotif, ...prev]);

      // System notification message into chat channel
      setTimeout(() => {
        sendMessage(
          channelId,
          `🎉 **NOTIFIKASI RESMI: CUTI TELAH DISETUJUI!**\n\nPengajuan cuti atas nama **${(requesterUser as any)?.name}** untuk periode **${(requesterUser as any)?.dates}** telah **DISETUJUI SECARA RESMI OLEH ATASAN DAN HR**:\n• Atasan Langsung: **${bossName}** (Disetujui ✓)\n• Tim HR: **${hrName}** (Disetujui ✓)\n\nHak cuti telah tercatat dan status kerja karyawan otomatis disinkronkan ke kalender tim.`
        );
      }, 500);

      addAuditLog('LEAVE_APPROVED_FULL', 'Human Resources', `Pengajuan cuti ${(requesterUser as any).name} disetujui penuh oleh Atasan (${bossName}) dan HR (${hrName})`);
    } else if (decision === 'approved') {
      const toastMsg =
        approverRole === 'boss'
          ? `✓ Pengajuan cuti telah disetujui oleh Atasan (${currentUser.name})! Menunggu validasi tim HR.`
          : `✓ Pengajuan cuti telah diverifikasi & disetujui oleh HR (${currentUser.name})! Menunggu persetujuan Atasan.`;
      setLeaveApprovalToast(toastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 5000);
    } else if (decision === 'declined') {
      const toastMsg = `Pengajuan cuti ditolak oleh ${approverRole === 'boss' ? 'Atasan' : 'HR'} (${currentUser.name}).`;
      setLeaveApprovalToast(toastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 5000);
    }
  };

  const updateChannelSettings = (channelId: string, updates: Partial<Channel>) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId ? { ...c, ...updates } : c))
    );
    addAuditLog('CHANNEL_UPDATE', 'Pengaturan Grup/Channel', `Memperbarui konfigurasi grup/channel ${channelId}`);
  };

  const toggleStarChannel = (channelId: string) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  const togglePinMessage = (channelId: string, messageId: string) => {
    // 1. Toggle pin on message
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map(m =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        )
      };
    });

    // 2. Sync pinnedMessageIds on channel
    setChannels(prev =>
      prev.map(c => {
        if (c.id !== channelId) return c;
        const currentPins = c.pinnedMessageIds || [];
        const isAlreadyPinned = currentPins.includes(messageId);
        return {
          ...c,
          pinnedMessageIds: isAlreadyPinned
            ? currentPins.filter(id => id !== messageId)
            : [...currentPins, messageId]
        };
      })
    );
  };

  const toggleStarMessage = (channelId: string, messageId: string) => {
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map(m =>
          m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
        )
      };
    });
  };

  // MEETING ACTIONS
  const createMeeting = (
    data: Omit<Meeting, 'id' | 'createdAt' | 'actionItems'> & { actionItemsText?: string[] }
  ) => {
    const newMeet: Meeting = {
      ...data,
      id: 'meet_' + Date.now(),
      createdAt: new Date().toISOString(),
      actionItems: (data.actionItemsText || []).map((text, idx) => ({
        id: 'ai_' + Date.now() + '_' + idx,
        text,
        isConvertedToTask: false
      }))
    };
    setMeetings(prev => [newMeet, ...prev]);
    addAuditLog('MEETING_CREATE', 'Meeting & Schedule', `Menjadwalkan meeting: "${newMeet.title}"`);
  };

  const updateMeeting = (updated: Meeting) => {
    setMeetings(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const convertActionItemToTask = (meetingId: string, actionItemId: string) => {
    const targetMeeting = meetings.find(m => m.id === meetingId);
    if (!targetMeeting) return;
    const item = targetMeeting.actionItems.find(ai => ai.id === actionItemId);
    if (!item || item.isConvertedToTask) return;

    // Create task from action item
    const newTask: Task = {
      id: 'tsk_ai_' + Date.now(),
      title: item.text,
      description: `Berasal dari Action Item rapat "${targetMeeting.title}" pada ${targetMeeting.date}.`,
      status: 'todo',
      priority: 'high',
      assigneeId: item.assigneeId || currentUser.id,
      assigneeName: item.assigneeName || currentUser.name,
      assigneeAvatar: currentUser.avatar,
      assigneeDept: currentUser.department,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      project: targetMeeting.title,
      deadline: targetMeeting.date,
      labels: ['ActionItem', 'MeetingFollowUp'],
      checklists: [{ id: 'chk_ai_1', text: 'Tindak lanjut poin aksi meeting', completed: false }],
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Dikonversi otomatis dari Action Item meeting',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    // Mark action item as converted
    setMeetings(prev =>
      prev.map(m => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map(ai =>
            ai.id === actionItemId ? { ...ai, isConvertedToTask: true, taskId: newTask.id } : ai
          )
        };
      })
    );

    addAuditLog('ACTION_ITEM_TO_TASK', 'Meeting', `Action item "${item.text}" dikonversi menjadi task.`);
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  // DOCUMENT ACTIONS
  const uploadDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'downloadsCount' | 'isStarred'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: 'doc_' + Date.now(),
      downloadsCount: 0,
      isStarred: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('DOC_UPLOAD', 'Document Center', `Mengunggah dokumen: "${newDoc.title}" (${newDoc.category})`);
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
    addAuditLog('DOC_DELETE', 'Document Center', `Menghapus dokumen ${documentId}`);
  };

  const toggleStarDoc = (documentId: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === documentId ? { ...d, isStarred: !d.isStarred } : d))
    );
  };

  const recordDocDownload = (documentId: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === documentId ? { ...d, downloadsCount: d.downloadsCount + 1 } : d))
    );
  };

  // BRAND GOOGLE DRIVE DIRECTORY ACTIONS
  const addBrandDriveFolder = (folderData: Omit<BrandDriveFolder, 'id' | 'lastUpdated'>) => {
    const newFolder: BrandDriveFolder = {
      ...folderData,
      id: 'bdf_' + Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setBrandDriveFolders(prev => [newFolder, ...prev]);
    addAuditLog('DRIVE_FOLDER_ADD', 'Brand Google Drive', `Menambahkan direktori master folder: "${newFolder.folderTitle}"`);
  };

  const updateBrandDriveFolder = (folder: BrandDriveFolder) => {
    setBrandDriveFolders(prev =>
      prev.map(f => (f.id === folder.id ? { ...folder, lastUpdated: new Date().toISOString().split('T')[0] } : f))
    );
    addAuditLog('DRIVE_FOLDER_UPDATE', 'Brand Google Drive', `Memperbarui folder: "${folder.folderTitle}"`);
  };

  const deleteBrandDriveFolder = (id: string) => {
    setBrandDriveFolders(prev => prev.filter(f => f.id !== id));
    addAuditLog('DRIVE_FOLDER_DELETE', 'Brand Google Drive', `Menghapus master folder ${id}`);
  };

  const toggleStarBrandDriveFolder = (id: string) => {
    setBrandDriveFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, isStarred: !f.isStarred } : f))
    );
  };

  // MANAGED BRANDS (LABEL MANAGEMENT) ACTIONS
  const addManagedBrand = (brandData: Omit<ManagedBrand, 'id' | 'createdAt'>) => {
    const newBrand: ManagedBrand = {
      ...brandData,
      id: 'brand_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setManagedBrands(prev => [...prev, newBrand]);
    addAuditLog('BRAND_ADD', 'Label Management', `Menambahkan label brand: "${newBrand.name}"`);
    addNotification({
      type: 'system',
      title: 'Brand Baru Ditambahkan',
      message: `Label brand ${newBrand.name} berhasil didaftarkan ke sistem.`,
      recipientId: currentUser.id
    });
  };

  const updateManagedBrand = (id: string, updates: Partial<ManagedBrand>) => {
    setManagedBrands(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
    addAuditLog('BRAND_UPDATE', 'Label Management', `Memperbarui konfigurasi label brand ${id}`);
  };

  const deleteManagedBrand = (id: string) => {
    const target = managedBrands.find(b => b.id === id);
    setManagedBrands(prev => prev.filter(b => b.id !== id));
    addAuditLog('BRAND_DELETE', 'Label Management', `Menghapus label brand: "${target?.name || id}"`);
  };

  // NOTIFICATION ACTIONS
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    soundEffects.playNotificationSound();
  };

  // SOUND CONTROLS & TESTER
  const toggleSound = () => {
    const nextUnmuted = soundEffects.toggleMute();
    setIsSoundMuted(!nextUnmuted);
  };

  const setSoundMuted = (muted: boolean) => {
    soundEffects.setMuted(muted);
    setIsSoundMuted(muted);
  };

  const playTestSound = (type?: 'notification' | 'chat' | 'phone' | 'task') => {
    switch (type || 'notification') {
      case 'notification':
        soundEffects.playNotificationSound();
        break;
      case 'chat':
        soundEffects.playChatSound();
        break;
      case 'phone':
        soundEffects.playPhoneRingSound(5);
        break;
      case 'task':
        soundEffects.playNewTaskSound();
        break;
    }
  };

  // CROSS-DIVISION TASK REQUESTS (Permintaan Tugas Antar Divisi)
  const createDivisionRequest = (data: Omit<DivisionTaskRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: DivisionTaskRequest = {
      ...data,
      id: 'req_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setDivisionRequests(prev => [newReq, ...prev]);
    soundEffects.playNewTaskSound();

    // Send notification to target division or assignee
    addNotification({
      recipientId: data.targetAssigneeId || 'dept_' + data.targetDept,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'task',
      title: `Permintaan Tugas Baru dari ${data.requestorDept}`,
      message: `${currentUser.name} mengajukan: "${data.title}" (Tenggat: ${data.deadline})`,
      link: 'requests',
      targetTab: 'requests'
    });

    addAuditLog('DIVISION_REQ_CREATE', 'Request Antar Divisi', `Membuat request "${newReq.title}" dari ${newReq.requestorDept} ke ${newReq.targetDept}`);
  };

  const acceptDivisionRequest = (requestId: string) => {
    const targetReq = divisionRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const newTaskId = 'tsk_' + Date.now();
    const newTask: Task = {
      id: newTaskId,
      title: `[${targetReq.requestorDept}] ${targetReq.title}`,
      description: targetReq.description,
      status: 'todo', // Langsung masuk ke To-Do Board!
      priority: targetReq.priority,
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar,
      assigneeDept: targetReq.targetDept,
      reporterId: targetReq.requestorId,
      reporterName: targetReq.requestorName,
      project: `Kolaborasi ${targetReq.requestorDept} ➔ ${targetReq.targetDept}`,
      deadline: targetReq.deadline,
      labels: ['Antar-Divisi', targetReq.requestorDept],
      checklists: [
        { id: 'cl_1', text: 'Tinjau brief & spesifikasi kebutuhan', completed: true },
        { id: 'cl_2', text: 'Kerjakan deliverable sesuai tenggat waktu', completed: false },
        { id: 'cl_3', text: 'Kirimkan hasil kerja ke pemohon', completed: false }
      ],
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Menerima request antar divisi dari ${targetReq.requestorName} dan memasukkan ke To-Do`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    setDivisionRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'accepted',
              acceptedBy: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                acceptedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                createdTaskId: newTaskId
              }
            }
          : r
      )
    );

    soundEffects.playNewTaskSound();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Send confirmation notification to requestor
    addNotification({
      recipientId: targetReq.requestorId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'task',
      title: 'Permintaan Diterima! Masuk To-Do',
      message: `${currentUser.name} (${currentUser.department}) telah menerima "${targetReq.title}" dan memasukkannya ke To-Do board.`,
      link: 'tasks',
      targetTab: 'tasks'
    });

    addAuditLog('DIVISION_REQ_ACCEPT', 'Request Antar Divisi', `${currentUser.name} menerima request "${targetReq.title}" dari ${targetReq.requestorName} dan memasukkan ke To-Do`);
  };

  const declineDivisionRequest = (requestId: string, reason?: string) => {
    setDivisionRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'declined', declinedReason: reason || 'Kapasitas divisi sedang penuh' }
          : r
      )
    );
    addAuditLog('DIVISION_REQ_DECLINE', 'Request Antar Divisi', `Menolak request ${requestId}: ${reason || ''}`);
  };

  // USER & ROLE MANAGEMENT
  const updateUserRole = (userId: string, role: UserRole) => {
    // 1. Only Super Admin can change user roles
    if (currentUser.role !== 'super_admin') {
      console.warn('Hanya Super Admin yang berwenang mengubah hak akses peran karyawan.');
      return;
    }

    setUsers(prev => {
      const targetUser = prev.find(u => u.id === userId);
      if (!targetUser) return prev;

      // Aturan Sakral: Titel Super Admin tidak boleh kosong.
      // Jika tinggal 1 Super Admin, role tidak bisa diubah/diturunkan.
      const currentSuperAdmins = prev.filter(u => u.role === 'super_admin');
      if (targetUser.role === 'super_admin' && currentSuperAdmins.length <= 1 && role !== 'super_admin') {
        alert('Aturan Sakral: Titel Super Admin tidak boleh kosong! Tinggal 1 akun Super Admin, role tidak dapat diturunkan.');
        return prev;
      }

      let updatedUsers = prev.map(u => (u.id === userId ? { ...u, role } : u));

      // 2. Rule: Super Admin harus selalu ada.
      // Jika seandainya superadmin ganti/diturunkan, otomatis title super admin bakal pindah ke akun yang paling lama bergabung.
      const hasSuperAdmin = updatedUsers.some(u => u.role === 'super_admin');
      if (!hasSuperAdmin) {
        const candidates = updatedUsers.filter(u => u.id !== userId);
        const pool = candidates.length > 0 ? candidates : updatedUsers;
        const sortedOldest = [...pool].sort((a, b) => {
          const dateA = new Date(a.joinedDate || '2099-01-01').getTime();
          const dateB = new Date(b.joinedDate || '2099-01-01').getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.id.localeCompare(b.id);
        });

        const oldestUser = sortedOldest[0];
        if (oldestUser) {
          updatedUsers = updatedUsers.map(u =>
            u.id === oldestUser.id ? { ...u, role: 'super_admin' as UserRole } : u
          );
          addAuditLog(
            'SUPER_ADMIN_AUTO_TRANSFER',
            'Admin RBAC',
            `Gelar Super Admin otomatis dialihkan ke akun karyawan tertua: ${oldestUser.name} (${oldestUser.email}, bergabung ${oldestUser.joinedDate}) karena Super Admin sebelumnya diturunkan.`
          );
        }
      }

      // Sync currentUser if updated
      const currentUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (currentUpdated) {
        setCurrentUserState(currentUpdated);
      }

      return updatedUsers;
    });

    addAuditLog('USER_ROLE_CHANGE', 'Admin RBAC', `Mengubah wewenang role user ${userId} menjadi ${role}`);
  };

  const updateUserStatus = (status: AvailabilityStatus) => {
    setCurrentUserState(prev => ({ ...prev, status }));
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, status } : u))
    );
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    // Aturan Sakral: Yang bisa edit data/foto diri karyawan hanya karyawan itu sendiri!
    if (currentUser.id !== userId) {
      alert('Aturan Sakral: Data diri dan foto pribadi karyawan hanya dapat diubah oleh pemilik akun bersangkutan!');
      return;
    }

    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser.id === userId) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
    addAuditLog('USER_UPDATE', 'Profil Karyawan', `Memperbarui data pribadi/foto profil karyawan ${userId}`);
  };

  const toggleUserActiveStatus = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Aturan Sakral: Titel Super Admin tidak boleh kosong!
    const activeSuperAdmins = users.filter(u => u.role === 'super_admin' && !u.isDeactivated);
    if (targetUser.role === 'super_admin' && !targetUser.isDeactivated && activeSuperAdmins.length <= 1) {
      alert('Aturan Sakral: Titel Super Admin tidak meperbolehkan Super Admin kosong! Akun Super Admin terakhir tidak dapat dinonaktifkan.');
      return;
    }

    const nextStatus = !targetUser.isDeactivated;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isDeactivated: nextStatus } : u)));
    addAuditLog(
      'USER_TOGGLE_ACTIVE',
      'Admin RBAC',
      `Mengubah status akun ${targetUser.name} (${targetUser.email}) menjadi ${nextStatus ? 'Nonaktif' : 'Aktif'}`
    );
  };



  const deleteUser = (userId: string) => {
    // 1. Minimum user safety: cannot delete if only 1 user left
    if (users.length <= 1) {
      console.warn('Tidak dapat menghapus personel terakhir di sistem.');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    const superAdminCount = users.filter(u => u.role === 'super_admin').length;
    if (targetUser?.role === 'super_admin' && superAdminCount <= 1) {
      alert('Aturan Sakral: Titel Super Admin tidak boleh kosong! Akun Super Admin terakhir tidak dapat dihapus.');
      return;
    }

    setUsers(prev => {
      const targetUser = prev.find(u => u.id === userId);
      if (!targetUser) return prev;

      let remainingUsers = prev.filter(u => u.id !== userId);

      const hasSuperAdmin = remainingUsers.some(u => u.role === 'super_admin');
      if (!hasSuperAdmin) {
        const sortedOldest = [...remainingUsers].sort((a, b) => {
          const dateA = new Date(a.joinedDate || '2099-01-01').getTime();
          const dateB = new Date(b.joinedDate || '2099-01-01').getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.id.localeCompare(b.id);
        });

        const oldestUser = sortedOldest[0];
        if (oldestUser) {
          remainingUsers = remainingUsers.map(u =>
            u.id === oldestUser.id ? { ...u, role: 'super_admin' as UserRole } : u
          );
          addAuditLog(
            'SUPER_ADMIN_AUTO_TRANSFER',
            'Manajemen Akses',
            `Hak Super Admin dialihkan otomatis ke ${oldestUser.name} (${oldestUser.email}).`
          );
        }
      }

      if (currentUser.id === userId) {
        const nextActive = remainingUsers.find(u => u.role === 'super_admin') || remainingUsers[0];
        setCurrentUserState(nextActive);
      }

      return remainingUsers;
    });

    addAuditLog('USER_DELETE', 'Manajemen Personel', `Menghapus akun personel ID: ${userId}`);
  };

  const inviteUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    position: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
  }): User => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role || 'employee',
      department: userData.department,
      position: userData.position.trim(),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      phone: userData.phone?.trim() || '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: userData.location?.trim() || 'Kantor Pusat - Jakarta',
      status: 'online',
      bio: userData.bio?.trim() || `Personel divisi ${userData.department}.`,
      skills: userData.skills?.length ? userData.skills : ['Kolaborasi', 'Manajemen Proyek'],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);

    // System notification
    const inviteNotif: NotificationItem = {
      id: 'notif_invite_' + Date.now(),
      recipientId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: 'system',
      title: 'Personel Baru Terdaftar',
      message: `${newUser.name} resmi terdaftar sebagai ${newUser.position} di divisi ${newUser.department}.`,
      link: 'directory',
      targetTab: 'directory',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [inviteNotif, ...prev]);

    addAuditLog('USER_INVITE', 'Manajemen Personel', `Mendaftarkan personel baru: ${newUser.name} (${newUser.position} - ${newUser.department})`);

    return newUser;
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setPosts(INITIAL_POSTS);
    setTasks(INITIAL_TASKS);
    setChannels(INITIAL_CHANNELS);
    setMessages(INITIAL_MESSAGES);
    setMeetings(INITIAL_MEETINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    window.location.reload();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        activeTab,
        setActiveTab,
        themeSettings,
        updateThemeSettings,
        themeMode: themeSettings.mode,
        toggleTheme,
        setThemeMode,
        workspaceInfo,
        updateWorkspaceInfo,
        isAuthenticated,
        login,
        logout,
        registerUser,
        updateUser,
        isRightNotificationOpen,
        setIsRightNotificationOpen,
        toggleRightNotifications,
        posts,
        createPost,
        likePost,
        reactToPost,
        bookmarkPost,
        addComment,
        votePoll,
        togglePinPost,
        deletePost,
        tasks,
        setTasks,
        selectedTaskGroup,
        setSelectedTaskGroup,
        createTask,
        updateTask,
        moveTaskStatus,
        toggleChecklistItem,
        toggleTaskCheckpoint,
        addTaskCheckpoint,
        addTaskReport,
        addTaskComment,
        deleteTask,
        updateTaskBriefFormat,
        updateTaskVideoDraft,
        updateTaskSlideDraft,
        updateTaskPosterDraft,
        sendTaskForApproval,
        processTaskApproval,
        archiveTask,
        unarchiveTask,
        activeHuddle,
        startHuddle,
        endHuddle,
        toggleHuddleMinimize,
        toggleHuddleMic,
        toggleHuddleVideo,
        toggleHuddleScreenShare,
        toggleHuddleRecording,
        sendHuddleReaction,
        channels,
        activeChannelId,
        setActiveChannelId,
        markChannelAsRead,
        messages,
        sendMessage,
        toggleReaction,
        createChannel,
        updateChannelSettings,
        toggleStarChannel,
        togglePinMessage,
        toggleStarMessage,
        deleteMessage,
        startDirectMessage,
        submitLeaveRequest,
        processLeaveApproval,
        leaveApprovalToast,
        setLeaveApprovalToast,
        meetings,
        createMeeting,
        updateMeeting,
        convertActionItemToTask,
        deleteMeeting,
        documents,
        uploadDocument,
        deleteDocument,
        toggleStarDoc,
        recordDocDownload,
        brandDriveFolders,
        addBrandDriveFolder,
        updateBrandDriveFolder,
        deleteBrandDriveFolder,
        toggleStarBrandDriveFolder,
        managedBrands,
        addManagedBrand,
        updateManagedBrand,
        deleteManagedBrand,
        isBrandModalOpen,
        setIsBrandModalOpen,
        editingBrand,
        setEditingBrand,
        divisions,
        addDivision,
        deleteDivision,
        updateDivision,
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadNotificationsCount,
        updateUserRole,
        updateUserStatus,
        toggleUserActiveStatus,
        deleteUser,
        inviteUser,
        auditLogs,
        addAuditLog,
        isQuickSearchOpen,
        setIsQuickSearchOpen,
        quickActionModal,
        setQuickActionModal,
        resetAllData,
        isDbHubOpen,
        setIsDbHubOpen,
        resetToInitialCorporateData: resetAllData,
        isSoundMuted,
        toggleSound,
        setSoundMuted,
        playTestSound,
        addNotification,
        divisionRequests,
        createDivisionRequest,
        acceptDivisionRequest,
        declineDivisionRequest,
        pendingApprovals,
        submitUserApprovalRequest,
        approveUserRegistration,
        rejectUserRegistration,
        customStickers,
        addCustomSticker,
        openEmployeeProfileByName,
        // Advanced Automation Mode
        automationConfigs,
        updateDivisionAutomationConfig,
        toggleDivisionAdvancedMode,
        runWeeklyGeneration,
        runAutoArchive,
        restoreTaskFromArchive,
        automationHistory,
        automationToast,
        setAutomationToast,
        selectedDirectoryUserId,
        setSelectedDirectoryUserId
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

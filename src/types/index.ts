export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee';

export type AvailabilityStatus = 'online' | 'busy' | 'away' | 'in_meeting' | 'offline';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: UserRole;
  department: string;
  position: string;
  phone: string;
  location: string;
  status: AvailabilityStatus;
  bio?: string;
  skills?: string[];
  managerId?: string;
  directReports?: string[];
  joinedDate: string;
  isDeactivated?: boolean;
  employeeId?: string;
  nickname?: string;
  employmentType?: 'Full-time' | 'Contract' | 'Probation' | 'Intern' | 'Freelance';
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface PendingUserApproval {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  department: string;
  position: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  nickname?: string;
  birthDate?: string;
  employeeId?: string;
  location?: string;
  employmentType?: 'Full-time' | 'Contract' | 'Probation' | 'Intern' | 'Freelance';
  phone?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export type PostType = 'standard' | 'announcement' | 'poll';

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs who voted
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: string[];
  parentId?: string;
  replyToName?: string;
  stickerUrl?: string;
  gifUrl?: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document' | 'archive';
  size: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  authorDept: string;
  content: string;
  type: PostType;
  pollOptions?: PollOption[];
  attachments?: Attachment[];
  likes: string[]; // user IDs
  reactions?: { emoji: string; userIds: string[] }[];
  bookmarks: string[];
  reposts: string[];
  comments: Comment[];
  tags: string[];
  category: 'general' | 'announcements' | 'tech' | 'hr' | 'culture';
  isPinned?: boolean;
  createdAt: string;
}

export type TaskStatus =
  | 'not_started'
  | 'on_progress'
  | 'on_review'
  | 'done'
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface TaskCheckpoint {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  targetDate?: string;
}

export interface TaskReportItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  type: 'progress_update' | 'blocker' | 'note';
  content: string;
  createdAt: string;
}

export type CreativeBriefFormat = 'scenes' | 'slides' | 'poster';

export interface VideoDraftScene {
  id: string;
  sceneNumber: number; // 1 to 7+
  title: string;
  visualDirection: string;
  audioScript: string;
  durationText?: string; // e.g. "00:05"
  referenceImageUrl?: string;
  googleLinks?: {
    type: 'drive' | 'docs' | 'sheets' | 'youtube' | 'figma' | 'other';
    title: string;
    url: string;
  }[];
}

export interface SlideDraftItem {
  id: string;
  slideNumber: number;
  title: string;
  headline: string;
  bodyContent: string;
  visualLayout: string;
  speakerNotes?: string;
  referenceImageUrl?: string;
  googleLinks?: {
    type: 'drive' | 'docs' | 'sheets' | 'youtube' | 'figma' | 'other';
    title: string;
    url: string;
  }[];
}

export interface PosterDraftItem {
  dimensions: string; // e.g. "1080 x 1350 px (Instagram Portrait)" or "A3 Print"
  selectedSizes?: string[]; // e.g. ['A4', 'A3', 'Square 1:1']
  customWidth?: number;
  customHeight?: number;
  customUnit?: 'm' | 'cm' | 'mm' | 'px';
  headline: string;
  subheadline: string;
  bodyCopy: string;
  visualComposition: string;
  callToAction: string;
  referenceImageUrl?: string;
  googleLinks?: {
    type: 'drive' | 'docs' | 'sheets' | 'youtube' | 'figma' | 'other';
    title: string;
    url: string;
  }[];
}

export interface TaskApproval {
  id: string;
  managerId: string;
  managerName: string;
  managerRole?: string;
  managerAvatar?: string;
  status: 'pending' | 'approved' | 'declined';
  comment?: string;
  timestamp?: string;
}

export interface TaskApprovalRequest {
  targetChannelId?: string;
  targetChannelName?: string;
  targetGroupId?: string;
  requestedAt: string;
  requestedBy: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'declined';
  requiredApprovals: TaskApproval[];
}

export interface HuddleParticipant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  isScreenSharing?: boolean;
}

export interface ActiveHuddle {
  id: string;
  title: string;
  type: 'channel' | 'direct' | 'division';
  targetId: string;
  startedAt: string;
  participants: HuddleParticipant[];
  isMinimized: boolean;
  isVoiceOnly?: boolean;
  isRecording?: boolean;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar: string;
  dept?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  titleFontWeight?: 'bold' | 'regular';
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  brand?: string; // Brand label e.g. 'Asli RI', 'Movadex', 'Finova'
  brandId?: string; // ID of ManagedBrand
  brandLogo?: string; // Cached or direct logo URL / base64
  brandColor?: string; // Cached brand accent hex
  requestorId?: string; // User ID who requested the task
  requestorName?: string;
  requestorAvatar?: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  assigneeDept: string;
  assignees?: TaskAssignee[]; // Multiple select assignees from division
  reporterId: string;
  reporterName: string;
  project?: string;
  groupId?: string; // Department / Group ID e.g. 'tech', 'product', 'hr', 'marketing', 'finance'
  groupName?: string;
  deadline: string;
  startDate?: string;
  progressPercent?: number;
  letterIndex?: string; // e.g. 'A', 'B', 'C', 'D' for Gantt visualization matching ref
  labels: string[];
  checklists: ChecklistItem[];
  checkpoints?: TaskCheckpoint[]; // Key milestones to track where project is
  reports?: TaskReportItem[]; // Progress notes, blocker reports, chats on task
  briefFormat?: CreativeBriefFormat; // 'scenes' | 'slides' | 'poster'
  videoDraftScenes?: VideoDraftScene[]; // Storyboard & scene breakdown (Scene 1-7)
  slideDraftItems?: SlideDraftItem[]; // Carousel & presentation deck slides
  posterDraftItem?: PosterDraftItem; // Single key visual / banner / poster brief
  approvalRequest?: TaskApprovalRequest; // Manager approval workflow
  attachments?: Attachment[];
  comments: TaskComment[];
  activity: TaskActivity[];
  estimatedHours?: number;
  completedAt?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archiveFolder?: string; // e.g. "November 2026"
  taskCode?: string; // e.g. "CT-0427"
  contentType?: string; // e.g. "Regular", "Video", "Design"
  category?: string; // e.g. "Design", "Video", "Copywriting"
  publishDate?: string; // e.g. "15 Nov 2026"
  briefDeadline?: string; // e.g. "13 Nov"
  designDeadline?: string; // e.g. "14 Nov"
  generatedByAutomation?: boolean;
  automationWeek?: string; // e.g. "2026-W45-marketing"
  workflowSteps?: TaskWorkflowStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface TaskWorkflowStep {
  id: string;
  name: string; // e.g. "Content Brief", "Design Production", "Final Approval", "Completed"
  description?: string;
  status: 'waiting' | 'in_progress' | 'pending_approval' | 'revision_requested' | 'approved' | 'completed';
  assigneeName?: string;
  assigneeRole?: string;
  assigneeAvatar?: string;
  deadline?: string;
  submittedDate?: string;
  hasBrief?: boolean;
  hasDeliverable?: boolean;
  // Step 1: Content Brief approval request & approver
  briefApprover?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    groupName?: string;
    requestedAt?: string;
    note?: string;
  };
  briefApprovalStatus?: 'idle' | 'pending' | 'approved' | 'revision';
  briefRevisionNote?: string;
  // Step 2: Design Production submitted link
  submittedLink?: string;
  submittedLinkType?: 'figma' | 'drive' | 'canva' | 'other';
  submittedLinkAt?: string;
  // Step 3: Dual Final Approvals (Creative Lead & Content Lead)
  creativeLeadApproval?: {
    reviewerName: string;
    reviewerRole: string;
    reviewerAvatar: string;
    status: 'pending' | 'approved' | 'revision';
    reviewedAt?: string;
    note?: string;
  };
  contentLeadApproval?: {
    reviewerName: string;
    reviewerRole: string;
    reviewerAvatar: string;
    status: 'pending' | 'approved' | 'revision';
    reviewedAt?: string;
    note?: string;
  };
}

export interface BrandQuotaConfig {
  brandId: string;
  brandName: string;
  weeklyCount: number;
  enabled: boolean;
  contentType: string; // default 'Regular'
  category: string; // default 'Design'
  color?: string;
  logo?: string;
  defaultAssigneeName?: string;
  defaultAssigneeRole?: string;
  defaultAssigneeAvatar?: string;
}

export interface CardTemplateWorkflowItem {
  id: string;
  name: string;
  description: string;
  defaultRole: string;
  deadlineOffsetDays: number;
}

export interface DivisionAutomationConfig {
  divisionId: string;
  divisionName: string;
  isAdvancedModeEnabled: boolean;
  generateSchedule: {
    enabled: boolean;
    dayOfWeek: number; // 1 = Monday
    timeWIB: string; // "09:00"
  };
  archiveSchedule: {
    enabled: boolean;
    dayOfWeek: number; // 5 = Friday
    timeWIB: string; // "23:00"
  };
  brands: BrandQuotaConfig[];
  cardTemplate: {
    defaultContentType: string;
    defaultCategory: string;
    defaultPriority: TaskPriority;
    publishDayOffset: number;
    briefDeadlineOffset: number;
    designDeadlineOffset: number;
    titleTemplate: string;
    workflowSteps: CardTemplateWorkflowItem[];
  };
  lastRunGenerateWeek?: string;
  lastRunGenerateAt?: string;
  lastRunArchiveAt?: string;
  updatedAt: string;
}

export interface AutomationHistoryLog {
  id: string;
  divisionId: string;
  divisionName: string;
  type: 'weekly_generation' | 'auto_archive';
  status: 'success' | 'skipped_duplicate' | 'failed';
  timestampWIB: string;
  tasksAffected: number;
  details: string;
  triggeredBy: 'cron_scheduler' | 'manual_admin';
  createdTaskIds?: string[];
  archivedTaskIds?: string[];
}

export type ChannelType = 'channel' | 'direct';

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface StickerData {
  id: string;
  text?: string;
  emoji?: string;
  imageUrl?: string;
  type?: 'badge' | 'custom_photo';
  style?: 'neon' | 'gold' | 'stamp' | 'emerald' | 'cyan' | 'bubble' | 'custom_photo';
  authorName?: string;
}

export type LeaveType =
  | 'cuti_tahunan'
  | 'cuti_sakit'
  | 'cuti_alasan_penting'
  | 'cuti_melahirkan'
  | 'izin_khusus';

export interface LeaveApproval {
  approverId: string;
  approverName: string;
  approverRole: 'boss' | 'hr';
  approverTitle: string;
  approverAvatar?: string;
  status: 'pending' | 'approved' | 'declined';
  comment?: string;
  timestamp?: string;
}

export interface LeaveRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterDept: string;
  requesterPosition: string;
  leaveType: LeaveType;
  leaveTypeLabel: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
  bossApproval: LeaveApproval;
  hrApproval: LeaveApproval;
  overallStatus: 'pending' | 'boss_approved' | 'hr_approved' | 'fully_approved' | 'declined';
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  replyToId?: string;
  replyToText?: string;
  reactions: Reaction[];
  attachments?: Attachment[];
  imageUrl?: string;
  attachedTask?: Task;
  leaveRequest?: LeaveRequest;
  isPinned?: boolean;
  isStarred?: boolean;
  voiceNote?: {
    duration: string;
    url: string;
  };
  sticker?: StickerData;
  isSystem?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  isPrivate?: boolean;
  avatar?: string;
  coverUrl?: string;
  isStarred?: boolean;
  pinnedMessageIds?: string[];
  memberIds: string[];
  dept?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  otherUserId?: string; // For 1-on-1 direct messages
}

export interface BrandDriveFolder {
  id: string;
  brandName: string;
  brandCode: string;
  folderTitle: string;
  description: string;
  category: 'creative_assets' | 'campaigns' | 'raw_footage' | 'brand_guidelines' | 'finance_legal';
  color: string;
  googleDriveUrl: string;
  itemCount: number;
  storageUsed: string;
  lastUpdated: string;
  managerName: string;
  managerAvatar: string;
  tags: string[];
  isStarred?: boolean;
}

export interface ManagedBrand {
  id: string;
  name: string;
  code?: string;
  logo?: string; // Image URL or Base64 data URL
  color: string; // Brand accent/badge color e.g. '#dc2626'
  category?: string; // e.g. 'Identity & Biometrics', 'Fintech', 'Creative Agency'
  description?: string;
  website?: string;
  isDefault?: boolean;
  createdAt: string;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ActionItem {
  id: string;
  text: string;
  assigneeName?: string;
  assigneeId?: string;
  isConvertedToTask?: boolean;
  taskId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  meetLink?: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar: string;
  attendees: {
    userId: string;
    name: string;
    avatar: string;
    role: string;
    status: 'accepted' | 'tentative' | 'declined';
  }[];
  agenda: string[];
  notes?: string;
  actionItems: ActionItem[];
  status: MeetingStatus;
  department?: string;
  createdAt: string;
}

export type DocCategory = 'sop' | 'guideline' | 'architecture' | 'handbook' | 'template' | 'legal';
export type DocAccessRole = 'all' | 'manager' | 'admin';

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  category: DocCategory;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip';
  version: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderAvatar: string;
  accessRole: DocAccessRole;
  isStarred: boolean;
  downloadsCount: number;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  contentPreview?: string;
}

export type NotificationType = 'chat' | 'mention' | 'task' | 'meeting' | 'announcement' | 'leave_request' | 'system';

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  targetTab?: string;
  read: boolean;
  createdAt: string;
}

export type AccentColor = 'navy-crimson' | 'royal-blue' | 'emerald' | 'purple' | 'amber';
export type CardRadius = 'sharp' | 'rounded' | 'smooth' | 'pill';
export type BackgroundPattern = 'clean' | 'dots' | 'mesh' | 'grid' | 'aurora-glow' | 'solid' | 'gradient';

export interface DivisionItem {
  id: string;
  name: string;
  departmentMatch: string;
  leadName: string;
  leadRole: string;
  leadAvatar: string;
  color: string;
  bannerGradient: string;
  description: string;
  createdAt?: string;
}

export type FontFamilyOption = 'dm-sans' | 'helvetica' | 'segoe-ui' | 'satoshi' | 'inter' | 'jakarta-sans';

export interface ThemeSettings {
  mode: 'light' | 'dark';
  accentColor: AccentColor;
  sidebarCollapsed: boolean;
  density: 'comfortable' | 'compact';
  cardRadius: CardRadius;
  bgPattern: BackgroundPattern;
  customPrimaryColor?: string;
  customAccentColor?: string;
  chatBubbleColor?: 'navy' | 'red' | 'blue' | 'emerald' | 'purple' | 'amber' | 'custom';
  customChatBubbleColor?: string;
  fontSize?: 'normal' | 'large' | 'very-large';
  fontFamily?: FontFamilyOption;
  buttonHoverColor?: string;
  selectorActiveColor?: string;
  iconAccentColor?: string;
  customBgSolidColor?: string;
  customBgGradient?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface WorkspaceInfo {
  name: string;
  logoUrl?: string;
  tagline: string;
  orgDomain: string;
  timezone: string;
  loginLayout?: 'left-banner' | 'right-banner' | 'center-card' | 'stacked';
  loginBgStyle?: 'radiant-journey' | 'sky' | 'deep-navy' | 'ruby-maroon' | 'emerald-tech' | 'sunset-violet' | 'slate-minimal' | 'aurora' | 'geometric-grid' | 'modern-office' | 'custom-image';
  loginBgCustomUrl?: string;
  loginBgBlur?: number;
  loginBgOverlayOpacity?: number;
  loginOuterBgColor?: string;
  loginBannerHeadline?: string;
  loginBannerSubtitle?: string;
  loginBannerBadge?: string;
  loginStep1Text?: string;
  loginStep2Text?: string;
  loginStep3Text?: string;
  loginFormTitleSignUp?: string;
  loginFormTitleSignIn?: string;
  loginCtaSignUp?: string;
  loginCtaSignIn?: string;
  loginTermsText?: string;
}

export type DivisionRequestStatus = 'pending' | 'accepted' | 'declined';

export interface DivisionTaskRequest {
  id: string;
  title: string;
  description: string;
  requestorId: string;
  requestorName: string;
  requestorAvatar: string;
  requestorDept: string;
  requestorPosition?: string;
  targetDept: string;
  targetAssigneeId?: string;
  targetAssigneeName?: string;
  targetAssigneeAvatar?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: DivisionRequestStatus;
  acceptedBy?: {
    id: string;
    name: string;
    avatar: string;
    acceptedAt: string;
    createdTaskId: string;
  };
  declinedReason?: string;
  createdAt: string;
}



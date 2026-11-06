/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Advanced Task Management Automation Service
 * Handles Automatic Weekly Task Generation (Senin 09:00 WIB),
 * Automatic Archive (Jumat 23:00 WIB), deduplication, and per-division configs.
 */

import {
  Task,
  DivisionAutomationConfig,
  BrandQuotaConfig,
  AutomationHistoryLog,
  TaskWorkflowStep,
  TaskPriority
} from '../types';

export const DEFAULT_BRAND_QUOTAS: BrandQuotaConfig[] = [
  {
    brandId: 'brand-asli-ri',
    brandName: 'ASLI RI',
    weeklyCount: 3,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#dc2626', // Red
    defaultAssigneeName: 'Shakti Ramadhan',
    defaultAssigneeRole: 'Senior Designer'
  },
  {
    brandId: 'brand-tixfly',
    brandName: 'TIXFLY',
    weeklyCount: 3,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#ea580c', // Orange
    defaultAssigneeName: 'Rian Pratama',
    defaultAssigneeRole: 'Motion & Visual Designer'
  },
  {
    brandId: 'brand-trinity',
    brandName: 'TRINITY',
    weeklyCount: 4,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#7c3aed', // Purple
    defaultAssigneeName: 'Kiki Pratama',
    defaultAssigneeRole: 'Brand Copywriter & Planner'
  },
  {
    brandId: 'brand-beezy',
    brandName: 'BEEZY',
    weeklyCount: 4,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#059669', // Emerald
    defaultAssigneeName: 'Nadya Putri',
    defaultAssigneeRole: 'Creative Lead'
  },
  {
    brandId: 'brand-bank-abdi',
    brandName: 'BANK ABDI',
    weeklyCount: 3,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#0284c7', // Sky
    defaultAssigneeName: 'Budi Santoso',
    defaultAssigneeRole: 'Graphic Designer'
  },
  {
    brandId: 'brand-tommy-fondy',
    brandName: 'TOMMY FONDY',
    weeklyCount: 3,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#b45309', // Amber
    defaultAssigneeName: 'Shakti Ramadhan',
    defaultAssigneeRole: 'Senior Designer'
  },
  {
    brandId: 'brand-sate-asli-cempe',
    brandName: 'SATE ASLI CEMPE',
    weeklyCount: 3,
    enabled: true,
    contentType: 'Regular',
    category: 'Design',
    color: '#e11d48', // Rose
    defaultAssigneeName: 'Nadya Putri',
    defaultAssigneeRole: 'Creative Lead'
  }
];

export const BRAND_CONTENT_PRESETS: Record<
  string,
  { title: string; desc: string; category: string; contentType: string; format: 'poster' | 'scenes' | 'slides' }[]
> = {
  'ASLI RI': [
    {
      title: 'Digital Security Awareness',
      desc: 'Edukasi keamanan data nasabah di era digital dan verifikasi identitas modern.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Product Highlight - Biometric Engine',
      desc: 'Visual showcase fitur biometrik mutakhir dengan standar enterprise.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Tips Keamanan Data Transaksi',
      desc: 'Video informatif langkah proteksi akun dan autentikasi dua faktor.',
      category: 'Video',
      contentType: 'Video',
      format: 'scenes'
    }
  ],
  'TIXFLY': [
    {
      title: 'Event Promotion - Konser & Festival 2026',
      desc: 'Poster kampanye tiket eksklusif pre-sale festival musik nasional.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Travel Tips Series - Weekend Getaway',
      desc: 'Carousel rekomendasi destinasi liburan singkat hemat dan seru.',
      category: 'Design',
      contentType: 'Regular',
      format: 'slides'
    },
    {
      title: 'Flash Sale Promo Tiket Pesawat',
      desc: 'Banner promosi diskon rute domestik dan internasional.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    }
  ],
  'TRINITY': [
    {
      title: 'Pilates Education - Postur & Tulang Belakang',
      desc: 'Infografis teknik peregangan dasar untuk pekerja kantoran.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Wellness Lifestyle - Rutinitas Pagi Segar',
      desc: 'Tips nutrisi dan hidrasi seimbang sebelum latihan fisik.',
      category: 'Design',
      contentType: 'Regular',
      format: 'slides'
    },
    {
      title: 'Membership Promo - New Member Package',
      desc: 'Penawaran khusus paket kelas privat dan grup di studio.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Instructor Spotlight - Master Trainer Session',
      desc: 'Profil sertifikasi pelatih dan jadwal masterclass pekan ini.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    }
  ],
  'BEEZY': [
    {
      title: 'Workspace Productivity - 5 Habit Bekerja Cerdas',
      desc: 'Edukasi produktivitas kolaborasi di area coworking modern.',
      category: 'Design',
      contentType: 'Regular',
      format: 'slides'
    },
    {
      title: 'Virtual Office Promo - Legalitas & Alamat Bisnis',
      desc: 'Paket hemat sewa domisili PT/CV di gedung prestisius.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Coworking Tour - Ruang Meeting & Private Pod',
      desc: 'Video tur fasilitas meeting room berteknologi konferensi tinggi.',
      category: 'Video',
      contentType: 'Video',
      format: 'scenes'
    },
    {
      title: 'Community Networking - Founders Coffee Meetup',
      desc: 'Undangan gathering komunitas startup dan kreator digital.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    }
  ],
  'BANK ABDI': [
    {
      title: 'Program Spesial Akhir Tahun - Tabungan Masa Depan',
      desc: 'Visual promo bunga tabungan kompetitif dan bebas biaya admin.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Customer Story - Sukses Mitra UMKM Binaan',
      desc: 'Video dokumenter inspiratif pertumbuhan usaha mikro bersama Bank Abdi.',
      category: 'Video',
      contentType: 'Video',
      format: 'scenes'
    },
    {
      title: 'Edukasi Finansial - Manajemen Cash Flow Usaha',
      desc: 'Panduan praktis mengelola neraca keuangan bisnis digital.',
      category: 'Design',
      contentType: 'Regular',
      format: 'slides'
    }
  ],
  'TOMMY FONDY': [
    {
      title: 'Signature Cut - Busana Elegan Pria Modern',
      desc: 'Lookbook visual jas dan kemeja bespoke dengan potongan presisi.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Fabric Showcase - Koleksi Wol & Sutra Pilihan',
      desc: 'Detail tekstur kain impor bermutu tinggi untuk pakaian formal.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Behind The Tailor - Proses Jahit Tangan Klasik',
      desc: 'Video keahlian penjahit senior merangkai detail busana istimewa.',
      category: 'Video',
      contentType: 'Video',
      format: 'scenes'
    }
  ],
  'SATE ASLI CEMPE': [
    {
      title: 'Kuliner Otentik - Rahasia Daging Kambing Muda',
      desc: 'Edukasi pemilihan daging empuk tanpa aroma prengus dengan resep warisan.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Menu Rekomendasi - Tongseng & Sate Bumbu Spesial',
      desc: 'Foto sajian hidangan hangat kaya rempah nusantara.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    },
    {
      title: 'Family Gathering Promo - Paket Makan Bareng Hemat',
      desc: 'Voucher diskon santap keluarga dan katering acara kantor.',
      category: 'Design',
      contentType: 'Regular',
      format: 'poster'
    }
  ]
};

/**
 * Returns current date and time in Asia/Jakarta (WIB) timezone
 */
export function getWIBNow(): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  dayName: string;
  timeString: string;
  weekString: string; // e.g. "2026-W45"
  monthYear: string; // e.g. "November 2026"
  formattedWIB: string;
  isoDate: string;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short'
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const second = parseInt(partMap.second, 10);

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  const dayOfWeek = weekdayMap[partMap.weekday] ?? 0;

  const dayNamesIndo: Record<string, string> = {
    Sun: 'Minggu',
    Mon: 'Senin',
    Tue: 'Selasa',
    Wed: 'Rabu',
    Thu: 'Kamis',
    Fri: 'Jumat',
    Sat: 'Sabtu'
  };
  const dayName = dayNamesIndo[partMap.weekday] || partMap.weekday;

  // ISO Week calculation based on Jakarta calendar day
  const target = new Date(Date.UTC(year, month - 1, day));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const weekString = `${year}-W${String(weekNumber).padStart(2, '0')}`;

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];
  const monthYear = `${monthNames[month - 1]} ${year}`;
  const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const formattedWIB = `${dayName}, ${day} ${monthNames[month - 1]} ${year} pukul ${timeString} WIB`;
  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayOfWeek,
    dayName,
    timeString,
    weekString,
    monthYear,
    formattedWIB,
    isoDate
  };
}

/**
 * Creates default automation config for a division
 */
export function createDefaultDivisionConfig(
  divisionId: string,
  divisionName: string,
  isAdvancedDefault: boolean = false
): DivisionAutomationConfig {
  return {
    divisionId,
    divisionName,
    isAdvancedModeEnabled: isAdvancedDefault,
    generateSchedule: {
      enabled: true,
      dayOfWeek: 1, // Senin
      timeWIB: '09:00'
    },
    archiveSchedule: {
      enabled: true,
      dayOfWeek: 5, // Jumat
      timeWIB: '23:00'
    },
    brands: JSON.parse(JSON.stringify(DEFAULT_BRAND_QUOTAS)),
    cardTemplate: {
      defaultContentType: 'Regular',
      defaultCategory: 'Design',
      defaultPriority: 'medium' as TaskPriority,
      publishDayOffset: 6, // 6 days from Monday = Sunday
      briefDeadlineOffset: 2, // Wednesday
      designDeadlineOffset: 4, // Friday
      titleTemplate: '{brand} - {topic}',
      workflowSteps: [
        {
          id: 'step-1',
          name: 'Content Brief',
          description: 'Buat brief konten (copy, angle, & visual direction)',
          defaultRole: 'Copywriter',
          deadlineOffsetDays: 2
        },
        {
          id: 'step-2',
          name: 'Design Production',
          description: 'Produksi desain berdasarkan brief yang disetujui',
          defaultRole: 'Designer',
          deadlineOffsetDays: 4
        },
        {
          id: 'step-3',
          name: 'Final Approval',
          description: 'Approval hasil desain untuk publikasi',
          defaultRole: 'Creative Director',
          deadlineOffsetDays: 5
        },
        {
          id: 'step-4',
          name: 'Completed',
          description: 'Konten siap dipublikasikan ke media sosial brand',
          defaultRole: 'Marketing Team',
          deadlineOffsetDays: 6
        }
      ]
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Generates tasks for a division according to brand quotas.
 * Guaranteed safe from duplicates within the same week.
 */
export function generateWeeklyTasksForDivision(
  divisionId: string,
  divisionName: string,
  config: DivisionAutomationConfig,
  currentTasks: Task[],
  triggeredBy: 'cron_scheduler' | 'manual_admin' = 'cron_scheduler',
  force: boolean = false
): {
  newTasks: Task[];
  status: 'success' | 'skipped_duplicate' | 'failed';
  details: string;
  log: AutomationHistoryLog;
} {
  const wib = getWIBNow();
  const weekKey = `${wib.weekString}-${divisionId}`;

  // Check deduplication
  const alreadyGeneratedForWeek = currentTasks.some(
    t => t.automationWeek === weekKey && !t.isArchived
  );

  if (!force && alreadyGeneratedForWeek) {
    const message = `Task mingguan untuk minggu ${wib.weekString} sudah dibuat sebelumnya di divisi ${divisionName}. Duplikasi dicegah.`;
    return {
      newTasks: [],
      status: 'skipped_duplicate',
      details: message,
      log: {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        divisionId,
        divisionName,
        type: 'weekly_generation',
        status: 'skipped_duplicate',
        timestampWIB: wib.formattedWIB,
        tasksAffected: 0,
        details: message,
        triggeredBy
      }
    };
  }

  const generatedTasks: Task[] = [];
  let seqNumber = 426;

  // Find max existing CT- code
  currentTasks.forEach(t => {
    if (t.taskCode && t.taskCode.startsWith('CT-')) {
      const num = parseInt(t.taskCode.replace('CT-', ''), 10);
      if (!isNaN(num) && num >= seqNumber) {
        seqNumber = num + 1;
      }
    }
  });

  const enabledBrands = config.brands.filter(b => b.enabled && b.weeklyCount > 0);

  // Month date calculation
  const baseDate = new Date();

  enabledBrands.forEach(b => {
    const presets = BRAND_CONTENT_PRESETS[b.brandName] || [];

    for (let i = 0; i < b.weeklyCount; i++) {
      const preset = presets[i % presets.length] || {
        title: `${b.brandName} Regular Content #${i + 1}`,
        desc: `Konten mingguan otomatis untuk publikasi brand ${b.brandName}.`,
        category: b.category || 'Design',
        contentType: b.contentType || 'Regular',
        format: 'poster' as const
      };

      const taskCode = `CT-${String(seqNumber++).padStart(4, '0')}`;
      const taskId = `task-auto-${b.brandId}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`;

      // Calculate dates
      const briefDate = new Date(baseDate);
      briefDate.setDate(briefDate.getDate() + (config.cardTemplate.briefDeadlineOffset || 2));
      const designDate = new Date(baseDate);
      designDate.setDate(designDate.getDate() + (config.cardTemplate.designDeadlineOffset || 4));
      const publishDate = new Date(baseDate);
      publishDate.setDate(publishDate.getDate() + (config.cardTemplate.publishDayOffset || 6));

      const briefDeadlineStr = `${briefDate.getDate()} ${briefDate.toLocaleString('id-ID', { month: 'short' })}`;
      const designDeadlineStr = `${designDate.getDate()} ${designDate.toLocaleString('id-ID', { month: 'short' })}`;
      const publishDateStr = `${publishDate.getDate()} ${publishDate.toLocaleString('id-ID', { month: 'short' })} ${publishDate.getFullYear()}`;
      const deadlineISO = publishDate.toISOString().split('T')[0];

      const workflowSteps: TaskWorkflowStep[] = [
        {
          id: `step-1-${taskId}`,
          name: 'Content Brief',
          description: 'Buat brief konten (copy, angle, & visual direction)',
          status: 'in_progress',
          assigneeName: 'Kiki Pratama',
          assigneeRole: 'Copywriter',
          assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          deadline: briefDeadlineStr,
          hasBrief: true
        },
        {
          id: `step-2-${taskId}`,
          name: 'Design Production',
          description: 'Produksi desain berdasarkan brief yang disetujui',
          status: 'waiting',
          assigneeName: b.defaultAssigneeName || 'Shakti Ramadhan',
          assigneeRole: b.defaultAssigneeRole || 'Designer',
          assigneeAvatar: b.defaultAssigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          deadline: designDeadlineStr,
          hasDeliverable: true
        },
        {
          id: `step-3-${taskId}`,
          name: 'Final Approval',
          description: 'Approval hasil desain untuk publikasi',
          status: 'waiting'
        },
        {
          id: `step-4-${taskId}`,
          name: 'Completed',
          description: 'Konten siap dipublikasikan',
          status: 'waiting'
        }
      ];

      const newTask: Task = {
        id: taskId,
        taskCode,
        title: preset.title,
        description: preset.desc,
        status: 'not_started', // Placed directly into TO DO
        priority: config.cardTemplate.defaultPriority || 'medium',
        brand: b.brandName,
        brandId: b.brandId,
        brandColor: b.color || '#dc2626',
        contentType: b.contentType || 'Regular',
        category: preset.category || 'Design',
        publishDate: publishDateStr,
        briefDeadline: briefDeadlineStr,
        designDeadline: designDeadlineStr,
        deadline: deadlineISO,
        startDate: wib.isoDate,
        groupId: divisionId,
        groupName: divisionName,
        assigneeDept: divisionName,
        assigneeId: 'user-shakti',
        assigneeName: b.defaultAssigneeName || 'Shakti Ramadhan',
        assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        assignees: [
          {
            id: 'user-kiki',
            name: 'Kiki Pratama',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            role: 'Copywriter',
            dept: divisionName
          },
          {
            id: 'user-shakti',
            name: b.defaultAssigneeName || 'Shakti Ramadhan',
            avatar: b.defaultAssigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            role: b.defaultAssigneeRole || 'Designer',
            dept: divisionName
          }
        ],
        reporterId: 'user-admin',
        reporterName: 'Universal Admin (Automation)',
        requestorName: 'Automation Engine',
        labels: [b.brandName, b.contentType || 'Regular', preset.category || 'Design'],
        checklists: [
          { id: `chk-1-${taskId}`, text: 'Review requirement & tone of voice', completed: false },
          { id: `chk-2-${taskId}`, text: 'Visual asset & typography check', completed: false },
          { id: `chk-3-${taskId}`, text: 'Final quality control & export file', completed: false }
        ],
        checkpoints: [
          { id: `cp-1-${taskId}`, title: 'Content Brief Approved', isCompleted: false, targetDate: briefDeadlineStr },
          { id: `cp-2-${taskId}`, title: 'Design Production Delivered', isCompleted: false, targetDate: designDeadlineStr },
          { id: `cp-3-${taskId}`, title: 'Publish Ready', isCompleted: false, targetDate: publishDateStr }
        ],
        briefFormat: preset.format,
        comments: [],
        activity: [
          {
            id: `act-${Date.now()}-${i}`,
            userId: 'system-automation',
            userName: 'Automation Scheduler (WIB)',
            action: `Tugas otomatis dibuat untuk ${b.brandName} (${b.contentType || 'Regular'})`,
            timestamp: new Date().toISOString()
          }
        ],
        attachments: [],
        workflowSteps,
        generatedByAutomation: true,
        automationWeek: weekKey,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      generatedTasks.push(newTask);
    }
  });

  const successMessage = `Berhasil membuat ${generatedTasks.length} task mingguan baru untuk divisi ${divisionName} (${wib.weekString}).`;

  return {
    newTasks: generatedTasks,
    status: 'success',
    details: successMessage,
    log: {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      divisionId,
      divisionName,
      type: 'weekly_generation',
      status: 'success',
      timestampWIB: wib.formattedWIB,
      tasksAffected: generatedTasks.length,
      details: successMessage,
      triggeredBy,
      createdTaskIds: generatedTasks.map(t => t.id)
    }
  };
}

/**
 * Automatically archives all tasks that are in DONE status for a division.
 * Tasks not DONE are strictly preserved and never archived.
 */
export function archiveDoneTasks(
  divisionId: string,
  divisionName: string,
  currentTasks: Task[],
  triggeredBy: 'cron_scheduler' | 'manual_admin' = 'cron_scheduler'
): {
  updatedTasks: Task[];
  archivedTasks: Task[];
  archivedCount: number;
  log: AutomationHistoryLog;
} {
  const wib = getWIBNow();
  const folderName = wib.monthYear; // e.g. "November 2026"
  const archivedTaskIds: string[] = [];

  const updatedTasks = currentTasks.map(t => {
    const isTargetDivision =
      divisionId === 'all' ||
      t.groupId === divisionId ||
      t.assigneeDept === divisionName;

    // Strict rule: Only tasks in 'done' status are archived!
    if (isTargetDivision && t.status === 'done' && !t.isArchived) {
      archivedTaskIds.push(t.id);
      return {
        ...t,
        isArchived: true,
        archivedAt: new Date().toISOString(),
        archiveFolder: folderName,
        activity: [
          ...(t.activity || []),
          {
            id: `act-archive-${Date.now()}`,
            userId: 'system-automation',
            userName: 'Automation Scheduler (WIB)',
            action: `Tugas otomatis dipindahkan ke arsip (${folderName})`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
    }
    return t;
  });

  const archivedTasks = updatedTasks.filter(t => archivedTaskIds.includes(t.id));
  const details =
    archivedTaskIds.length > 0
      ? `Berhasil mengarsipkan ${archivedTaskIds.length} task selesai (Done) ke folder '${folderName}' untuk divisi ${divisionName}.`
      : `Tidak ada task berstatus Done baru yang perlu diarsipkan untuk divisi ${divisionName}.`;

  return {
    updatedTasks,
    archivedTasks,
    archivedCount: archivedTaskIds.length,
    log: {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      divisionId,
      divisionName,
      type: 'auto_archive',
      status: 'success',
      timestampWIB: wib.formattedWIB,
      tasksAffected: archivedTaskIds.length,
      details,
      triggeredBy,
      archivedTaskIds
    }
  };
}

/**
 * Restores an archived task back to the active board
 */
export function restoreArchivedTask(taskId: string, currentTasks: Task[]): Task[] {
  return currentTasks.map(t => {
    if (t.id === taskId) {
      return {
        ...t,
        isArchived: false,
        archivedAt: undefined,
        archiveFolder: undefined,
        activity: [
          ...(t.activity || []),
          {
            id: `act-restore-${Date.now()}`,
            userId: 'user-action',
            userName: 'User / Admin',
            action: 'Tugas dipulihkan kembali ke Board aktif',
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
    }
    return t;
  });
}

/**
 * Provides initial tasks seeded with the 23 weekly tasks for Marketing & Brand
 * plus sample archived tasks for demonstration.
 */
export function getInitialTasksWithSampleAutomation(): Task[] {
  const mktConfig = createDefaultDivisionConfig('marketing', 'Marketing & Brand', true);
  const genResult = generateWeeklyTasksForDivision('marketing', 'Marketing & Brand', mktConfig, [], 'cron_scheduler', true);
  const activeTasks = genResult.newTasks;

  // Set some tasks to In Progress and In Review to match realistic dashboard
  if (activeTasks.length >= 10) {
    activeTasks[1].status = 'on_progress';
    activeTasks[3].status = 'on_progress';
    activeTasks[5].status = 'on_progress';
    activeTasks[7].status = 'on_review';
    activeTasks[9].status = 'on_review';
  }

  // Sample archived tasks for November 2026 & Oktober 2026
  const sampleArchived: Task[] = [
    {
      id: 'task-archived-01',
      taskCode: 'CT-0418',
      title: 'ASLI RI - Kampanye Edukasi Otentikasi Biometrik Q3',
      description: 'Laporan performa dan penayangan konten edukasi privasi nasabah perbankan.',
      status: 'done',
      priority: 'high',
      brand: 'ASLI RI',
      brandId: 'brand-asli-ri',
      brandColor: '#dc2626',
      contentType: 'Regular',
      category: 'Design',
      publishDate: '28 Okt 2026',
      deadline: '2026-10-28',
      groupId: 'marketing',
      groupName: 'Marketing & Brand',
      assigneeDept: 'Marketing & Brand',
      assigneeId: 'user-shakti',
      assigneeName: 'Shakti Ramadhan',
      assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      reporterId: 'user-admin',
      reporterName: 'Universal Admin',
      labels: ['ASLI RI', 'Regular', 'Design'],
      checklists: [{ id: 'chk-1', text: 'Publikasi media sosial selesai', completed: true }],
      comments: [],
      activity: [],
      isArchived: true,
      archivedAt: '2026-11-01T23:00:00.000Z',
      archiveFolder: 'November 2026',
      createdAt: '2026-10-20T09:00:00.000Z'
    },
    {
      id: 'task-archived-02',
      taskCode: 'CT-0419',
      title: 'TIXFLY - Tiket Presale Konser Symphony Hall',
      description: 'Banner promosi flash sale tiket konser musik klasik.',
      status: 'done',
      priority: 'medium',
      brand: 'TIXFLY',
      brandId: 'brand-tixfly',
      brandColor: '#ea580c',
      contentType: 'Regular',
      category: 'Design',
      publishDate: '25 Okt 2026',
      deadline: '2026-10-25',
      groupId: 'marketing',
      groupName: 'Marketing & Brand',
      assigneeDept: 'Marketing & Brand',
      assigneeId: 'user-rian',
      assigneeName: 'Rian Pratama',
      assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      reporterId: 'user-admin',
      reporterName: 'Universal Admin',
      labels: ['TIXFLY', 'Regular', 'Design'],
      checklists: [],
      comments: [],
      activity: [],
      isArchived: true,
      archivedAt: '2026-10-31T23:00:00.000Z',
      archiveFolder: 'Oktober 2026',
      createdAt: '2026-10-18T09:00:00.000Z'
    },
    {
      id: 'task-archived-03',
      taskCode: 'CT-0420',
      title: 'TRINITY - New Year Wellness Pass Teaser',
      description: 'Video teaser 15 detik program kebugaran awal tahun.',
      status: 'done',
      priority: 'medium',
      brand: 'TRINITY',
      brandId: 'brand-trinity',
      brandColor: '#7c3aed',
      contentType: 'Regular',
      category: 'Video',
      publishDate: '30 Okt 2026',
      deadline: '2026-10-30',
      groupId: 'marketing',
      groupName: 'Marketing & Brand',
      assigneeDept: 'Marketing & Brand',
      assigneeId: 'user-kiki',
      assigneeName: 'Kiki Pratama',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      reporterId: 'user-admin',
      reporterName: 'Universal Admin',
      labels: ['TRINITY', 'Regular', 'Video'],
      checklists: [],
      comments: [],
      activity: [],
      isArchived: true,
      archivedAt: '2026-11-01T23:00:00.000Z',
      archiveFolder: 'November 2026',
      createdAt: '2026-10-22T09:00:00.000Z'
    }
  ];

  return [...activeTasks, ...sampleArchived];
}


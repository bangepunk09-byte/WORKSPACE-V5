/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Backend Server with Express, Vite Middlewares, and WIB Automation Scheduler.
 * Manages Automatic Weekly Task Generation (Monday 09:00 WIB)
 * and Automatic Archive (Friday 23:00 WIB).
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import {
  DivisionAutomationConfig,
  AutomationHistoryLog,
  Task,
  BrandQuotaConfig
} from './src/types';
import {
  DEFAULT_BRAND_QUOTAS,
  createDefaultDivisionConfig,
  getWIBNow,
  generateWeeklyTasksForDivision,
  archiveDoneTasks
} from './src/services/automationService';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_FILE = path.resolve(process.cwd(), 'automation-data.json');

app.use(express.json({ limit: '10mb' }));

interface AutomationDatabase {
  configs: Record<string, DivisionAutomationConfig>;
  history: AutomationHistoryLog[];
  tasks: Task[];
  lastCronChecks: {
    lastGenerateWeek?: string;
    lastArchiveWeek?: string;
  };
}

// Initial divisions list
const DEFAULT_DIVISIONS = [
  { id: 'marketing', name: 'Marketing & Brand', isAdvanced: true },
  { id: 'tech', name: 'Technology & Engineering', isAdvanced: false },
  { id: 'product', name: 'Product & Design', isAdvanced: false },
  { id: 'hr', name: 'People Operations & HR', isAdvanced: false },
  { id: 'finance', name: 'Finance & Legal', isAdvanced: false }
];

function loadDatabase(): AutomationDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Server DB] Error reading automation-data.json, initializing fresh state:', err);
  }

  // Generate initial configs
  const initialConfigs: Record<string, DivisionAutomationConfig> = {};
  DEFAULT_DIVISIONS.forEach(d => {
    initialConfigs[d.id] = createDefaultDivisionConfig(d.id, d.name, d.isAdvanced);
  });

  const initialDb: AutomationDatabase = {
    configs: initialConfigs,
    history: [
      {
        id: 'log-init',
        divisionId: 'marketing',
        divisionName: 'Marketing & Brand',
        type: 'weekly_generation',
        status: 'success',
        timestampWIB: getWIBNow().formattedWIB,
        tasksAffected: 23,
        details: 'Sistem Advanced Task Management diinisialisasi dengan konfigurasi 23 task mingguan.',
        triggeredBy: 'cron_scheduler'
      }
    ],
    tasks: [],
    lastCronChecks: {}
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: AutomationDatabase) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server DB] Error saving to automation-data.json:', err);
  }
}

let db = loadDatabase();

// ==========================================
// BACKEND SCHEDULER (CRON ENGINE - ASIA/JAKARTA)
// ==========================================
function runAutomationScheduler() {
  const wib = getWIBNow();
  let hasChanges = false;

  // 1. Weekly Generation Check: Senin 09:00 WIB
  // Triggers during the 09:00 hour on Monday (dayOfWeek === 1)
  const isMondayGenerateTime = wib.dayOfWeek === 1 && wib.hour === 9 && wib.minute <= 5;
  const currentWeek = wib.weekString; // e.g. "2026-W45"

  Object.values(db.configs).forEach(config => {
    if (!config.isAdvancedModeEnabled) return;

    // Check if generation is enabled for this division
    if (config.generateSchedule?.enabled) {
      const targetDay = config.generateSchedule.dayOfWeek ?? 1;
      const [targetH, targetM] = (config.generateSchedule.timeWIB || '09:00')
        .split(':')
        .map(n => parseInt(n, 10));

      const isMatchingSchedule =
        wib.dayOfWeek === targetDay &&
        wib.hour === targetH &&
        Math.abs(wib.minute - targetM) <= 3;

      const divisionWeekKey = `${currentWeek}-${config.divisionId}`;

      // Deduplication: Has it already run for this division this week?
      if (isMatchingSchedule && config.lastRunGenerateWeek !== divisionWeekKey) {
        console.log(`[Scheduler WIB] Running weekly task generation for: ${config.divisionName} (${divisionWeekKey})`);

        const result = generateWeeklyTasksForDivision(
          config.divisionId,
          config.divisionName,
          config,
          db.tasks,
          'cron_scheduler',
          false
        );

        if (result.status === 'success' && result.newTasks.length > 0) {
          db.tasks = [...result.newTasks, ...db.tasks];
          config.lastRunGenerateWeek = divisionWeekKey;
          config.lastRunGenerateAt = wib.formattedWIB;
          db.history.unshift(result.log);
          hasChanges = true;
        } else if (result.status === 'skipped_duplicate') {
          config.lastRunGenerateWeek = divisionWeekKey;
          hasChanges = true;
        }
      }
    }

    // 2. Automatic Archive Check: Jumat 23:00 WIB
    if (config.archiveSchedule?.enabled) {
      const targetDay = config.archiveSchedule.dayOfWeek ?? 5; // Friday
      const [targetH, targetM] = (config.archiveSchedule.timeWIB || '23:00')
        .split(':')
        .map(n => parseInt(n, 10));

      const isMatchingArchiveSchedule =
        wib.dayOfWeek === targetDay &&
        wib.hour === targetH &&
        Math.abs(wib.minute - targetM) <= 3;

      const archiveWeekKey = `archive-${currentWeek}-${config.divisionId}`;

      if (isMatchingArchiveSchedule && config.lastRunArchiveAt !== archiveWeekKey) {
        console.log(`[Scheduler WIB] Running automatic archive for: ${config.divisionName}`);

        const result = archiveDoneTasks(
          config.divisionId,
          config.divisionName,
          db.tasks,
          'cron_scheduler'
        );

        if (result.archivedCount > 0) {
          db.tasks = result.updatedTasks;
          config.lastRunArchiveAt = archiveWeekKey;
          db.history.unshift(result.log);
          hasChanges = true;
        }
      }
    }
  });

  if (hasChanges) {
    saveDatabase(db);
  }
}

// Start cron interval every 30 seconds
setInterval(runAutomationScheduler, 30 * 1000);

// ==========================================
// API ROUTES
// ==========================================

// Health & Status
app.get('/api/health', (req: Request, res: Response) => {
  const wib = getWIBNow();
  res.json({
    status: 'ok',
    timezone: 'Asia/Jakarta (WIB)',
    timeWIB: wib.formattedWIB,
    serverTime: new Date().toISOString()
  });
});

// Automation Status Overview
app.get('/api/automation/status', (req: Request, res: Response) => {
  const wib = getWIBNow();
  const configs = Object.values(db.configs);
  const activeDivisions = configs.filter(c => c.isAdvancedModeEnabled);

  res.json({
    timezone: 'Asia/Jakarta (WIB)',
    currentWIB: wib.formattedWIB,
    weekString: wib.weekString,
    totalDivisions: configs.length,
    activeAdvancedDivisions: activeDivisions.length,
    nextScheduledGeneration: 'Setiap Senin pukul 09:00 WIB',
    nextScheduledArchive: 'Setiap Jumat pukul 23:00 WIB',
    totalTasksInDatabase: db.tasks.length,
    archivedTasksCount: db.tasks.filter(t => t.isArchived).length
  });
});

// Get all division configs
app.get('/api/automation/configs', (req: Request, res: Response) => {
  res.json({ configs: db.configs });
});

// Update a division config
app.post('/api/automation/configs/:divisionId', (req: Request, res: Response) => {
  const { divisionId } = req.params;
  const updates: Partial<DivisionAutomationConfig> = req.body;

  if (!db.configs[divisionId]) {
    db.configs[divisionId] = createDefaultDivisionConfig(
      divisionId,
      updates.divisionName || divisionId,
      updates.isAdvancedModeEnabled || false
    );
  }

  db.configs[divisionId] = {
    ...db.configs[divisionId],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  res.json({ success: true, config: db.configs[divisionId] });
});

// Manual Run Task Generation (Run Now)
app.post('/api/automation/run-generate', (req: Request, res: Response) => {
  const { divisionId = 'marketing', force = false, clientTasks = [] } = req.body;
  const wib = getWIBNow();

  let config = db.configs[divisionId];
  if (!config) {
    config = createDefaultDivisionConfig(divisionId, divisionId, true);
    db.configs[divisionId] = config;
  }

  // Combine known tasks to check deduplication
  const combinedTasks = [...db.tasks, ...clientTasks.filter((ct: Task) => !db.tasks.some(dt => dt.id === ct.id))];

  const result = generateWeeklyTasksForDivision(
    divisionId,
    config.divisionName || divisionId,
    config,
    combinedTasks,
    'manual_admin',
    force
  );

  if (result.status === 'success' && result.newTasks.length > 0) {
    db.tasks = [...result.newTasks, ...db.tasks];
    config.lastRunGenerateWeek = `${wib.weekString}-${divisionId}`;
    config.lastRunGenerateAt = wib.formattedWIB;
    db.history.unshift(result.log);
    saveDatabase(db);
  } else if (result.log) {
    db.history.unshift(result.log);
    saveDatabase(db);
  }

  res.json({
    success: result.status === 'success',
    status: result.status,
    details: result.details,
    generatedCount: result.newTasks.length,
    newTasks: result.newTasks,
    log: result.log
  });
});

// Manual Run Auto-Archive (Run Now)
app.post('/api/automation/run-archive', (req: Request, res: Response) => {
  const { divisionId = 'all', clientTasks = [] } = req.body;
  const divisionName = divisionId === 'all' ? 'Semua Divisi' : (db.configs[divisionId]?.divisionName || divisionId);

  // Merge client tasks into db.tasks
  clientTasks.forEach((ct: Task) => {
    const existingIdx = db.tasks.findIndex(dt => dt.id === ct.id);
    if (existingIdx >= 0) {
      db.tasks[existingIdx] = ct;
    } else {
      db.tasks.push(ct);
    }
  });

  const result = archiveDoneTasks(
    divisionId,
    divisionName,
    db.tasks,
    'manual_admin'
  );

  db.tasks = result.updatedTasks;
  db.history.unshift(result.log);
  saveDatabase(db);

  res.json({
    success: true,
    archivedCount: result.archivedCount,
    archivedTasks: result.archivedTasks,
    details: result.log.details,
    log: result.log
  });
});

// Get History Logs
app.get('/api/automation/history', (req: Request, res: Response) => {
  res.json({ history: db.history.slice(0, 50) });
});

// Sync Tasks with Frontend
app.post('/api/automation/sync-tasks', (req: Request, res: Response) => {
  const { tasks = [] } = req.body;
  if (Array.isArray(tasks) && tasks.length > 0) {
    tasks.forEach((t: Task) => {
      const idx = db.tasks.findIndex(dt => dt.id === t.id);
      if (idx >= 0) {
        db.tasks[idx] = t;
      } else {
        db.tasks.push(t);
      }
    });
    saveDatabase(db);
  }
  res.json({ success: true, count: db.tasks.length, tasks: db.tasks });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const wib = getWIBNow();
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Scheduler] Active with timezone Asia/Jakarta (WIB: ${wib.formattedWIB})`);
  });
}

startServer().catch(err => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});

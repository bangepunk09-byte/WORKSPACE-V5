import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Flag,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Task, User } from '../../types';

interface GanttChartTimelineProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  activeGroupName: string;
  onSelectTask: (task: Task) => void;
  onAddTask: () => void;
  onToggleTaskComplete?: (taskId: string) => void;
}

// Compact dates matching reference image_5f4074b4.png:
// [14 F, 15 S, 16 S, 17 M (Today), 18 T, 19 W, 21 T, 22 F, 23 S, 24 S, 25 M, 26 T, 27 W, 28 T, 29 F]
interface DayHeader {
  day: number;
  weekday: string;
  isToday?: boolean;
}

const COMPACT_DAYS: DayHeader[] = [
  { day: 14, weekday: 'F' },
  { day: 15, weekday: 'S' },
  { day: 16, weekday: 'S' },
  { day: 17, weekday: 'M', isToday: true }, // Today reference marker in red
  { day: 18, weekday: 'T' },
  { day: 19, weekday: 'W' },
  { day: 21, weekday: 'T' },
  { day: 22, weekday: 'F' },
  { day: 23, weekday: 'S' },
  { day: 24, weekday: 'S' },
  { day: 25, weekday: 'M' },
  { day: 26, weekday: 'T' },
  { day: 27, weekday: 'W' },
  { day: 28, weekday: 'T' },
  { day: 29, weekday: 'F' }
];

export const GanttChartTimeline: React.FC<GanttChartTimelineProps> = ({
  tasks,
  currentUser,
  activeGroupName,
  onSelectTask,
  onAddTask
}) => {
  const [selectedSprint, setSelectedSprint] = useState('Sprint 42 - Q4 2026');

  // Colors & styles modeled directly after image_5f4074b4.png
  const trackStyles = [
    {
      code: 'VF-08',
      pillBg: 'bg-blue-600 text-white',
      lineColor: 'border-blue-600 dark:border-blue-500',
      nodeBg: 'bg-blue-600 text-white',
      nodeLabel: 'Flight Ready',
      milestoneLabel: 'Release',
      icon: CheckCircle2,
      startCol: 1, // index in COMPACT_DAYS (0-based)
      spanCols: 4,
      endCol: 8
    },
    {
      code: 'VF-09',
      pillBg: 'bg-emerald-600 text-white',
      lineColor: 'border-emerald-600 dark:border-emerald-500',
      nodeBg: 'bg-emerald-600 text-white',
      nodeLabel: 'Preparation Completed',
      milestoneLabel: 'Live Staging',
      icon: Flag,
      startCol: 1,
      spanCols: 6,
      endCol: 11
    },
    {
      code: 'VF-10',
      pillBg: 'bg-orange-500 text-white',
      lineColor: 'border-orange-500 dark:border-orange-400',
      nodeBg: 'bg-orange-500 text-white',
      nodeLabel: 'In Progress',
      milestoneLabel: 'UAT Sign-off',
      icon: Clock,
      startCol: 3,
      spanCols: 4,
      endCol: 14
    },
    {
      code: 'VF-11',
      pillBg: 'bg-slate-400 text-white dark:bg-slate-600',
      lineColor: 'border-slate-300 dark:border-slate-700',
      nodeBg: 'bg-slate-400 text-white dark:bg-slate-600',
      nodeLabel: 'Backlog Prep',
      milestoneLabel: 'Planning',
      icon: Clock,
      startCol: 8,
      spanCols: 3,
      endCol: 14
    }
  ];

  // Pick up to 4 tasks to display in the ultra-compact Gantt stream
  const displayTasks = tasks.slice(0, 4);

  return (
    <div className="rounded-[28px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
      {/* Top Header: Date matching "17 July 2022" from reference */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              17 November 2026
            </span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-extrabold text-red-600 dark:bg-red-950/70 dark:text-red-400">
              ● Live Today
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline">
            Timeline Milestone: {activeGroupName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Sprint Timeline (Ringkas & Tanpa Scroll Dalam)
          </span>
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1 text-xs font-bold text-white hover:bg-black dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-2xs transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Task Baru</span>
          </button>
        </div>
      </div>

      {/* Main Streamlined Gantt Container (Exact representation of image_5f4074b4.png) */}
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="min-w-[760px] relative">
          {/* Days Header Grid */}
          <div className="grid grid-cols-15 text-center text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
            {COMPACT_DAYS.map((d, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center ${
                  d.isToday
                    ? 'text-red-600 font-black dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs font-mono">{d.day}</span>
                  <span className="text-xs font-normal opacity-70">{d.weekday}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Canvas & Task Tracks */}
          <div className="relative py-3 space-y-4">
            {/* Background Vertical Grid Lines with Red Line for Today */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-15 h-full">
              {COMPACT_DAYS.map((d, i) => (
                <div
                  key={i}
                  className={`h-full border-r relative ${
                    d.isToday
                      ? 'border-red-400/80 bg-red-50/20 dark:border-red-500/80 dark:bg-red-950/10'
                      : 'border-slate-100/90 dark:border-slate-800/40'
                  }`}
                >
                  {d.isToday && (
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-red-500 z-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Task Tracks matching image_5f4074b4.png */}
            {displayTasks.map((task, idx) => {
              const style = trackStyles[idx % trackStyles.length];
              const Icon = style.icon;

              // Calculate positions across the 15-day grid
              const pillStartPct = (style.startCol / 15) * 100;
              const pillWidthPct = (style.spanCols / 15) * 100;
              const milestonePosPct = (style.endCol / 15) * 100;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="relative h-10 flex items-center group cursor-pointer transition hover:opacity-95"
                  title={`Klik untuk detail: ${task.title}`}
                >
                  {/* Connecting Line between Task Pill and Endpoint Milestone */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 border-t-2 ${style.lineColor} z-10 transition-all`}
                    style={{
                      left: `${pillStartPct + pillWidthPct * 0.4}%`,
                      width: `${milestonePosPct - (pillStartPct + pillWidthPct * 0.4)}%`
                    }}
                  />

                  {/* Left Task Pill (e.g. [✓ VF-08 — Flight Ready]) */}
                  <div
                    className={`absolute z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-md text-xs font-bold transition-transform group-hover:scale-[1.02] ${style.pillBg}`}
                    style={{
                      left: `${pillStartPct}%`,
                      maxWidth: '320px'
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-[11px] font-black shrink-0">{style.code}</span>
                    <span className="text-white/60 font-normal shrink-0">—</span>
                    <span className="truncate max-w-[170px] text-[11px]">
                      {task.title || style.nodeLabel}
                    </span>
                  </div>

                  {/* Circular Node & Milestone Pill at end (e.g. ○ [Flight]) */}
                  {style.endCol < 14 && (
                    <div
                      className="absolute z-20 flex items-center gap-1.5 -translate-y-1/2 top-1/2"
                      style={{ left: `${milestonePosPct}%` }}
                    >
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-white dark:border-slate-900 ring-2 ring-blue-500 shadow-xs shrink-0" />
                      <div
                        className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold shadow-sm ${style.nodeBg}`}
                      >
                        {style.milestoneLabel}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Archive Page (Tab ARCHIVE)
 * Groups archived tasks by Month & Year (e.g. November 2026, December 2026).
 * Features: Collapsible folders, search & filter (brand, assignee, content type),
 * read-only task detail view, and 1-click Restore to active Board.
 */

import React, { useState, useMemo } from 'react';
import {
  Archive,
  Folder,
  FolderOpen,
  Search,
  RotateCcw,
  Eye,
  CheckCircle2,
  Calendar,
  Tag,
  User as UserIcon,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { Task, User, ManagedBrand } from '../../types';
import { soundEffects } from '../../services/soundEffects';

interface ArchiveViewProps {
  tasks: Task[];
  users: User[];
  managedBrands: ManagedBrand[];
  currentUser: User;
  activeGroupId: string;
  onRestoreTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onRunAutoArchiveNow?: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  tasks,
  users,
  managedBrands,
  currentUser,
  activeGroupId,
  onRestoreTask,
  onSelectTask,
  onRunAutoArchiveNow
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Filter only archived tasks
  const allArchivedTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.isArchived) return false;
      if (activeGroupId === 'all') return true;
      return t.groupId === activeGroupId || t.assigneeDept === activeGroupId;
    });
  }, [tasks, activeGroupId]);

  // Apply search and filter
  const filteredArchivedTasks = useMemo(() => {
    return allArchivedTasks.filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = (t.taskCode || '').toLowerCase().includes(q);
        const matchBrand = (t.brand || '').toLowerCase().includes(q);
        const matchDesc = (t.description || '').toLowerCase().includes(q);
        const matchAssignee = (t.assigneeName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchBrand && !matchDesc && !matchAssignee) {
          return false;
        }
      }

      if (brandFilter !== 'all' && t.brand !== brandFilter) {
        return false;
      }

      if (contentTypeFilter !== 'all') {
        const ct = t.contentType || 'Regular';
        if (ct.toLowerCase() !== contentTypeFilter.toLowerCase()) {
          return false;
        }
      }

      if (assigneeFilter !== 'all') {
        const hasAssignee =
          t.assigneeId === assigneeFilter ||
          (t.assignees && t.assignees.some(a => a.id === assigneeFilter));
        if (!hasAssignee) return false;
      }

      return true;
    });
  }, [allArchivedTasks, searchQuery, brandFilter, contentTypeFilter, assigneeFilter]);

  // Group by Month & Year folder
  const groupedFolders = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    filteredArchivedTasks.forEach(task => {
      let folder = task.archiveFolder;
      if (!folder && task.archivedAt) {
        const d = new Date(task.archivedAt);
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        folder = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }
      if (!folder) {
        folder = 'November 2026';
      }

      if (!groups[folder]) {
        groups[folder] = [];
      }
      groups[folder].push(task);
    });

    return Object.entries(groups).sort((a, b) => {
      return b[0].localeCompare(a[0]);
    });
  }, [filteredArchivedTasks]);

  const toggleFolder = (folderName: string) => {
    soundEffects.play('click');
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const expandAll = () => {
    soundEffects.play('click');
    setCollapsedFolders({});
  };

  const collapseAll = () => {
    soundEffects.play('click');
    const collapsed: Record<string, boolean> = {};
    groupedFolders.forEach(([name]) => {
      collapsed[name] = true;
    });
    setCollapsedFolders(collapsed);
  };

  const handleRestore = (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    soundEffects.play('success');
    onRestoreTask(taskId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-xs">
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-800 ring-1 ring-slate-800 shadow-xs shrink-0">
            <Archive className="h-7 w-7 text-amber-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Archive Page (Arsip Tugas Selesai)
              </h2>
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 px-3 py-1 text-xs font-bold shadow-2xs">
                {allArchivedTasks.length} Total Diarsipkan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dikelompokkan otomatis per bulan & tahun. Otomatisasi berjalan setiap <strong>Jumat pukul 23.00 WIB</strong> untuk memindahkan tugas kolom DONE.
            </p>
          </div>
        </div>

        {onRunAutoArchiveNow && (
          <button
            type="button"
            onClick={() => {
              soundEffects.play('click');
              onRunAutoArchiveNow();
            }}
            className="h-10 inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50 hover:bg-amber-100/90 px-4 text-xs font-bold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200 transition cursor-pointer shadow-2xs self-start md:self-auto shrink-0 active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Jalankan Arsip Otomatis Sekarang</span>
          </button>
        )}
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari arsip berdasarkan judul, ID kode (CT-xxxx), brand, atau assignee..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white shadow-2xs transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs font-bold text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Brand</option>
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
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs font-bold text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Content Type</option>
              <option value="Regular">Regular</option>
              <option value="Video">Video</option>
              <option value="Design">Design</option>
              <option value="Carousel">Carousel / Slides</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="h-10 rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 text-xs font-bold text-slate-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Assignee</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 dark:border-slate-700">
              <button
                type="button"
                onClick={expandAll}
                className="h-9 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="h-9 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Folder List */}
      {groupedFolders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 mb-3">
            <Archive className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Belum Ada Tugas Dalam Arsip
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {allArchivedTasks.length === 0
              ? 'Tugas berstatus Done akan otomatis diarsipkan setiap Jumat pukul 23:00 WIB, atau Anda dapat menjalankan arsip manual melalui tombol di atas.'
              : 'Tidak ditemukan tugas arsip yang cocok dengan filter pencarian.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedFolders.map(([folderName, folderTasks]) => {
            const isCollapsed = collapsedFolders[folderName];

            return (
              <div
                key={folderName}
                className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 transition-all duration-200"
              >
                {/* Folder Header */}
                <div
                  onClick={() => toggleFolder(folderName)}
                  className="flex items-center justify-between p-4.5 bg-slate-50/70 hover:bg-slate-100/60 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 cursor-pointer select-none transition border-b border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {isCollapsed ? (
                        <Folder className="h-5 w-5" />
                      ) : (
                        <FolderOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Folder: {folderName}
                        </h3>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                          ✓ 100% Selesai
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {folderTasks.length} task tersimpan permanen dengan riwayat lengkap
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {folderTasks.length} Dokumen Task
                    </span>
                  </div>
                </div>

                {/* Folder Items Table */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:bg-slate-800/20">
                        <tr>
                          <th className="px-5 py-3">Kode & Brand</th>
                          <th className="px-5 py-3">Judul Tugas</th>
                          <th className="px-5 py-3">Tipe Konten</th>
                          <th className="px-5 py-3">Assignee</th>
                          <th className="px-5 py-3">Waktu Publish / Deadline</th>
                          <th className="px-5 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {folderTasks.map(task => {
                          return (
                            <tr
                              key={task.id}
                              onClick={() => onSelectTask(task)}
                              className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                            >
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {task.taskCode || task.id.slice(0, 7)}
                                  </span>
                                  <span
                                    className="rounded-lg px-2.5 py-1 text-xs font-extrabold text-white shadow-2xs"
                                    style={{ backgroundColor: task.brandColor || '#dc2626' }}
                                  >
                                    {task.brand || 'ASLI GROUP'}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <div>
                                  <span className="font-bold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400 transition text-xs">
                                    {task.title}
                                  </span>
                                  {task.category && (
                                    <span className="ml-2 text-xs text-slate-400">
                                      • {task.category}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-1 text-xs font-bold">
                                  {task.contentType || 'Regular'}
                                </span>
                              </td>

                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={task.assigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                                    alt={task.assigneeName}
                                    className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                  />
                                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">
                                    {task.assigneeName}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-xs font-medium">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{task.publishDate || task.deadline || '15 Nov 2026'}</span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      onSelectTask(task);
                                    }}
                                    className="h-9 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-2xs"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Detail</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={e => handleRestore(e, task.id, task.title)}
                                    className="h-9 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 text-xs font-bold text-white transition shadow-2xs active:scale-95 cursor-pointer"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Restore</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

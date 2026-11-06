/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Automation Settings Modal for Advanced Task Management
 * Allows configuring per-division automation, schedules (WIB), brand quotas (23 tasks/week),
 * card templates, history logs, and manual Run Now triggers.
 */

import React, { useState } from 'react';
import {
  X,
  Bot,
  Sliders,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Archive,
  Building2,
  ChevronRight,
  Shield,
  FileText
} from 'lucide-react';
import {
  DivisionAutomationConfig,
  BrandQuotaConfig,
  AutomationHistoryLog,
  UserRole
} from '../../types';
import { DEFAULT_BRAND_QUOTAS, getWIBNow } from '../../services/automationService';
import { soundEffects } from '../../services/soundEffects';

interface AutomationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDivisionId: string;
  divisionName: string;
  divisions: { id: string; name: string }[];
  config: DivisionAutomationConfig;
  historyLogs: AutomationHistoryLog[];
  onSaveConfig: (updatedConfig: DivisionAutomationConfig) => void;
  onRunGenerateNow: (divisionId: string, force?: boolean) => Promise<any>;
  onRunArchiveNow: (divisionId: string) => Promise<any>;
  userRole?: UserRole;
}

export const AutomationSettingsModal: React.FC<AutomationSettingsModalProps> = ({
  isOpen,
  onClose,
  activeDivisionId,
  divisionName,
  divisions,
  config,
  historyLogs,
  onSaveConfig,
  onRunGenerateNow,
  onRunArchiveNow,
  userRole
}) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(activeDivisionId);
  const [activeTab, setActiveTab] = useState<'config' | 'brands' | 'template' | 'history'>('config');
  const [localConfig, setLocalConfig] = useState<DivisionAutomationConfig>(() => JSON.parse(JSON.stringify(config)));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // New brand state
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandQuota, setNewBrandQuota] = useState(3);
  const [newBrandContentType, setNewBrandContentType] = useState('Regular');
  const [newBrandColor, setNewBrandColor] = useState('#2563eb');

  if (!isOpen) return null;

  const currentWIB = getWIBNow();

  // Total weekly tasks calculation
  const totalWeeklyTasks = (localConfig.brands || [])
    .filter(b => b.enabled)
    .reduce((sum, b) => sum + (Number(b.weeklyCount) || 0), 0);

  const handleToggleAdvancedMode = () => {
    soundEffects.play('toggle');
    setLocalConfig(prev => ({
      ...prev,
      isAdvancedModeEnabled: !prev.isAdvancedModeEnabled
    }));
  };

  const handleUpdateBrandQuota = (brandId: string, delta: number) => {
    soundEffects.play('click');
    setLocalConfig(prev => ({
      ...prev,
      brands: prev.brands.map(b => {
        if (b.brandId === brandId) {
          const nextCount = Math.max(0, (b.weeklyCount || 0) + delta);
          return { ...b, weeklyCount: nextCount };
        }
        return b;
      })
    }));
  };

  const handleToggleBrandEnabled = (brandId: string) => {
    soundEffects.play('toggle');
    setLocalConfig(prev => ({
      ...prev,
      brands: prev.brands.map(b => (b.brandId === brandId ? { ...b, enabled: !b.enabled } : b))
    }));
  };

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    soundEffects.play('success');
    const newBrandItem: BrandQuotaConfig = {
      brandId: `brand-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      brandName: newBrandName.trim().toUpperCase(),
      weeklyCount: newBrandQuota,
      enabled: true,
      contentType: newBrandContentType,
      category: 'Design',
      color: newBrandColor
    };

    setLocalConfig(prev => ({
      ...prev,
      brands: [...prev.brands, newBrandItem]
    }));

    setNewBrandName('');
    setNewBrandQuota(3);
    setIsAddingBrand(false);
  };

  const handleRemoveBrand = (brandId: string) => {
    soundEffects.play('delete');
    setLocalConfig(prev => ({
      ...prev,
      brands: prev.brands.filter(b => b.brandId !== brandId)
    }));
  };

  const handleResetToDefault = () => {
    soundEffects.play('click');
    setLocalConfig(prev => ({
      ...prev,
      brands: JSON.parse(JSON.stringify(DEFAULT_BRAND_QUOTAS)),
      generateSchedule: { enabled: true, dayOfWeek: 1, timeWIB: '09:00' },
      archiveSchedule: { enabled: true, dayOfWeek: 5, timeWIB: '23:00' }
    }));
    setActionFeedback({
      type: 'info',
      message: 'Konfigurasi brand telah di-reset ke standar 23 task mingguan.'
    });
  };

  const handleSave = () => {
    soundEffects.play('success');
    onSaveConfig(localConfig);
    setActionFeedback({
      type: 'success',
      message: 'Pengaturan otomatisasi divisi berhasil disimpan!'
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleTriggerGenerate = async (force: boolean = false) => {
    setIsGenerating(true);
    setActionFeedback(null);
    soundEffects.play('click');

    try {
      const res = await onRunGenerateNow(selectedDivisionId, force);
      if (res && res.status === 'skipped_duplicate') {
        setActionFeedback({
          type: 'info',
          message: res.details || 'Task untuk minggu ini sudah dibuat sebelumnya. Gunakan Force Run jika tetap ingin menduplikasi.'
        });
      } else {
        soundEffects.play('taskComplete');
        setActionFeedback({
          type: 'success',
          message: `Sukses! Berhasil membuat task mingguan baru secara otomatis.`
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Gagal menjalankan generate task.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerArchive = async () => {
    setIsArchiving(true);
    setActionFeedback(null);
    soundEffects.play('click');

    try {
      const res = await onRunArchiveNow(selectedDivisionId);
      soundEffects.play('taskComplete');
      setActionFeedback({
        type: 'success',
        message: res.details || `Berhasil mengarsipkan tugas selesai ke folder bulan berjalan.`
      });
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Gagal menjalankan arsip otomatis.'
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl my-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Pengaturan Otomasi: Advanced Task Management Mode
                </h2>
                <span className="rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 text-xs font-bold">
                  Timezone: WIB (UTC+7)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi jadwal mingguan, kuota brand, template card, dan automatic archive per divisi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Division Selector & Mode Toggle Bar */}
        <div className="px-6 py-4 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Divisi Target:</span>
            <select
              value={selectedDivisionId}
              onChange={e => setSelectedDivisionId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-2xs"
            >
              {divisions.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.id === activeDivisionId ? '(Board Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Mode Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Advanced Mode: {localConfig.isAdvancedModeEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
              </div>
              <div className="text-xs text-slate-500">
                {localConfig.isAdvancedModeEnabled
                  ? 'Automation berjalan otomatis sesuai jadwal'
                  : 'Divisi menggunakan Task Management secara manual'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAdvancedMode}
              className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                localConfig.isAdvancedModeEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  localConfig.isAdvancedModeEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'config', label: '1. Jadwal & Otomasi', icon: Clock },
            { id: 'brands', label: `2. Kuota Brand (${totalWeeklyTasks}/mgg)`, icon: Building2 },
            { id: 'template', label: '3. Template Workflow Card', icon: FileText },
            { id: 'history', label: '4. Riwayat & Eksekusi', icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEffects.play('click');
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer whitespace-nowrap -mb-px ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                : actionFeedback.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: JADWAL & STATUS OTOMASI */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Status Warning if OFF */}
              {!localConfig.isAdvancedModeEnabled && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Advanced Mode Saat Ini Nonaktif (OFF).</strong> Divisi ini menjalankan Task Management secara manual tanpa otomatisasi mingguan. Aktifkan saklar di atas untuk mengaktifkan scheduler otomatis Senin 09.00 WIB dan Jumat 23.00 WIB.
                  </div>
                </div>
              )}

              {/* Schedule 1: Automatic Weekly Task Generation */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Otomasi 1: Automatic Weekly Task Generation
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Membuat kartu tugas baru secara otomatis ke kolom TO DO setiap awal pekan.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <span>Status:</span>
                    <input
                      type="checkbox"
                      checked={localConfig.generateSchedule?.enabled ?? true}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          generateSchedule: {
                            ...prev.generateSchedule,
                            enabled: e.target.checked
                          }
                        }))
                      }
                      className="rounded accent-blue-600 h-4 w-4"
                    />
                    <span className="text-blue-600">Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hari Eksekusi Mingguan
                    </label>
                    <select
                      value={localConfig.generateSchedule?.dayOfWeek ?? 1}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          generateSchedule: {
                            ...prev.generateSchedule,
                            dayOfWeek: parseInt(e.target.value, 10)
                          }
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value={1}>Hari Senin (Standar Rekomendasi)</option>
                      <option value={2}>Hari Selasa</option>
                      <option value={3}>Hari Rabu</option>
                      <option value={4}>Hari Kamis</option>
                      <option value={5}>Hari Jumat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Waktu Jam Eksekusi (WIB)
                    </label>
                    <input
                      type="text"
                      value={localConfig.generateSchedule?.timeWIB || '09:00'}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          generateSchedule: {
                            ...prev.generateSchedule,
                            timeWIB: e.target.value
                          }
                        }))
                      }
                      placeholder="09:00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">
                      Standar: <strong>09.00 WIB</strong> (Waktu Indonesia Barat)
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule 2: Automatic Archive */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Archive className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Otomasi 2: Automatic Archive Selesai (Done)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Memindahkan seluruh task berstatus DONE ke folder ARCHIVE bulanan secara otomatis.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <span>Status:</span>
                    <input
                      type="checkbox"
                      checked={localConfig.archiveSchedule?.enabled ?? true}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          archiveSchedule: {
                            ...prev.archiveSchedule,
                            enabled: e.target.checked
                          }
                        }))
                      }
                      className="rounded accent-amber-600 h-4 w-4"
                    />
                    <span className="text-amber-600">Aktif</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hari Eksekusi Arsip
                    </label>
                    <select
                      value={localConfig.archiveSchedule?.dayOfWeek ?? 5}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          archiveSchedule: {
                            ...prev.archiveSchedule,
                            dayOfWeek: parseInt(e.target.value, 10)
                          }
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value={5}>Hari Jumat (Standar Rekomendasi)</option>
                      <option value={6}>Hari Sabtu</option>
                      <option value={0}>Hari Minggu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Waktu Jam Arsip (WIB)
                    </label>
                    <input
                      type="text"
                      value={localConfig.archiveSchedule?.timeWIB || '23:00'}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          archiveSchedule: {
                            ...prev.archiveSchedule,
                            timeWIB: e.target.value
                          }
                        }))
                      }
                      placeholder="23:00"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-xs text-slate-400 mt-1 block">
                      Standar: <strong>23.00 WIB</strong> (Semua data brief & file tetap tersimpan)
                    </span>
                  </div>
                </div>
              </div>

              {/* Deduplication & Safety Guard Notice */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs font-semibold text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300 flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Sistem Keamanan Anti-Duplikasi Aktif:</strong> Scheduler otomatis melacak signature minggu berjalan (<strong>{currentWIB.weekString}</strong>). Jika proses cron berjalan lebih dari satu kali, sistem menjamin tidak akan ada duplikasi task pada minggu yang sama.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRAND & KUOTA TASK MINGGUAN */}
          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-2xl dark:bg-slate-800/40">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tabel Kuota Brand Mingguan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jumlah task mingguan per brand yang akan di-generate setiap hari Senin pukul 09.00 WIB.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Total Quota:
                  </span>
                  <span className="rounded-xl bg-red-600 text-white font-extrabold px-3 py-1 text-sm shadow-xs">
                    {totalWeeklyTasks} Task / Minggu
                  </span>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="ml-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title="Kembalikan kuota ke default 23 task"
                  >
                    Reset (23 Task)
                  </button>
                </div>
              </div>

              {/* Table of Brands */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Nama Brand</th>
                      <th className="px-4 py-3">Content Type</th>
                      <th className="px-4 py-3 text-center">Task / Minggu</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {localConfig.brands.map(brand => (
                      <tr key={brand.brandId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: brand.color || '#dc2626' }}
                            />
                            <span>{brand.brandName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          <span className="rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 text-xs font-bold">
                            {brand.contentType || 'Regular'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                            <button
                              type="button"
                              onClick={() => handleUpdateBrandQuota(brand.brandId, -1)}
                              className="h-6 w-6 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 font-extrabold text-sm text-center">
                              {brand.weeklyCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBrandQuota(brand.brandId, 1)}
                              className="h-6 w-6 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleBrandEnabled(brand.brandId)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition ${
                              brand.enabled
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            }`}
                          >
                            {brand.enabled ? '✓ Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveBrand(brand.brandId)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                            title="Hapus brand"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Brand Form Toggle */}
              {!isAddingBrand ? (
                <button
                  type="button"
                  onClick={() => setIsAddingBrand(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-3 text-xs font-bold text-slate-600 hover:border-red-500 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Brand Baru ke Daftar Otomasi</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddBrandSubmit}
                  className="rounded-2xl border border-red-200 bg-red-50/40 p-4 dark:border-red-950/80 dark:bg-red-950/20 space-y-3"
                >
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Tambah Brand Baru
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Nama Brand
                      </label>
                      <input
                        type="text"
                        value={newBrandName}
                        onChange={e => setNewBrandName(e.target.value)}
                        placeholder="Contoh: ASLI PAY, LOGISTIK EXPRESS"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Task / Minggu
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newBrandQuota}
                        onChange={e => setNewBrandQuota(parseInt(e.target.value, 10) || 1)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Content Type
                      </label>
                      <select
                        value={newBrandContentType}
                        onChange={e => setNewBrandContentType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Video">Video</option>
                        <option value="Design">Design</option>
                        <option value="Carousel">Carousel</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingBrand(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 shadow-xs cursor-pointer"
                    >
                      Simpan Brand Baru
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TEMPLATE WORKFLOW CARD */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Konfigurasi Template Card
                </h4>
                <p className="text-xs text-slate-500">
                  Format kartu task baru yang di-generate agar selalu memiliki workflow, deadline, dan assignee yang konsisten.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Content Type Standar
                    </label>
                    <input
                      type="text"
                      value={localConfig.cardTemplate?.defaultContentType || 'Regular'}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-not-allowed"
                    />
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Otomatis: <strong>Regular</strong> (sesuai ketentuan)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Deadline Brief (Offset Hari)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={localConfig.cardTemplate?.briefDeadlineOffset ?? 2}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          cardTemplate: {
                            ...prev.cardTemplate,
                            briefDeadlineOffset: parseInt(e.target.value, 10) || 2
                          }
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      H+2 dari Senin (Rabu)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Deadline Design (Offset Hari)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={localConfig.cardTemplate?.designDeadlineOffset ?? 4}
                      onChange={e =>
                        setLocalConfig(prev => ({
                          ...prev,
                          cardTemplate: {
                            ...prev.cardTemplate,
                            designDeadlineOffset: parseInt(e.target.value, 10) || 4
                          }
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      H+4 dari Senin (Jumat)
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Steps Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Alur Workflow 4 Tahap Otomatis pada Setiap Task:
                </h4>
                <div className="space-y-2">
                  {[
                    { step: 1, name: 'Content Brief', role: 'Copywriter', desc: 'Buat brief konten (copy, angle, & visual direction)' },
                    { step: 2, name: 'Design Production', role: 'Designer', desc: 'Produksi desain berdasarkan brief yang disetujui' },
                    { step: 3, name: 'Final Approval', role: 'Creative Director', desc: 'Approval hasil desain untuk publikasi' },
                    { step: 4, name: 'Completed', role: 'Marketing Team', desc: 'Konten siap dipublikasikan ke media sosial brand' }
                  ].map(s => (
                    <div
                      key={s.step}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        {s.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</span>
                          <span className="text-xs font-semibold text-slate-400">({s.role})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RIWAYAT & AKSI MANUAL (RUN NOW) */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* Manual Action Buttons (Run Now) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                        Jalankan Generate Task Mingguan
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Membuat {totalWeeklyTasks} task baru langsung ke kolom TO DO untuk divisi ini dengan pemeriksaan anti-duplikasi.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleTriggerGenerate(false)}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isGenerating ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{isGenerating ? 'Memproses...' : 'Run Now (Standar)'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleTriggerGenerate(true)}
                      className="rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 font-bold text-[11px] py-2 px-2.5 transition cursor-pointer dark:bg-slate-800 dark:text-blue-300 dark:border-blue-800"
                      title="Generate paksa meskipun sudah ada task minggu ini"
                    >
                      Force Run
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                        Jalankan Arsip Otomatis Sekarang
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Memindai semua task berstatus DONE pada board saat ini dan memindahkannya ke tab ARCHIVE bulan berjalan.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isArchiving}
                      onClick={handleTriggerArchive}
                      className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isArchiving ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
                      <span>{isArchiving ? 'Mengarsipkan...' : 'Run Auto-Archive Now'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* History Audit Logs Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Riwayat Eksekusi Otomasi (Audit Log WIB)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {historyLogs.length} Riwayat Tercatat
                  </span>
                </div>
                {historyLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada riwayat eksekusi otomatis.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                    {historyLogs.map(log => (
                      <div key={log.id} className="p-3.5 text-xs flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-xs font-bold font-extrabold ${
                                log.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : log.status === 'skipped_duplicate'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {log.status === 'success'
                                ? '✓ SUKSES'
                                : log.status === 'skipped_duplicate'
                                ? 'DILEWATI (DUPLICATE)'
                                : 'GAGAL'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {log.type === 'weekly_generation'
                                ? 'Generate Task Mingguan'
                                : 'Automatic Archive'}
                            </span>
                            <span className="text-xs text-slate-400">• {log.divisionName}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.details}</p>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>WIB: {log.timestampWIB}</span>
                            <span>•</span>
                            <span>Trigger: {log.triggeredBy === 'cron_scheduler' ? 'Cron Scheduler' : 'Manual Admin'}</span>
                          </div>
                        </div>
                        {log.tasksAffected > 0 && (
                          <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                            +{log.tasksAffected} Tasks
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="text-[11px] text-slate-500">
            Jadwal aktif: <strong>Senin 09:00 WIB</strong> & <strong>Jumat 23:00 WIB</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition cursor-pointer active:scale-95"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

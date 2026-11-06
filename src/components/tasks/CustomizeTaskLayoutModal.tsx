import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  BarChart3,
  Search,
  Kanban,
  GitPullRequest,
  Sparkles
} from 'lucide-react';
import { soundEffects } from '../../services/soundEffects';

export type TaskWidgetKey =
  | 'executiveSummary'
  | 'productivityChart'
  | 'searchFilterBar'
  | 'taskBoard'
  | 'quickBridgeRequests';

export interface TaskWidgetConfig {
  executiveSummary: boolean;
  productivityChart: boolean;
  searchFilterBar: boolean;
  taskBoard: boolean;
  quickBridgeRequests: boolean;
  widgetOrder: TaskWidgetKey[];
  cardStyle?: 'standard' | 'detailed';
}

export const DEFAULT_TASK_WIDGET_ORDER: TaskWidgetKey[] = [
  'executiveSummary',
  'productivityChart',
  'searchFilterBar',
  'taskBoard',
  'quickBridgeRequests'
];

export const DEFAULT_TASK_WIDGET_CONFIG: TaskWidgetConfig = {
  executiveSummary: true,
  productivityChart: true,
  searchFilterBar: true,
  taskBoard: true,
  quickBridgeRequests: true,
  widgetOrder: DEFAULT_TASK_WIDGET_ORDER,
  cardStyle: 'standard'
};

interface CustomizeTaskLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TaskWidgetConfig;
  onSave: (newConfig: TaskWidgetConfig) => void;
}

const WIDGET_LABELS: Record<TaskWidgetKey, { title: string; desc: string; icon: React.ComponentType<{ className?: string }> }> = {
  executiveSummary: {
    title: 'Ringkasan Statistik & Status Tugas',
    desc: 'Menampilkan total tugas, progress, review, selesai, dan indikator keterlambatan.',
    icon: LayoutGrid
  },
  productivityChart: {
    title: 'Grafik Analitik Produktivitas & Performa',
    desc: 'Visualisasi grafik trend penyelesaian tugas dan estimasi kecepatan kerja divisi.',
    icon: BarChart3
  },
  searchFilterBar: {
    title: 'Bar Pencarian & Switcher Tampilan Board',
    desc: 'Bilah pencarian kata kunci, filter prioritas/brand, dan switcher mode tampilan.',
    icon: Search
  },
  taskBoard: {
    title: 'Papan Utama Tugas (Kanban / Tabel / Gantt)',
    desc: 'Area utama pengerjaan kartu tugas, kolom alur kerja, dan manajemen status.',
    icon: Kanban
  },
  quickBridgeRequests: {
    title: 'Ringkasan Permintaan Tugas Antar Divisi',
    desc: 'Widget akses cepat untuk memantau delegasi dan permohonan tugas dari divisi lain.',
    icon: GitPullRequest
  }
};

export const CustomizeTaskLayoutModal: React.FC<CustomizeTaskLayoutModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [localConfig, setLocalConfig] = useState<TaskWidgetConfig>(() => {
    const order = config?.widgetOrder && config.widgetOrder.length > 0 ? config.widgetOrder : DEFAULT_TASK_WIDGET_ORDER;
    const sanitizedOrder = Array.from(new Set([...order, ...DEFAULT_TASK_WIDGET_ORDER])).filter(k => DEFAULT_TASK_WIDGET_ORDER.includes(k));
    return {
      ...DEFAULT_TASK_WIDGET_CONFIG,
      ...config,
      widgetOrder: sanitizedOrder
    };
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sync state whenever modal is opened with new props
  useEffect(() => {
    if (isOpen) {
      const order = config?.widgetOrder && config.widgetOrder.length > 0 ? config.widgetOrder : DEFAULT_TASK_WIDGET_ORDER;
      const sanitizedOrder = Array.from(new Set([...order, ...DEFAULT_TASK_WIDGET_ORDER])).filter(k => DEFAULT_TASK_WIDGET_ORDER.includes(k));
      setLocalConfig({
        ...DEFAULT_TASK_WIDGET_CONFIG,
        ...config,
        widgetOrder: sanitizedOrder
      });
    }
  }, [isOpen, config]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleWidget = (key: TaskWidgetKey) => {
    // Task board cannot be hidden to prevent empty screen
    if (key === 'taskBoard') return;

    soundEffects.playChatSound();
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...localConfig.widgetOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    soundEffects.playChatSound();
    setLocalConfig(prev => ({
      ...prev,
      widgetOrder: newOrder
    }));
  };

  const handleDropReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const newOrder = [...localConfig.widgetOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);

    soundEffects.playChatSound();
    setLocalConfig(prev => ({
      ...prev,
      widgetOrder: newOrder
    }));
  };

  const applyPreset = (preset: 'default' | 'production' | 'analytics') => {
    soundEffects.playEmojiPopSound();
    if (preset === 'default') {
      setLocalConfig({ ...DEFAULT_TASK_WIDGET_CONFIG });
    } else if (preset === 'production') {
      setLocalConfig({
        executiveSummary: true,
        productivityChart: false,
        searchFilterBar: true,
        taskBoard: true,
        quickBridgeRequests: true,
        widgetOrder: ['searchFilterBar', 'taskBoard', 'executiveSummary', 'quickBridgeRequests', 'productivityChart']
      });
    } else if (preset === 'analytics') {
      setLocalConfig({
        executiveSummary: true,
        productivityChart: true,
        searchFilterBar: true,
        taskBoard: true,
        quickBridgeRequests: false,
        widgetOrder: ['productivityChart', 'executiveSummary', 'searchFilterBar', 'taskBoard', 'quickBridgeRequests']
      });
    }
  };

  const handleSave = () => {
    soundEffects.playNotificationSound();
    onSave(localConfig);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Kustomisasi Tata Letak Widget Task Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur urutan tampilan dan aktifkan/nonaktifkan modul widget sesuai kenyamanan kerja Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 shrink-0 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Preset Tata Letak Cepat:
            </span>
            <span className="text-[11px] text-slate-400">Klik untuk menerapkan urutan instan</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-red-500 hover:text-red-600 transition active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <LayoutGrid className="h-3 w-3 text-red-500" />
              <span>Standar Lengkap</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('production')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Kanban className="h-3 w-3 text-blue-500" />
              <span>Fokus Eksekusi Board</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('analytics')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-500 hover:text-purple-600 transition active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <BarChart3 className="h-3 w-3 text-purple-500" />
              <span>Prioritas Analitik</span>
            </button>
          </div>
        </div>

        {/* Card Style Selector: Standar vs Detail */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Format Tampilan Card Kanban
            </span>
            <span className="text-[11px] text-slate-500">
              Pilih gaya kartu tugas di board
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setLocalConfig(prev => ({ ...prev, cardStyle: 'standard' }))}
              className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                (localConfig.cardStyle || 'standard') === 'standard'
                  ? 'border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                <Kanban className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Card Versi Standar (Rekomendasi)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sesuai referensi: Brand badge, judul, kategori & tanggal publish, avatar, dan H-deadline. Ringkas & bebas bloat.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setLocalConfig(prev => ({ ...prev, cardStyle: 'detailed' }))}
              className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                localConfig.cardStyle === 'detailed'
                  ? 'border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                <Sliders className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>Card Versi Lengkap</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dilengkapi widget progress bar, hitungan komentar & lampiran, scene video, dan tombol aksi approval langsung.
              </p>
            </button>
          </div>
        </div>

        {/* Reorderable Widget Items List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Daftar Widget ({localConfig.widgetOrder.length}) — Bisa digeser / klik panah</span>
            <span>Status & Urutan</span>
          </div>

          {localConfig.widgetOrder.map((key, index) => {
            const info = WIDGET_LABELS[key];
            if (!info) return null;
            const Icon = info.icon;
            const isEnabled = localConfig[key];
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.setData('text/plain', String(index));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) {
                    setDragOverIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = draggedIndex ?? Number(e.dataTransfer.getData('text/plain'));
                  handleDropReorder(from, index);
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  isDragging ? 'opacity-40 scale-98 border-dashed border-red-400' : ''
                } ${
                  isDragOver ? 'ring-2 ring-red-500 border-red-500 bg-red-50/20' : ''
                } ${
                  isEnabled
                    ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs'
                    : 'border-slate-200/60 bg-slate-50/70 dark:border-slate-800/40 dark:bg-slate-900/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Tahan dan geser untuk mengatur urutan"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                    isEnabled
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {info.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {info.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Up / Down Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveWidget(index, 'up')}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                      title="Pindahkan Ke Atas"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === localConfig.widgetOrder.length - 1}
                      onClick={() => moveWidget(index, 'down')}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
                      title="Pindahkan Ke Bawah"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    disabled={key === 'taskBoard'}
                    onClick={() => toggleWidget(key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                    } ${key === 'taskBoard' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={key === 'taskBoard' ? 'Papan tugas utama wajib ditampilkan' : 'Aktifkan/Nonaktifkan Widget'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEffects.playEmojiPopSound();
              setLocalConfig({ ...DEFAULT_TASK_WIDGET_CONFIG });
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Standar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Tata Letak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

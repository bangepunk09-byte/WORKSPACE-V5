import React, { useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { Task } from '../../types';

interface TaskExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onImportTasks: (newTasks: Partial<Task>[]) => void;
}

export const TaskExportImportModal: React.FC<TaskExportImportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportTasks
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [defaultExportFontWeight, setDefaultExportFontWeight] = useState<'bold' | 'regular'>('bold');
  
  // Import states
  const [importFormat, setImportFormat] = useState<'csv' | 'excel'>('csv');
  const [parsedPreview, setParsedPreview] = useState<Partial<Task>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [overrideFontWeight, setOverrideFontWeight] = useState<'keep' | 'bold' | 'regular'>('keep');

  if (!isOpen) return null;

  // Helper to parse CSV line
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((c === ',' || c === '\t') && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  };

  // Export handler
  const handleExport = () => {
    const headers = [
      'Task ID',
      'Title',
      'Title Font Weight',
      'Brand',
      'Content Type',
      'Priority',
      'Status',
      'Assignee',
      'Deadline',
      'Publish Date',
      'Description'
    ];

    const rows = tasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.titleFontWeight || defaultExportFontWeight,
      `"${(t.brand || 'ASLI RI').replace(/"/g, '""')}"`,
      `"${(t.contentType || 'Regular').replace(/"/g, '""')}"`,
      t.priority || 'medium',
      t.status || 'todo',
      `"${(t.assigneeName || 'Kiki Pratama').replace(/"/g, '""')}"`,
      t.deadline || '',
      t.publishDate || '',
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: exportFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = exportFormat === 'csv' ? `task_export_${dateStr}.csv` : `task_export_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) {
        setIsParsing(false);
        return;
      }

      const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setParsedPreview([]);
        setIsParsing(false);
        return;
      }

      const rawHeaders = lines[0].split(/,|\t/).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      
      const titleIdx = rawHeaders.findIndex(h => h.includes('title') && !h.includes('font') && !h.includes('weight'));
      const fontWeightIdx = rawHeaders.findIndex(h => h.includes('font') || h.includes('weight'));
      const brandIdx = rawHeaders.findIndex(h => h.includes('brand'));
      const contentTypeIdx = rawHeaders.findIndex(h => h.includes('content') || h.includes('type'));
      const priorityIdx = rawHeaders.findIndex(h => h.includes('priority'));
      const statusIdx = rawHeaders.findIndex(h => h.includes('status'));
      const assigneeIdx = rawHeaders.findIndex(h => h.includes('assignee') || h.includes('member'));
      const deadlineIdx = rawHeaders.findIndex(h => h.includes('deadline'));
      const publishIdx = rawHeaders.findIndex(h => h.includes('publish'));
      const descIdx = rawHeaders.findIndex(h => h.includes('desc') || h.includes('description'));

      const parsed: Partial<Task>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (!values || values.length === 0) continue;

        const title = titleIdx !== -1 && values[titleIdx] ? values[titleIdx] : values[1] || values[0] || `Imported Task ${i}`;
        const rawFont = fontWeightIdx !== -1 && values[fontWeightIdx] ? values[fontWeightIdx].toLowerCase() : 'bold';
        const titleFontWeight: 'bold' | 'regular' = rawFont.includes('regular') || rawFont.includes('normal') ? 'regular' : 'bold';

        parsed.push({
          title,
          titleFontWeight,
          brand: brandIdx !== -1 && values[brandIdx] ? values[brandIdx] : 'ASLI RI',
          contentType: contentTypeIdx !== -1 && values[contentTypeIdx] ? values[contentTypeIdx] : 'Regular',
          priority: (priorityIdx !== -1 && values[priorityIdx] ? values[priorityIdx].toLowerCase() : 'medium') as any,
          status: (statusIdx !== -1 && values[statusIdx] ? values[statusIdx].toLowerCase() : 'todo') as any,
          assigneeName: assigneeIdx !== -1 && values[assigneeIdx] ? values[assigneeIdx] : 'Kiki Pratama',
          deadline: deadlineIdx !== -1 && values[deadlineIdx] ? values[deadlineIdx] : '2026-11-20',
          publishDate: publishIdx !== -1 && values[publishIdx] ? values[publishIdx] : '20 Nov 2026',
          description: descIdx !== -1 && values[descIdx] ? values[descIdx] : ''
        });
      }

      setParsedPreview(parsed);
      setIsParsing(false);
    };

    reader.readAsText(file);
  };

  // Submit import handler
  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;

    const finalTasks = parsedPreview.map(t => ({
      ...t,
      titleFontWeight: overrideFontWeight === 'keep' ? (t.titleFontWeight || 'bold') : overrideFontWeight
    }));

    onImportTasks(finalTasks);
    setImportSuccessMsg(`🎉 Berhasil mengimpor ${finalTasks.length} task ke dashboard! Format font disesuaikan.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Export & Import Data Task (CSV & Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur format font (Bold / Regular) langsung dari file CSV/Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export Task ke File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Import File Balik ke Dashboard</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="mt-5 space-y-4 text-xs">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                1. Pilih Format File Export:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setExportFormat('csv')}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    exportFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 font-bold'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-700'
                  }`}
                >
                  <input type="radio" checked={exportFormat === 'csv'} onChange={() => {}} className="text-blue-600" />
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div>Format CSV (.csv)</div>
                    <div className="text-[11px] text-slate-400 font-normal">Kompatibel universal & Google Sheets</div>
                  </div>
                </label>

                <label
                  onClick={() => setExportFormat('excel')}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    exportFormat === 'excel'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200 font-bold'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-700'
                  }`}
                >
                  <input type="radio" checked={exportFormat === 'excel'} onChange={() => {}} className="text-blue-600" />
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <div>
                    <div>Format Excel (.xlsx)</div>
                    <div className="text-[11px] text-slate-400 font-normal">Kompatibel Microsoft Excel</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Default Font Weight Column Setting */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                2. Status Coloumn Font Weight (`Title Font Weight`):
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kolom `Title Font Weight` di file export menyimpan style font (`bold` atau `regular`). Anda bisa mengubah isi kolom ini di Excel/CSV lalu mengimpornya kembali.
              </p>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="fontWeightExport"
                    checked={defaultExportFontWeight === 'bold'}
                    onChange={() => setDefaultExportFontWeight('bold')}
                    className="text-blue-600"
                  />
                  <span>Default Bold (`bold`)</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="fontWeightExport"
                    checked={defaultExportFontWeight === 'regular'}
                    onChange={() => setDefaultExportFontWeight('regular')}
                    className="text-blue-600"
                  />
                  <span>Default Regular (`regular`)</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh File Export ({tasks.length} Task)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Format Picker */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-slate-800 dark:text-slate-200">Pilih Format File Upload:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    checked={importFormat === 'csv'}
                    onChange={() => setImportFormat('csv')}
                    className="text-blue-600"
                  />
                  <span>Format CSV (.csv)</span>
                </label>
                <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    checked={importFormat === 'excel'}
                    onChange={() => setImportFormat('excel')}
                    className="text-blue-600"
                  />
                  <span>Format Excel (.xlsx / .xls)</span>
                </label>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center dark:border-slate-700 hover:border-blue-500 transition">
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Pilih atau Tarik File {importFormat.toUpperCase()} Ke Sini
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Mendukung file .csv, .xlsx, .xls yang memiliki kolom `Title`, `Title Font Weight`, `Brand`, `Status`, `Assignee`
              </p>
              <input
                type="file"
                accept={importFormat === 'csv' ? '.csv, .txt' : '.xlsx, .xls, .csv'}
                onChange={handleFileChange}
                className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {/* Dynamic Font Weight Override Option */}
            {parsedPreview.length > 0 && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Atur Font Title Saat Import:</span>
                  <span className="text-[11px] font-normal text-indigo-700 dark:text-indigo-400">
                    {parsedPreview.length} task terdeteksi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="fontOverride"
                      checked={overrideFontWeight === 'keep'}
                      onChange={() => setOverrideFontWeight('keep')}
                      className="text-blue-600"
                    />
                    <span>Gunakan Kolom File (`bold` / `regular`)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="fontOverride"
                      checked={overrideFontWeight === 'bold'}
                      onChange={() => setOverrideFontWeight('bold')}
                      className="text-blue-600"
                    />
                    <span>Paksa Semua Bold</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="fontOverride"
                      checked={overrideFontWeight === 'regular'}
                      onChange={() => setOverrideFontWeight('regular')}
                      className="text-blue-600"
                    />
                    <span>Paksa Semua Regular</span>
                  </label>
                </div>
              </div>
            )}

            {/* Preview Table */}
            {parsedPreview.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Pratinjau Data Import:</div>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">Judul Task</th>
                        <th className="p-2">Font Weight</th>
                        <th className="p-2">Brand</th>
                        <th className="p-2">Assignee</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedPreview.map((t, idx) => {
                        const effectiveFont = overrideFontWeight === 'keep' ? (t.titleFontWeight || 'bold') : overrideFontWeight;
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className={`p-2 ${effectiveFont === 'bold' ? 'font-bold' : 'font-normal'}`}>
                              {t.title}
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${effectiveFont === 'bold' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                                {effectiveFont}
                              </span>
                            </td>
                            <td className="p-2 font-medium">{t.brand}</td>
                            <td className="p-2 font-medium">{t.assigneeName}</td>
                            <td className="p-2 font-bold uppercase text-slate-500">{t.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importSuccessMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                <Check className="h-4 w-4 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedPreview.length === 0 || isParsing}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                Impor Data Balik ke Dashboard ({parsedPreview.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

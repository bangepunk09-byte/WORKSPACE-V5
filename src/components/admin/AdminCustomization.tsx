import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { modernDb } from '../../services/modernDatabase';
import {
  ShieldCheck,
  Building2,
  Users,
  Palette,
  Database,
  Lock,
  Check,
  CheckCircle2,
  Sliders,
  Upload,
  UserX,
  UserCheck,
  Trash2,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Circle,
  ArrowRight,
  Eye,
  ChevronRight,
  History,
  TrendingUp,
  Activity,
  Server,
  Image as ImageIcon,
  Zap,
  Calendar,
  MessageSquare,
  Type,
  RotateCcw,
  HardDrive,
  Cloud,
  Download,
  Tag,
  Globe,
  Edit2,
  Plus
} from 'lucide-react';
import Papa from 'papaparse';
import { AccentColor, UserRole, WorkspaceInfo } from '../../types';

export const AdminCustomization: React.FC = () => {
  const {
    currentUser,
    users,
    workspaceInfo,
    updateWorkspaceInfo,
    updateUserRole,
    toggleUserActiveStatus,
    deleteUser,
    themeSettings,
    updateThemeSettings,
    setThemeMode,
    themeMode,
    setIsDbHubOpen,
    pendingApprovals,
    approveUserRegistration,
    rejectUserRegistration,
    auditLogs,
    tasks,
    documents,
    resetAllData,
    managedBrands,
    addManagedBrand,
    updateManagedBrand,
    deleteManagedBrand,
    setIsBrandModalOpen,
    setEditingBrand
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'workspace' | 'brands' | 'roles' | 'approvals' | 'theme' | 'database' | 'audit' | 'metrics' | 'copywriting'>('workspace');
  const [auditSearch, setAuditSearch] = useState('');

  const [wsName, setWsName] = useState(workspaceInfo.name);
  const [wsTagline, setWsTagline] = useState(workspaceInfo.tagline);
  const [wsDomain, setWsDomain] = useState(workspaceInfo.orgDomain);
  const [wsLogoUrl, setWsLogoUrl] = useState(workspaceInfo.logoUrl || '');
  const [wsLoginBgStyle, setWsLoginBgStyle] = useState<WorkspaceInfo['loginBgStyle']>(workspaceInfo.loginBgStyle || 'radiant-journey');
  const [wsLoginBgCustomUrl, setWsLoginBgCustomUrl] = useState(workspaceInfo.loginBgCustomUrl || '');
  const [wsLoginBgBlur, setWsLoginBgBlur] = useState<number>(workspaceInfo.loginBgBlur ?? 0);
  const [wsLoginBgOverlayOpacity, setWsLoginBgOverlayOpacity] = useState<number>(workspaceInfo.loginBgOverlayOpacity ?? 0);
  const [wsLoginBannerBadge, setWsLoginBannerBadge] = useState<string>(workspaceInfo.loginBannerBadge || 'Join Us to Build 🤩');
  const [wsLoginBannerHeadline, setWsLoginBannerHeadline] = useState<string>(workspaceInfo.loginBannerHeadline || 'Start your Journey');
  const [wsLoginBannerSubtitle, setWsLoginBannerSubtitle] = useState<string>(workspaceInfo.loginBannerSubtitle || 'Follow these simple steps to set up your account.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Theme interaction draft states (Live preview sandbox before apply)
  const [draftButtonHoverColor, setDraftButtonHoverColor] = useState<string>(
    themeSettings.buttonHoverColor || '#1e293b'
  );
  const [draftSelectorActiveColor, setDraftSelectorActiveColor] = useState<string>(
    themeSettings.selectorActiveColor || '#0f172a'
  );
  const [draftIconAccentColor, setDraftIconAccentColor] = useState<string>(
    themeSettings.iconAccentColor || '#dc2626'
  );
  const [themeAppliedSuccess, setThemeAppliedSuccess] = useState(false);
  const [previewActiveTab, setPreviewActiveTab] = useState<'ringkasan' | 'aktivitas' | 'laporan'>('ringkasan');
  const [isHoveringPreviewBtn, setIsHoveringPreviewBtn] = useState(false);
  const [isHoveringPreviewSecBtn, setIsHoveringPreviewSecBtn] = useState(false);

  const interactionPresets = [
    {
      name: 'Corporate Navy',
      hover: '#1e293b',
      selector: '#0f172a',
      icon: '#dc2626'
    },
    {
      name: 'Tech Sapphire',
      hover: '#1d4ed8',
      selector: '#1e40af',
      icon: '#2563eb'
    },
    {
      name: 'Forest Emerald',
      hover: '#047857',
      selector: '#065f46',
      icon: '#059669'
    },
    {
      name: 'Executive Violet',
      hover: '#6d28d9',
      selector: '#5b21b6',
      icon: '#7c3aed'
    },
    {
      name: 'Amber Gold',
      hover: '#b45309',
      selector: '#92400e',
      icon: '#d97706'
    },
    {
      name: 'Slate Modern',
      hover: '#334155',
      selector: '#1e293b',
      icon: '#64748b'
    },
    {
      name: 'Obsidian Sapphire',
      hover: '#1e3a8a',
      selector: '#09090b',
      icon: '#3b82f6',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #1e3a8a 100%)'
    },
    {
      name: 'Obsidian Emerald',
      hover: '#047857',
      selector: '#09090b',
      icon: '#10b981',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #064e3b 50%, #047857 100%)'
    },
    {
      name: 'Obsidian Ruby',
      hover: '#881337',
      selector: '#09090b',
      icon: '#f43f5e',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #4c0519 50%, #881337 100%)'
    },
    {
      name: 'Obsidian Amethyst',
      hover: '#581c87',
      selector: '#09090b',
      icon: '#c084fc',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #3b0764 50%, #581c87 100%)'
    },
    {
      name: 'Obsidian Bronze',
      hover: '#78350f',
      selector: '#09090b',
      icon: '#f59e0b',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #09090b 0%, #451a03 50%, #78350f 100%)'
    },
    {
      name: 'Obsidian Carbon',
      hover: '#27272a',
      selector: '#09090b',
      icon: '#e4e4e7',
      isGradient: true,
      gradientCss: 'linear-gradient(135deg, #0f172a 0%, #18181b 50%, #27272a 100%)'
    }
  ];

  const handleSelectInteractionPreset = (preset: typeof interactionPresets[0]) => {
    setDraftButtonHoverColor(preset.hover);
    setDraftSelectorActiveColor(preset.selector);
    setDraftIconAccentColor(preset.icon);
    updateThemeSettings({
      buttonHoverColor: preset.hover,
      selectorActiveColor: preset.selector,
      iconAccentColor: preset.icon
    });
    setThemeAppliedSuccess(true);
    setTimeout(() => setThemeAppliedSuccess(false), 2500);
  };

  const handleApplyInteractionTheme = () => {
    updateThemeSettings({
      buttonHoverColor: draftButtonHoverColor,
      selectorActiveColor: draftSelectorActiveColor,
      iconAccentColor: draftIconAccentColor
    });
    setThemeAppliedSuccess(true);
    setTimeout(() => setThemeAppliedSuccess(false), 3500);
  };

  const handleResetToCurrent = () => {
    setDraftButtonHoverColor(themeSettings.buttonHoverColor || '#1e293b');
    setDraftSelectorActiveColor(themeSettings.selectorActiveColor || '#0f172a');
    setDraftIconAccentColor(themeSettings.iconAccentColor || '#dc2626');
  };

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdminOrSuper = isSuperAdmin || currentUser.role === 'admin';

  const accentColorPresets: { id: AccentColor; name: string; primary: string; accent: string }[] = [
    { id: 'navy-crimson', name: 'Corporate Navy & Crimson', primary: 'bg-slate-900', accent: 'bg-red-600' },
    { id: 'royal-blue', name: 'Royal Blue & Sky Accent', primary: 'bg-blue-900', accent: 'bg-blue-600' },
    { id: 'emerald', name: 'Deep Forest & Emerald Accent', primary: 'bg-emerald-950', accent: 'bg-emerald-600' },
    { id: 'purple', name: 'Executive Midnight & Royal Violet', primary: 'bg-purple-950', accent: 'bg-purple-600' },
    { id: 'amber', name: 'Warm Amber & Gold Prestige', primary: 'bg-amber-950', accent: 'bg-amber-500' }
  ];

  const handleSaveWorkspaceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceInfo({
      name: wsName.trim(),
      tagline: wsTagline.trim(),
      orgDomain: wsDomain.trim(),
      logoUrl: wsLogoUrl.trim(),
      loginBgStyle: wsLoginBgStyle,
      loginBgCustomUrl: wsLoginBgCustomUrl.trim(),
      loginBgBlur: wsLoginBgBlur,
      loginBgOverlayOpacity: wsLoginBgOverlayOpacity,
      loginBannerBadge: wsLoginBannerBadge.trim(),
      loginBannerHeadline: wsLoginBannerHeadline.trim(),
      loginBannerSubtitle: wsLoginBannerSubtitle.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setWsLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setWsLoginBgCustomUrl(reader.result);
          setWsLoginBgStyle('custom-image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Warning */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 whitespace-nowrap">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              <span>Panel Administrasi & Kustomisasi UI</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                isSuperAdmin
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Role Anda: {currentUser.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tab switcher with spacious slider track */}
        <div className="mt-5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-x-auto tab-slider-scroll pt-1 pb-3.5 px-1">
            {[
              { id: 'workspace', label: 'Pengaturan Workspace (Nama & Logo)', icon: Building2 },
              { id: 'brands', label: `Label Brand & Klien (${managedBrands.length})`, icon: Tag },
              { id: 'roles', label: 'Manajemen Role (RBAC)', icon: Users },
              { id: 'approvals', label: `Persetujuan Akun ${pendingApprovals.length > 0 ? `(${pendingApprovals.length})` : ''}`, icon: ShieldCheck },
              { id: 'theme', label: 'Tema & Aksen UI', icon: Palette },
              { id: 'database', label: 'Basis Data & Cloud Sync', icon: Database },
              { id: 'audit', label: 'Audit Log Sistem', icon: Activity },
              { id: 'metrics', label: 'Metrik Penggunaan', icon: Server },
              { id: 'copywriting', label: 'Copywriting (CSV)', icon: Type }
            ].map(tabItem => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveTab(tabItem.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'theme-active-selector font-bold shadow-xs border'
                      : 'interactive-hover-btn text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--selector-active-color, #0f172a)',
                          borderColor: 'var(--selector-active-color, #0f172a)',
                          color: '#ffffff'
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="h-4 w-4"
                    style={
                      isActive
                        ? { color: 'var(--icon-accent-color, #dc2626)' }
                        : undefined
                    }
                  />
                  <span>{tabItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 0: PENGATURAN WORKSPACE (NAMA & LOGO) */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!isSuperAdmin ? (
            <div className="lg:col-span-2 rounded-3xl border border-amber-200 bg-amber-50/70 p-8 text-center dark:border-amber-900/60 dark:bg-amber-950/30 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Otoritas Khusus Super Admin
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Hanya akun dengan hak akses <strong>Super Admin</strong> yang berwenang mengubah nama perusahaan, slogan, domain email korporat, logo, dan background login portal.
              </p>
            </div>
          ) : (
          <form
            onSubmit={handleSaveWorkspaceSettings}
            className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Identitas & Branding Workspace
              </h3>
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Pengaturan Workspace berhasil disimpan dan diterapkan secara real-time!</span>
              </div>
            )}

            {/* Nama Workspace */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Workspace / Perusahaan
              </label>
              <input
                type="text"
                required
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                placeholder="cth: WORKSPACE Corp, PT Asli Rancangan Indonesia"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Tagline / Deskripsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Slogan / Tagline Perusahaan
              </label>
              <input
                type="text"
                value={wsTagline}
                onChange={e => setWsTagline(e.target.value)}
                placeholder="cth: Enterprise Digital Collaboration Hub & Secure Operating System"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Domain Email Korporat */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Domain Email Kantor
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">@</span>
                <input
                  type="text"
                  value={wsDomain}
                  onChange={e => setWsDomain(e.target.value)}
                  placeholder="asliri.id atau workspace.corp"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Logo Settings */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Logo Workspace
              </label>

              {/* Upload file simulation */}
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Upload className="h-4 w-4 text-red-500" />
                  <span>Unggah File Logo (PNG/SVG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar logo..."
                    value={wsLogoUrl}
                    onChange={e => setWsLogoUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                  {wsLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setWsLogoUrl('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-red-500"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Kustomisasi Background & Visual Halaman Login (Super Admin Exclusive) */}
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Visual & Banner Halaman Login (Super Admin Exclusive)
                    </h4>
                  </div>
                </div>
                <span className="rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 text-[10px] font-bold border border-red-200 dark:border-red-900">
                  Super Admin Only
                </span>
              </div>

              {/* Preset Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'radiant-journey',
                    name: 'Radiant Sapphire (Default)',
                    desc: 'Gradien biru cerah sesuai referensi',
                    preview: 'bg-gradient-to-b from-blue-600 via-blue-500 to-sky-400 border border-blue-400'
                  },
                  {
                    id: 'deep-navy',
                    name: 'Deep Navy Corporate',
                    desc: 'Navy gelap elegan & minimalis',
                    preview: 'bg-slate-950 border border-slate-800'
                  },
                  {
                    id: 'aurora',
                    name: 'Aurora & Cyan Glow',
                    desc: 'Pendaran neon kosmik modern',
                    preview: 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border border-cyan-800'
                  },
                  {
                    id: 'geometric-grid',
                    name: 'Cyber Grid & Dot Matrix',
                    desc: 'Pola geometris teknologi',
                    preview: 'bg-slate-900 border border-indigo-900'
                  },
                  {
                    id: 'modern-office',
                    name: 'Arsitektur Gedung Kantor',
                    desc: 'Gedung kaca modern korporat',
                    preview: 'bg-slate-800'
                  },
                  {
                    id: 'custom-image',
                    name: 'Upload / Custom Image',
                    desc: 'Unggah file gambar dari disk atau URL',
                    preview: 'bg-slate-800 border-dashed border-2 border-blue-500/50'
                  }
                ].map(item => {
                  const isSelected = wsLoginBgStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWsLoginBgStyle(item.id as WorkspaceInfo['loginBgStyle'])}
                      className={`flex flex-col text-left p-3 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/40 ring-1 ring-blue-500 font-bold'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className={`h-8 w-full rounded-xl mb-2 ${item.preview} shadow-2xs`} />
                      <span className="text-xs text-slate-900 dark:text-white font-semibold">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Upload Gambar Lokal atau URL Kustom */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5 text-blue-600" />
                    <span>Unggah Gambar Background / Banner Kustom:</span>
                  </label>
                  {wsLoginBgCustomUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setWsLoginBgCustomUrl('');
                        setWsLoginBgStyle('radiant-journey');
                      }}
                      className="text-[11px] text-red-500 hover:underline cursor-pointer"
                    >
                      Hapus Gambar Kustom
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Pilih file gambar dari komputer:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLoginBannerFileUpload}
                      className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Atau tempel URL gambar (Unsplash / CDN):
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={wsLoginBgCustomUrl}
                      onChange={e => {
                        setWsLoginBgCustomUrl(e.target.value);
                        if (e.target.value) setWsLoginBgStyle('custom-image');
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </div>
                </div>

                {wsLoginBgCustomUrl && (
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <img
                      src={wsLoginBgCustomUrl}
                      alt="Banner Preview"
                      className="h-10 w-20 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Gambar kustom aktif dan diterapkan ke panel kiri login
                    </span>
                  </div>
                )}
              </div>

              {/* Kustomisasi Teks Banner (Badge, Headline, Subtitle) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Teks (Pill)
                  </label>
                  <input
                    type="text"
                    value={wsLoginBannerBadge}
                    onChange={e => setWsLoginBannerBadge(e.target.value)}
                    placeholder="Join Us to Build 🤩"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Utama (Headline)
                  </label>
                  <input
                    type="text"
                    value={wsLoginBannerHeadline}
                    onChange={e => setWsLoginBannerHeadline(e.target.value)}
                    placeholder="Start your Journey"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sub-Judul (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={wsLoginBannerSubtitle}
                    onChange={e => setWsLoginBannerSubtitle(e.target.value)}
                    placeholder="Follow these simple steps..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Sliders: Blur & Overlay Darkness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>Efek Blur Background:</span>
                    <span className="font-mono text-blue-600">{wsLoginBgBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={wsLoginBgBlur}
                    onChange={e => setWsLoginBgBlur(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">0px (tajam) hingga 20px (sangat halus)</span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span>Kegelapan Overlay:</span>
                    <span className="font-mono text-blue-600">{wsLoginBgOverlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={wsLoginBgOverlayOpacity}
                    onChange={e => setWsLoginBgOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">Menjaga teks login tetap memiliki kontras tinggi</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-black transition active:scale-95 cursor-pointer dark:bg-white dark:text-slate-950"
              >
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Simpan Konfigurasi Workspace & Login Page</span>
              </button>
            </div>
          </form>
          )}

          {/* Live Preview Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pratinjau Split-Card Login Real-Time
            </h3>

            {/* Split Card Mockup Matching image_715c3325.png */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 min-h-[260px]">
                {/* Left Mini Banner */}
                <div
                  className="col-span-5 p-4 flex flex-col justify-between relative overflow-hidden text-white"
                  style={{
                    background: wsLoginBgStyle === 'custom-image' && wsLoginBgCustomUrl
                      ? `url(${wsLoginBgCustomUrl}) center/cover no-repeat`
                      : wsLoginBgStyle === 'deep-navy'
                      ? 'linear-gradient(135deg, #0b132b, #1c2541)'
                      : wsLoginBgStyle === 'aurora'
                      ? 'linear-gradient(135deg, #0f172a, #0369a1)'
                      : wsLoginBgStyle === 'geometric-grid'
                      ? '#0f172a'
                      : 'linear-gradient(180deg, #1b50e2 0%, #2161f5 50%, #0ea5e9 100%)'
                  }}
                >
                  {wsLoginBgOverlayOpacity > 0 && (
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: wsLoginBgOverlayOpacity / 100 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center text-[10px]">
                      ❖
                    </div>
                    <span className="text-[11px] font-black">{wsName ? wsName.toLowerCase() : 'ninth'}</span>
                  </div>

                  <div className="relative z-10 my-auto py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[8px] font-bold mb-1">
                      {wsLoginBannerBadge}
                    </span>
                    <h5 className="text-xs font-black leading-tight text-white">
                      {wsLoginBannerHeadline}
                    </h5>
                    <p className="text-[8px] text-blue-100/80 leading-tight mt-0.5 line-clamp-2">
                      {wsLoginBannerSubtitle}
                    </p>
                  </div>

                  <div className="relative z-10 grid grid-cols-3 gap-1 pt-1">
                    <div className="rounded-lg bg-white p-1 text-slate-900 text-[8px] flex flex-col justify-between h-10 shadow-xs">
                      <span className="h-3 w-3 rounded-full bg-blue-600 text-white text-[7px] font-bold flex items-center justify-center">1</span>
                      <span className="font-bold leading-none text-[7px]">Register</span>
                    </div>
                    <div className="rounded-lg bg-white/20 p-1 text-white text-[8px] flex flex-col justify-between h-10">
                      <span className="h-3 w-3 rounded-full bg-white/20 text-white text-[7px] flex items-center justify-center">2</span>
                      <span className="leading-none text-[7px] text-white/80">Profile</span>
                    </div>
                    <div className="rounded-lg bg-white/20 p-1 text-white text-[8px] flex flex-col justify-between h-10">
                      <span className="h-3 w-3 rounded-full bg-white/20 text-white text-[7px] flex items-center justify-center">3</span>
                      <span className="leading-none text-[7px] text-white/80">Verify</span>
                    </div>
                  </div>
                </div>

                {/* Right Mini Form */}
                <div className="col-span-7 bg-white dark:bg-slate-900 p-4 flex flex-col justify-center space-y-2">
                  <div className="text-center">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">Join Us</h5>
                  </div>
                  <div className="h-5 rounded-md bg-slate-100 dark:bg-slate-800 px-2 flex items-center text-[8px] text-slate-500">
                    🇮🇩 +62 812 3456 7890
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="h-5 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 flex items-center text-[7px] text-slate-500 truncate">
                      Juliette Karapetyan
                    </div>
                    <div className="h-5 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 flex items-center text-[7px] text-slate-500 truncate">
                      julietux ✓
                    </div>
                  </div>
                  <div className="h-5 rounded-md bg-slate-100 dark:bg-slate-800 px-2 flex items-center text-[8px] text-slate-500">
                    ••••••••••••
                  </div>
                  <div className="h-6 rounded-md bg-[#1f5bf0] text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                    Continue
                  </div>
                  <div className="h-5 rounded-md border border-slate-200 dark:border-slate-700 text-[8px] font-semibold flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300">
                    <span className="text-[9px]">G</span> Sign up with Google
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 text-xs text-slate-500 space-y-1">
              <div>Workspace: <strong>{wsName || 'ASLI GROUP'}</strong></div>
              <div>Domain: <strong>@{wsDomain || 'asliri.id'}</strong></div>
              <div>Style Banner Login: <strong className="capitalize">{wsLoginBgStyle}</strong></div>
              <div>Otoritas Pengaturan: <strong className="text-red-600">Super Admin Only</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BRAND & COMPANY LABEL MANAGEMENT */}
      {activeTab === 'brands' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Portofolio & Label Manajemen Brand Perusahaan
                  </h3>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBrand(null);
                setIsBrandModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Brand Baru</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Total Brand Terdaftar</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{managedBrands.length}</span>
                <span className="text-xs font-bold text-emerald-600">Aktif & Siap Digunakan</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Total Tugas dengan Label Brand</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {tasks.filter(t => t.brand || t.brandId).length}
                </span>
                <span className="text-xs font-bold text-blue-600">Tugas Terhubung</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Brand Utama Sistem</span>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600 shrink-0" />
                <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {managedBrands.find(b => b.isDefault)?.name || managedBrands[0]?.name || 'Asli RI'}
                </span>
              </div>
            </div>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managedBrands.map(brand => {
              const brandTaskCount = tasks.filter(
                t => t.brand === brand.name || t.brandId === brand.id
              ).length;

              return (
                <div
                  key={brand.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Brand Logo Display */}
                        <div className="relative shrink-0">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-2xs"
                            />
                          ) : (
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black text-white shadow-2xs"
                              style={{ backgroundColor: brand.color }}
                            >
                              {brand.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span
                            className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                            style={{ backgroundColor: brand.color }}
                            title={`Aksen: ${brand.color}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {brand.name}
                            </h4>
                            {brand.code && (
                              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-black text-slate-600 dark:text-slate-300">
                                {brand.code}
                              </span>
                            )}
                            {brand.isDefault && (
                              <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.5 text-[9px] font-bold">
                                Utama
                              </span>
                            )}
                          </div>
                          <span
                            className="inline-block mt-1 rounded-md px-2 py-0.5 text-[10px] font-bold border"
                            style={{
                              color: brand.color,
                              borderColor: `${brand.color}35`,
                              backgroundColor: `${brand.color}15`
                            }}
                          >
                            {brand.category || 'General Client'}
                          </span>
                        </div>
                      </div>

                      <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 shrink-0">
                        {brandTaskCount} Tugas
                      </span>
                    </div>

                    {brand.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {brand.description}
                      </p>
                    )}

                    {brand.website && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{brand.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBrand(brand);
                        setIsBrandModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit Logo & Brand</span>
                    </button>

                    {managedBrands.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteManagedBrand(brand.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 p-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition cursor-pointer"
                        title="Hapus Brand"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integration Banner */}
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20 flex items-center gap-3">
            <span className="text-xl">💡</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <strong>Otomatis Tersinkronisasi:</strong> Seluruh brand yang Anda kelola di sini otomatis muncul di tombol formulir <em>Buat Tugas Baru</em>, badge kartu <em>Kanban Board</em>, tabel List View, serta filter kampanye lintas divisi.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: ROLE MANAGEMENT (RBAC) */}
      {activeTab === 'roles' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-600" />
                <span>Pengaturan Hak Akses & Peran Karyawan (RBAC)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Hanya Super Admin yang berwenang mengubah hak akses karyawan.
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
              🛡️ Kebijakan Sistem: Super Admin selalu aktif otomatis
            </div>
          </div>

          {/* Rule explanation notice */}
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Ketentuan Hak Akses & Pewarisan Otomatis:</span>
              <p className="text-[11px] leading-relaxed opacity-90">
                Hanya Super Admin yang dapat mengubah hak akses peran karyawan. Sistem menjamin Super Admin <strong>harus selalu ada</strong>. Jika Super Admin diturunkan atau diganti rolenya, gelar Super Admin otomatis dialihkan ke akun karyawan yang paling lama bergabung (berdasarkan tanggal bergabung tertua).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Karyawan</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Status Akun</th>
                  <th className="px-4 py-3">Presensi</th>
                  <th className="px-4 py-3">Tingkat Akses (Role)</th>
                  <th className="px-4 py-3 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === currentUser.id && (
                              <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.department}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.position}</td>
                    <td className="px-4 py-3">
                      {u.isDeactivated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Nonaktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className={`h-2 w-2 rounded-full ${u.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span className="capitalize text-slate-600 dark:text-slate-300">{u.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold focus:border-red-500 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-400">Terkunci (Super Admin Only)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSuperAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleUserActiveStatus(u.id)}
                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                              u.isDeactivated
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}
                            title={u.isDeactivated ? 'Aktifkan Kembali Akun' : 'Nonaktifkan Akun'}
                          >
                            {u.isDeactivated ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                            <span>{u.isDeactivated ? 'Aktifkan' : 'Nonaktifkan'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Apakah Anda yakin ingin menghapus permanen akun karyawan "${u.name}" (${u.email})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 transition cursor-pointer"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak ada akses</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PERSETUJUAN AKUN (ACCESS APPROVAL) */}
      {activeTab === 'approvals' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>Persetujuan Akses Akun Eksternal & Registrasi</span>
              </h3>
            </div>
            <span className="rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 self-start sm:self-auto">
              {pendingApprovals.length} Permohonan Menunggu
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Tidak Ada Permohonan Akses Menunggu
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Semua pendaftaran dan permohonan akses dari pengguna eksternal telah disetujui atau ditolak.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Pemohon</th>
                    <th className="px-4 py-3">Email Kantor / Eksternal</th>
                    <th className="px-4 py-3">Divisi Penugasan</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Waktu Mengajukan</th>
                    <th className="px-4 py-3 text-right">Aksi Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingApprovals.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <img src={req.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80'} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                          <span>{req.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{req.email}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{req.department}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{req.position}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                        {new Date(req.requestedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => rejectUserRegistration(req.id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition cursor-pointer"
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            onClick={() => approveUserRegistration(req.id)}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Setujui Akses</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THEME & UI CUSTOMIZATION */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* FITUR KUSTOMISASI: BUTTON HOVER, SELECTOR, DAN WARNA IKON DENGAN LIVE PREVIEW */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  <span>Kustomisasi Interaksi & Aksen Ikon</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ubah warna hover tombol, selektor aktif, dan warna ikon dengan pratinjau sebelum diterapkan.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-3 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 self-start sm:self-auto">
                Pratinjau Interaktif
              </span>
            </div>

            {/* Preset Palet Interaksi Siap Pakai */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilihan Palet Preset Cepat:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {interactionPresets.map((ip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectInteractionPreset(ip)}
                    className="flex flex-col p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {(ip as any).isGradient && (ip as any).gradientCss ? (
                        <span className="h-4 w-full rounded-full ring-1 ring-white shadow-xs" style={{ background: (ip as any).gradientCss }} title="Modern Gradient Palette" />
                      ) : (
                        <>
                          <span className="h-3.5 w-3.5 rounded-full ring-1 ring-white" style={{ backgroundColor: ip.hover }} title="Hover Tombol" />
                          <span className="h-3.5 w-3.5 rounded-full ring-1 ring-white" style={{ backgroundColor: ip.selector }} title="Selektor Aktif" />
                          <span className="h-3.5 w-3.5 rounded-full ring-1 ring-white" style={{ backgroundColor: ip.icon }} title="Aksen Ikon" />
                        </>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {ip.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Color Pickers Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Warna Button Hover */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Hover Tombol</span>
                  <span className="text-[10px] font-mono text-slate-400">{draftButtonHoverColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftButtonHoverColor}
                    onChange={e => {
                      setDraftButtonHoverColor(e.target.value);
                      updateThemeSettings({ buttonHoverColor: e.target.value });
                    }}
                    className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={draftButtonHoverColor}
                    onChange={e => {
                      setDraftButtonHoverColor(e.target.value);
                      updateThemeSettings({ buttonHoverColor: e.target.value });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Warna latar saat kursor diarahkan ke tombol.</p>
              </div>

              {/* 2. Warna Selector / State Aktif */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Selektor & Tab Aktif</span>
                  <span className="text-[10px] font-mono text-slate-400">{draftSelectorActiveColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftSelectorActiveColor}
                    onChange={e => {
                      setDraftSelectorActiveColor(e.target.value);
                      updateThemeSettings({ selectorActiveColor: e.target.value });
                    }}
                    className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={draftSelectorActiveColor}
                    onChange={e => {
                      setDraftSelectorActiveColor(e.target.value);
                      updateThemeSettings({ selectorActiveColor: e.target.value });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Warna elemen tab/navigasi yang sedang aktif.</p>
              </div>

              {/* 3. Warna Aksen Ikon */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Warna Ikon</span>
                  <span className="text-[10px] font-mono text-slate-400">{draftIconAccentColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftIconAccentColor}
                    onChange={e => {
                      setDraftIconAccentColor(e.target.value);
                      updateThemeSettings({ iconAccentColor: e.target.value });
                    }}
                    className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={draftIconAccentColor}
                    onChange={e => {
                      setDraftIconAccentColor(e.target.value);
                      updateThemeSettings({ iconAccentColor: e.target.value });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Warna aksen simbol ikon di seluruh tampilan.</p>
              </div>
            </div>

            {/* KOTAK PRATINJAU INTERAKTIF DRAFT (LIVE PREVIEW SANDBOX) */}
            <div className="rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Pratinjau Interaktif (Live Preview Sandbox)</span>
                </span>
                <span className="text-[11px] text-slate-500">Uji coba hover & klik di bawah ini</span>
              </div>

              {/* Simulasi Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
                {/* 1. Selector Test */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                    1. Uji Coba Selektor Aktif (Klik untuk Ganti Tab):
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit">
                    {(['ringkasan', 'aktivitas', 'laporan'] as const).map(tabKey => {
                      const isActive = previewActiveTab === tabKey;
                      return (
                        <button
                          key={tabKey}
                          type="button"
                          onClick={() => setPreviewActiveTab(tabKey)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                            isActive ? 'text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                          style={{
                            backgroundColor: isActive ? draftSelectorActiveColor : 'transparent'
                          }}
                        >
                          {tabKey === 'ringkasan' ? 'Ringkasan' : tabKey === 'aktivitas' ? 'Aktivitas' : 'Laporan'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Button Hover Test */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                    2. Uji Coba Hover Tombol (Arahkan Kursor ke Tombol):
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onMouseEnter={() => setIsHoveringPreviewBtn(true)}
                      onMouseLeave={() => setIsHoveringPreviewBtn(false)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                      style={{
                        backgroundColor: isHoveringPreviewBtn ? draftButtonHoverColor : '#0f172a'
                      }}
                    >
                      {isHoveringPreviewBtn ? '✓ Hover State Aktif!' : 'Arahkan Kursor ke Sini'}
                    </button>

                    <button
                      type="button"
                      onMouseEnter={() => setIsHoveringPreviewSecBtn(true)}
                      onMouseLeave={() => setIsHoveringPreviewSecBtn(false)}
                      className="rounded-xl px-4 py-2 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      style={{
                        backgroundColor: isHoveringPreviewSecBtn ? draftButtonHoverColor : undefined,
                        color: isHoveringPreviewSecBtn ? '#ffffff' : undefined
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" style={{ color: isHoveringPreviewSecBtn ? '#ffffff' : draftIconAccentColor }} />
                      <span>Simpan Dokumen</span>
                    </button>
                  </div>
                </div>

                {/* 3. Icon Colors Test */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                    3. Aksen Warna Ikon:
                  </div>
                  <div className="flex flex-wrap items-center gap-4 py-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4" style={{ color: draftIconAccentColor }} />
                      <span>Personel</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="h-4 w-4" style={{ color: draftIconAccentColor }} />
                      <span>Keamanan</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Zap className="h-4 w-4" style={{ color: draftIconAccentColor }} />
                      <span>Produktivitas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Calendar className="h-4 w-4" style={{ color: draftIconAccentColor }} />
                      <span>Agenda</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <MessageSquare className="h-4 w-4" style={{ color: draftIconAccentColor }} />
                      <span>Pesan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar: Reset or Apply */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  {themeAppliedSuccess && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Konfigurasi warna interaksi berhasil diterapkan ke seluruh aplikasi!</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToCurrent}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Reset ke Saat Ini
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyInteractionTheme}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Terapkan Perubahan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Mode & Palet Warna */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-600" />
                <span>Mode Tampilan & Warna Utama</span>
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan skema pencahayaan dan palet identitas warna korporat.
              </p>

              {/* Mode toggle */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Mode Pencahayaan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition cursor-pointer ${
                      themeMode === 'light'
                        ? 'border-slate-900 bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    ☀️ Light Mode (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition cursor-pointer ${
                      themeMode === 'dark'
                        ? 'border-slate-900 bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>

              {/* Preset Palettes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Pilihan Palet Preset Korporat:
                </label>
                <div className="space-y-2">
                  {accentColorPresets.map(preset => {
                    const isSelected = themeSettings.accentColor === preset.id;
                    const PRESET_MAP: Record<string, { primary: string; accent: string }> = {
                      'navy-crimson': { primary: '#0f172a', accent: '#dc2626' },
                      'royal-blue': { primary: '#1e3a8a', accent: '#2563eb' },
                      'emerald': { primary: '#064e3b', accent: '#059669' },
                      'purple': { primary: '#3b0764', accent: '#9333ea' },
                      'amber': { primary: '#451a03', accent: '#f59e0b' }
                    };
                    const p = PRESET_MAP[preset.id] || PRESET_MAP['navy-crimson'];

                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateThemeSettings({
                            accentColor: preset.id,
                            customPrimaryColor: p.primary,
                            customAccentColor: p.accent,
                            iconAccentColor: p.accent,
                            selectorActiveColor: p.primary,
                            buttonHoverColor: p.primary
                          });
                          setDraftButtonHoverColor(p.primary);
                          setDraftSelectorActiveColor(p.primary);
                          setDraftIconAccentColor(p.accent);
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 dark:border-blue-700 dark:bg-blue-950/30 ring-1 ring-blue-500'
                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-1">
                            <span className={`h-5 w-5 rounded-full ${preset.primary} ring-2 ring-white`} />
                            <span className={`h-5 w-5 rounded-full ${preset.accent} ring-2 ring-white`} />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Pickers */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  🎨 Kustomisasi Hex Warna Sendiri (Custom Hex):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Warna Primer Utama:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeSettings.customPrimaryColor || '#0f172a'}
                        onChange={e => {
                          const val = e.target.value;
                          updateThemeSettings({
                            customPrimaryColor: val,
                            selectorActiveColor: val,
                            buttonHoverColor: val
                          });
                          setDraftSelectorActiveColor(val);
                          setDraftButtonHoverColor(val);
                        }}
                        className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={themeSettings.customPrimaryColor || '#0f172a'}
                        onChange={e => {
                          const val = e.target.value;
                          updateThemeSettings({
                            customPrimaryColor: val,
                            selectorActiveColor: val,
                            buttonHoverColor: val
                          });
                          setDraftSelectorActiveColor(val);
                          setDraftButtonHoverColor(val);
                        }}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Warna Aksen Sekunder:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeSettings.customAccentColor || '#dc2626'}
                        onChange={e => {
                          const val = e.target.value;
                          updateThemeSettings({
                            customAccentColor: val,
                            iconAccentColor: val
                          });
                          setDraftIconAccentColor(val);
                        }}
                        className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={themeSettings.customAccentColor || '#dc2626'}
                        onChange={e => {
                          const val = e.target.value;
                          updateThemeSettings({
                            customAccentColor: val,
                            iconAccentColor: val
                          });
                          setDraftIconAccentColor(val);
                        }}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {(themeSettings.customPrimaryColor || themeSettings.customAccentColor) && (
                  <button
                    type="button"
                    onClick={() => updateThemeSettings({
                      customPrimaryColor: undefined,
                      customAccentColor: undefined
                    })}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Kembali ke Palet Preset Bawaan
                  </button>
                )}
              </div>

              {/* 💬 Custom Chat Bubble Color */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                    <span>Warna Gelembung Chat (Bubble Pesan Terkirim):</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">WhatsApp / Slack Style</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'red', name: 'Crimson Red', color: '#dc2626' },
                    { id: 'emerald', name: 'WhatsApp Green', color: '#059669' },
                    { id: 'blue', name: 'Corporate Blue', color: '#2563eb' },
                    { id: 'purple', name: 'Royal Violet', color: '#7c3aed' },
                    { id: 'navy', name: 'Deep Slate Navy', color: '#0f172a' },
                    { id: 'amber', name: 'Warm Amber', color: '#d97706' }
                  ].map(b => {
                    const isSelected = (!themeSettings.chatBubbleColor && b.id === 'red') || themeSettings.chatBubbleColor === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => updateThemeSettings({ chatBubbleColor: b.id as any, customChatBubbleColor: undefined })}
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-2xs'
                            : 'border-slate-200 bg-white/70 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-slate-800 dark:text-slate-200">{b.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hex Chat Bubble Picker */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Atau Pilih Warna Hex Kustom:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeSettings.customChatBubbleColor || '#dc2626'}
                      onChange={e => updateThemeSettings({ chatBubbleColor: 'custom', customChatBubbleColor: e.target.value })}
                      className="h-7 w-8 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={themeSettings.customChatBubbleColor || (themeSettings.chatBubbleColor ? '' : '#dc2626')}
                      placeholder="#dc2626"
                      onChange={e => updateThemeSettings({ chatBubbleColor: 'custom', customChatBubbleColor: e.target.value })}
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {/* Mini Chat Bubble Preview */}
                <div className="rounded-xl bg-white p-3 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex justify-end">
                  <div className="chat-bubble-outgoing rounded-2xl rounded-tr-xs px-3.5 py-1.5 text-xs shadow-xs font-medium">
                    Halo tim, dokumen & storyboard video sudah selesai! ✓✓
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Ukuran Huruf, Bentuk UI (Radius) & Pilihan Background */}
            <div className="space-y-6">
              {/* 🔤 Kustomisasi Ukuran Font (Small - Normal - Large) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="h-4 w-4 text-emerald-600" />
                    <span>Ukuran Huruf Aplikasi (Font Size)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Live Scaling
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Sesuaikan ukuran keterbacaan font di seluruh antarmuka workspace: Ringkas (Small), Standar Proporsional (Normal), atau Nyaman Dibaca (Large).
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'normal', label: 'Normal', sample: 'Aa', desc: 'Standar proporsional' },
                    { id: 'large', label: 'Large', sample: 'Aa', desc: 'Sangat jelas & nyaman' },
                    { id: 'very-large', label: 'Very Large', sample: 'Aa', desc: 'Maksimal keterbacaan' }
                  ].map(fs => {
                    const isSelected = (themeSettings.fontSize || 'very-large') === fs.id;
                    return (
                      <button
                        key={fs.id}
                        type="button"
                        onClick={() => updateThemeSettings({ fontSize: fs.id as any })}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 ring-2 ring-emerald-500 font-bold'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                      >
                        <span className={`font-black mb-1 text-slate-900 dark:text-white ${fs.id === 'normal' ? 'text-sm' : fs.id === 'large' ? 'text-base' : 'text-lg'}`}>
                          {fs.sample}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {fs.label}
                          </span>
                          {isSelected && <Check className="h-3 w-3 text-emerald-600" />}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{fs.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🔠 5 Varian Font Tipografi Workspace (DM Sans, Helvetica, Segoe UI, Satoshi, Inter) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="h-4 w-4 text-blue-600" />
                    <span>Pilihan Varian Font Workspace (6 Pilihan Font)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/40">
                    6 Varian Font
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Ganti jenis tipografi utama antarmuka untuk menyesuaikan kenyamanan membaca dan identitas visual korporat.
                </p>

                <div className="space-y-2">
                  {[
                    {
                      id: 'dm-sans',
                      name: 'DM Sans',
                      family: "'DM Sans', sans-serif",
                      badge: 'Default / Modern',
                      desc: 'Geometric & friendly sans-serif khas startup & tech modern'
                    },
                    {
                      id: 'helvetica',
                      name: 'Helvetica',
                      family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                      badge: 'Swiss Standard',
                      desc: 'Standar netral & formal desainer Swiss untuk korporat profesional'
                    },
                    {
                      id: 'segoe-ui',
                      name: 'Segoe UI',
                      family: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                      badge: 'Enterprise',
                      desc: 'Tipografi bersih enterprise khas platform sistem operasi modern'
                    },
                    {
                      id: 'satoshi',
                      name: 'Satoshi',
                      family: "'Satoshi', sans-serif",
                      badge: 'Contemporary',
                      desc: 'Grotesk kontemporer dengan karakter tajam & proporsional'
                    },
                    {
                      id: 'inter',
                      name: 'Inter',
                      family: "'Inter', sans-serif",
                      badge: 'High Legibility',
                      desc: 'Dirancang spesifik untuk ketajaman layar UI & keterbacaan data micro'
                    },
                    {
                      id: 'jakarta-sans',
                      name: 'Jakarta Sans',
                      family: "'Plus Jakarta Sans', sans-serif",
                      badge: 'Corporate',
                      desc: 'Tipografi modern yang hangat, bersih, dan profesional'
                    }
                  ].map(font => {
                    const isSelected = (themeSettings.fontFamily || 'dm-sans') === font.id;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => updateThemeSettings({ fontFamily: font.id as any })}
                        className={`flex items-center justify-between w-full p-3.5 rounded-2xl border transition text-left cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-950/30 ring-1 ring-blue-600 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white shadow-2xs"
                            style={{ fontFamily: font.family }}
                          >
                            Ag
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {font.name}
                              </span>
                              <span className="rounded-md bg-slate-200/80 dark:bg-slate-700/80 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                {font.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {font.desc}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs shrink-0 pl-2">
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline text-[11px]">Aktif</span>
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bentuk UI (Card Radius) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-purple-600" />
                  <span>Bentuk Sudut UI (Card Corner Radius)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah kelengkungan sudut kartu, tombol, dan panel di seluruh antarmuka aplikasi.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'sharp', label: 'Tegas / Sharp', radius: '8px', desc: 'Sudut ringkas 8px' },
                    { id: 'rounded', label: 'Standar / Rounded', radius: '16px', desc: 'Modern standar 16px' },
                    { id: 'smooth', label: 'Halus / Smooth', radius: '24px', desc: 'Melengkung halus 24px' },
                    { id: 'pill', label: 'Ekstra Bulat / Pill', radius: '36px', desc: 'Super rounded 36px' }
                  ].map(shape => {
                    const isSelected = (themeSettings.cardRadius || 'rounded') === shape.id;
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => updateThemeSettings({ cardRadius: shape.id as any })}
                        className={`flex flex-col text-left p-3.5 border transition cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-950/30 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                        style={{ borderRadius: shape.radius }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {shape.label}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{shape.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Pattern & Style Workspace */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Pilihan Background Pola & Gaya Workspace</span>
                  </h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/40">
                    Live Canvas
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pola latar belakang presisi, warna solid kustom, atau gradien modern yang diterapkan ke seluruh kanvas kerja aplikasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'clean', name: 'Polos & Bersih', desc: 'Minimalist standard (Tanpa pola)' },
                    { id: 'dots', name: 'Pola Matrix Titik', desc: 'Grid titik rapi & simetris matematis' },
                    { id: 'grid', name: 'Kotak Geometris', desc: 'Garis grid arsitektur presisi & rapi' },
                    { id: 'mesh', name: 'Fluid Gradient Mesh', desc: 'Gradasi abstrak modern & lembut' },
                    { id: 'aurora-glow', name: 'Aurora Dinamis', desc: 'Pendaran cahaya lembut di sudut' },
                    { id: 'solid', name: 'Solid Color Kustom', desc: 'Warna latar solid pilihan atau hex' },
                    { id: 'gradient', name: 'Gradien Modern Kustom', desc: 'Gradasi 2-warna & preset desainer' }
                  ].map(pattern => {
                    const isSelected = (themeSettings.bgPattern || 'clean') === pattern.id || (pattern.id === 'aurora-glow' && themeSettings.bgPattern === 'aurora' as any);
                    return (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() => {
                          updateThemeSettings({
                            bgPattern: pattern.id as any,
                            customBgSolidColor: pattern.id === 'solid' && !themeSettings.customBgSolidColor ? (themeMode === 'dark' ? '#0b0f19' : '#f8fafc') : themeSettings.customBgSolidColor,
                            customBgGradient: pattern.id === 'gradient' && !themeSettings.customBgGradient ? 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fef3c7 100%)' : themeSettings.customBgGradient
                          });
                        }}
                        className={`flex flex-col text-left p-3 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-950/30 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {pattern.name}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{pattern.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Panel: Solid Color Customizer */}
                {themeSettings.bgPattern === 'solid' && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-blue-600" />
                        <span>Kustomisasi Background Solid Color:</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {themeSettings.customBgSolidColor || (themeMode === 'dark' ? '#0b0f19' : '#f8fafc')}
                      </span>
                    </div>

                    {/* Presets Grid */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                        Pilihan Palet Solid Cepat ({themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(themeMode === 'dark'
                          ? [
                              { name: 'Midnight Space', color: '#0b0f19' },
                              { name: 'Obsidian Carbon', color: '#090d16' },
                              { name: 'Deep Slate', color: '#0f172a' },
                              { name: 'Dark Charcoal', color: '#111827' },
                              { name: 'Eclipse Violet', color: '#1e1b4b' },
                              { name: 'Emerald Abyss', color: '#022c22' }
                            ]
                          : [
                              { name: 'Studio Off-White', color: '#f8fafc' },
                              { name: 'Clean Pearl', color: '#fafaf9' },
                              { name: 'Ice Blue Frost', color: '#f0f9ff' },
                              { name: 'Soft Mint', color: '#f0fdf4' },
                              { name: 'Warm Sand', color: '#fefce8' },
                              { name: 'Lavender Whisper', color: '#faf5ff' }
                            ]
                        ).map(s => (
                          <button
                            key={s.color}
                            type="button"
                            onClick={() => updateThemeSettings({ customBgSolidColor: s.color })}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 hover:shadow-2xs transition cursor-pointer"
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full ring-1 ring-slate-300 dark:ring-slate-600"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-slate-800 dark:text-slate-200">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200/60 dark:border-blue-900/50">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Atur Hex Warna Sendiri:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeSettings.customBgSolidColor || (themeMode === 'dark' ? '#0b0f19' : '#f8fafc')}
                          onChange={e => updateThemeSettings({ customBgSolidColor: e.target.value })}
                          className="h-8 w-10 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={themeSettings.customBgSolidColor || (themeMode === 'dark' ? '#0b0f19' : '#f8fafc')}
                          onChange={e => updateThemeSettings({ customBgSolidColor: e.target.value })}
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Panel: Gradient Customizer */}
                {themeSettings.bgPattern === 'gradient' && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span>Koleksi Gradien Modern Desainer:</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          name: 'Sunrise Velvet',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #1c1917 100%)'
                            : 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #f0fdf4 100%)',
                          preview: 'from-rose-100 via-orange-50 to-emerald-50'
                        },
                        {
                          name: 'Cosmic Aurora',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #172554 100%)'
                            : 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #fdf2f8 100%)',
                          preview: 'from-blue-100 via-purple-50 to-pink-50'
                        },
                        {
                          name: 'Forest Mist',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 50%, #f8fafc 100%)',
                          preview: 'from-emerald-50 via-teal-50 to-slate-50'
                        },
                        {
                          name: 'Royal Twilight',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e0e7ff 100%)',
                          preview: 'from-purple-50 via-indigo-50 to-blue-50'
                        },
                        {
                          name: 'Cyber Slate',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)'
                            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
                          preview: 'from-slate-100 via-slate-200 to-slate-300'
                        },
                        {
                          name: 'Warm Golden Glow',
                          gradient: themeMode === 'dark'
                            ? 'linear-gradient(135deg, #1c1917 0%, #451a03 50%, #0f172a 100%)'
                            : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
                          preview: 'from-amber-50 via-yellow-100 to-orange-50'
                        }
                      ].map(g => {
                        const isGradSelected = themeSettings.customBgGradient === g.gradient;
                        return (
                          <button
                            key={g.name}
                            type="button"
                            onClick={() => updateThemeSettings({ customBgGradient: g.gradient })}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer text-left ${
                              isGradSelected
                                ? 'border-blue-600 bg-white dark:bg-slate-900 shadow-2xs ring-1 ring-blue-600'
                                : 'border-slate-200 bg-white/70 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-6 w-8 rounded-lg shadow-2xs border border-slate-200 dark:border-slate-700 shrink-0"
                                style={{ background: g.gradient }}
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {g.name}
                              </span>
                            </div>
                            {isGradSelected && <Check className="h-4 w-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance & Reset */}
              <div className="rounded-3xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/60 dark:bg-red-950/20 space-y-3">
                <h4 className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Reset Semua Data ke Kondisi Awal
                </h4>
                <p className="text-[11px] text-red-700/80 dark:text-red-400">
                  Akan menghapus seluruh task, divisi baru, percakapan baru, dan pengaturan kustom, lalu memuat ulang seed database awal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mereset seluruh database aplikasi ke kondisi awal pabrik?')) {
                      resetAllData();
                    }
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
                >
                  Reset Database Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MODERN DATABASE & CLOUD SYNC */}
      {activeTab === 'database' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold">Arsitektur Basis Data Modern</h3>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      IndexedDB Offline-First Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Integrasi basis data reaktif lokal dengan replikasi otomatis ke Google Cloud Firestore saat terhubung.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDbHubOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition shrink-0"
              >
                <Zap className="h-4 w-4 text-emerald-600" />
                <span>Buka Pusat Kendali Database</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Penyimpanan Lokal</span>
                <HardDrive className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                IndexedDB (v1)
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Dukungan Penuh Peramban
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Cloud Sync Gateway</span>
                <Cloud className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Firebase Firestore
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Koleksi & Rule ABAC Terintegrasi
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Data Karyawan & Task</span>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {users.length} User / {tasks.length} Tasks
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
                Tersinkronisasi Otomatis
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Rerata Latensi Mutasi</span>
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                ~1.2 ms
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Responsif Tanpa Lag
              </div>
            </div>
          </div>

          {/* Database Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  Cadangkan Seluruh Basis Data (Export JSON)
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Unduh cadangan penuh semua data perusahaan (tasks, feed, documents, meetings, users) ke file JSON.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const jsonStr = modernDb.exportFullBackup();
                  const blob = new Blob([jsonStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `asli-group-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <Download className="h-4 w-4" />
                Unduh Cadangan JSON Sekarang
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-600" />
                  Inspeksi & Monitoring Lengkap
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lihat log aliran mutasi data secara real-time, periksa isi tabel mentah, dan pantau penggunaan disk.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDbHubOpen(true)}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Zap className="h-4 w-4 text-amber-500" />
                Buka Modal Inspektor Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Rekam Jejak Audit & Kepatuhan ISO 27001
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh aksi krusial pengguna (perubahan task, role, dokumen, dan login) tercatat dengan aman.
              </p>
            </div>

            <input
              type="text"
              placeholder="Cari aksi audit..."
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Waktu</th>
                  <th className="px-4 py-2.5">Pengguna</th>
                  <th className="px-4 py-2.5">Aksi</th>
                  <th className="px-4 py-2.5">Modul / Resource</th>
                  <th className="px-4 py-2.5">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                      {log.userName}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{log.resource}</td>
                    <td className="px-4 py-2.5 text-slate-500">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Total Karyawan Terdaftar</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{users.length} User</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Akun Aktif Terverifikasi</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Total Tugas Berjalan</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{tasks.length} Task</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">{tasks.filter(t => t.status === 'done').length} Selesai</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-500">Dokumen Resmi & SOP</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{documents.length} Berkas</div>
            <div className="text-[11px] text-slate-400 mt-1">Tersimpan di Cloud Storage Terenkripsi</div>
          </div>
        </div>
      )}

      {/* TAB 5: COPYWRITING CSV */}
      {activeTab === 'copywriting' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ekspor & Impor Copywriting
          </h3>
          <p className="text-xs text-slate-500">
            Kelola teks aplikasi melalui file CSV untuk kemudahan update konten.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const data = [
                  { key: 'workspaceName', value: workspaceInfo.name },
                  { key: 'loginBannerHeadline', value: workspaceInfo.loginBannerHeadline || '' },
                  { key: 'loginBannerSubtitle', value: workspaceInfo.loginBannerSubtitle || '' }
                ];
                const csv = Papa.unparse(data);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'copywriting.csv';
                a.click();
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Ekspor CSV
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  Papa.parse(file, {
                    header: true,
                    complete: (results: any) => {
                      const newInfo = { ...workspaceInfo };
                      results.data.forEach((row: any) => {
                        if (row.key === 'workspaceName') newInfo.name = row.value;
                        if (row.key === 'loginBannerHeadline') newInfo.loginBannerHeadline = row.value;
                        if (row.key === 'loginBannerSubtitle') newInfo.loginBannerSubtitle = row.value;
                      });
                      updateWorkspaceInfo(newInfo);
                    }
                  });
                }
              }}
              className="hidden"
              id="csvUpload"
            />
            <label
              htmlFor="csvUpload"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Upload className="h-4 w-4" />
              Impor CSV
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

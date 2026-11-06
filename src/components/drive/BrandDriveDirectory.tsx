import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Search,
  Plus,
  Star,
  HardDrive,
  Copy,
  Check,
  Trash2,
  Edit3,
  X,
  Tag,
  Clock,
  Sparkles,
  Link,
  FolderOpen
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BrandDriveFolder } from '../../types';
import {
  GoogleDriveFileItem,
  listDriveFolderFiles,
  uploadFileToGoogleDrive,
  renameGoogleDriveFile,
  deleteGoogleDriveFile
} from '../../services/googleDriveService';

export const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 87.3 78" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

export const BrandDriveDirectory: React.FC = () => {
  const {
    currentUser,
    brandDriveFolders,
    addBrandDriveFolder,
    updateBrandDriveFolder,
    deleteBrandDriveFolder,
    toggleStarBrandDriveFolder
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-app Google Drive File Manager Modal state
  const [activeManagerFolder, setActiveManagerFolder] = useState<BrandDriveFolder | null>(null);
  const [managerFiles, setManagerFiles] = useState<GoogleDriveFileItem[]>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [driveToast, setDriveToast] = useState<string | null>(null);

  // Edit file rename state
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileNameInput, setNewFileNameInput] = useState('');

  // Add folder modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCode, setNewBrandCode] = useState('');
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<BrandDriveFolder['category']>('creative_assets');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-600');
  const [newTags, setNewTags] = useState('brand, master, assets');

  // Edit folder modal state
  const [editingFolder, setEditingFolder] = useState<BrandDriveFolder | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandCode, setEditBrandCode] = useState('');
  const [editFolderTitle, setEditFolderTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<BrandDriveFolder['category']>('creative_assets');
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editColor, setEditColor] = useState('bg-blue-600');
  const [editTags, setEditTags] = useState('');

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'creative_assets', label: 'Creative & Design' },
    { id: 'campaigns', label: 'Marketing Campaigns' },
    { id: 'raw_footage', label: 'Video Footage' },
    { id: 'brand_guidelines', label: 'Brand Guidelines' },
    { id: 'finance_legal', label: 'Legal & Finance' }
  ];

  const filteredFolders = brandDriveFolders.filter(f => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBrand = f.brandName.toLowerCase().includes(q) || f.brandCode.toLowerCase().includes(q);
      const matchTitle = f.folderTitle.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      const matchTag = f.tags.some(t => t.toLowerCase().includes(q));
      return matchBrand || matchTitle || matchDesc || matchTag;
    }
    return true;
  });

  const handleCopyLink = (folder: BrandDriveFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(folder.googleDriveUrl);
    setCopiedId(folder.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (folder: BrandDriveFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setEditBrandName(folder.brandName);
    setEditBrandCode(folder.brandCode);
    setEditFolderTitle(folder.folderTitle);
    setEditDescription(folder.description);
    setEditCategory(folder.category);
    setEditDriveUrl(folder.googleDriveUrl);
    setEditColor(folder.color || 'bg-blue-600');
    setEditTags(folder.tags.join(', '));
  };

  const [folderToDelete, setFolderToDelete] = useState<BrandDriveFolder | null>(null);

  const handleDeleteFolder = (folder: BrandDriveFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToDelete(folder);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim() || !newFolderTitle.trim() || !newDriveUrl.trim()) return;

    const folder: BrandDriveFolder = {
      id: `bdf_${Date.now()}`,
      brandName: newBrandName.trim(),
      brandCode: newBrandCode.trim().toUpperCase() || newBrandName.substring(0, 3).toUpperCase(),
      folderTitle: newFolderTitle.trim(),
      description: newDescription.trim() || 'Master storage folder untuk aset resmi brand.',
      category: newCategory,
      color: newColor,
      googleDriveUrl: newDriveUrl.trim(),
      itemCount: 1,
      storageUsed: '1.2 GB',
      lastUpdated: 'Hari ini',
      managerName: currentUser.name,
      managerAvatar: currentUser.avatar,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isStarred: false
    };

    addBrandDriveFolder(folder);
    setShowAddModal(false);
    // Reset form
    setNewBrandName('');
    setNewBrandCode('');
    setNewFolderTitle('');
    setNewDescription('');
    setNewDriveUrl('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editBrandName.trim() || !editFolderTitle.trim() || !editDriveUrl.trim()) return;

    updateBrandDriveFolder({
      ...editingFolder,
      brandName: editBrandName.trim(),
      brandCode: editBrandCode.trim().toUpperCase() || editBrandName.substring(0, 3).toUpperCase(),
      folderTitle: editFolderTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      googleDriveUrl: editDriveUrl.trim(),
      color: editColor,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    setEditingFolder(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. SIMPLIFIED & MODERN HEADER */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Direktori Google Drive Brand</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Master Folder Per Brand
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Direktori Folder</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
            <FolderGit2 className="h-4 w-4 text-blue-600" />
            <span className="text-slate-500 dark:text-slate-400">Total Folder:</span>
            <span className="font-bold text-slate-900 dark:text-white">{brandDriveFolders.length} Direktori</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">Bintang:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {brandDriveFolders.filter(f => f.isStarred).length} Favorit
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari brand, judul folder, tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SIMPLIFIED FOLDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredFolders.map(folder => (
          <div
            key={folder.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
          >
            {/* Top Bar: Brand Icon + Title + Action Buttons */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Left Squircle: Official Google Drive Icon */}
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
                    <GoogleDriveIcon className="h-6 w-6" />
                    <span className="absolute -bottom-1 -right-1 rounded-md bg-slate-900 px-1 py-0.2 text-[8px] font-black text-white dark:bg-white dark:text-slate-900 shadow-2xs">
                      {folder.brandCode}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                      {folder.brandName}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate" title={folder.folderTitle}>
                      {folder.folderTitle.replace(/^[📁📂\s]+/, '')}
                    </h3>
                  </div>
                </div>

                {/* Top Action Buttons: Star, Edit, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStarBrandDriveFolder(folder.id)}
                    title={folder.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                    className={`rounded-lg p-1.5 transition cursor-pointer ${
                      folder.isStarred
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-300 hover:text-slate-500 dark:text-slate-600'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${folder.isStarred ? 'fill-amber-500' : ''}`} />
                  </button>

                  {/* Edit Folder Button */}
                  <button
                    type="button"
                    onClick={e => handleOpenEdit(folder, e)}
                    title="Edit Folder"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>

                  {/* Delete Folder Button */}
                  <button
                    type="button"
                    onClick={e => handleDeleteFolder(folder, e)}
                    title="Hapus Folder"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Folder Description */}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {folder.description}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {folder.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Bar: Manager + Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <img
                    src={folder.managerAvatar}
                    alt={folder.managerName}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                    {folder.managerName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{folder.lastUpdated}</span>
              </div>

              {/* Action Buttons: Kelola File (In-app Drive CRUD) + Open Link + Copy */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setActiveManagerFolder(folder);
                    setIsLoadingDriveFiles(true);
                    const res = await listDriveFolderFiles(folder.googleDriveUrl);
                    setManagerFiles(res.files);
                    setIsLoadingDriveFiles(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-extrabold text-blue-700 shadow-xs hover:bg-blue-100 active:scale-98 transition dark:border-blue-900 dark:bg-blue-950/80 dark:text-blue-300 dark:hover:bg-blue-900/60 cursor-pointer"
                >
                  <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Kelola File (Add, Rename, Delete)</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={folder.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-600 active:scale-98 transition dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 dark:hover:text-white"
                  >
                    <span>Buka Google Drive</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={e => handleCopyLink(folder, e)}
                    title="Salin Link Google Drive"
                    className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                  >
                    {copiedId === folder.id ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFolders.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
          <HardDrive className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada folder master ditemukan
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Coba ubah kata kunci pencarian atau kategori filter di atas.
          </p>
        </div>
      )}

      {/* 4. MODAL TAMBAH DIREKTORI FOLDER BRAND */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Tambah Direktori Master Folder Brand
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daftarkan tautan master folder Google Drive untuk brand baru.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={e => setNewBrandName(e.target.value)}
                    placeholder="Contoh: Brand Epsilon"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kode Singkat (2-4 Huruf)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newBrandCode}
                    onChange={e => setNewBrandCode(e.target.value)}
                    placeholder="EPS"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 uppercase focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Judul Folder Master *
                </label>
                <input
                  type="text"
                  required
                  value={newFolderTitle}
                  onChange={e => setNewFolderTitle(e.target.value)}
                  placeholder="Contoh: Brand Epsilon — Master Asset & Footage Archive"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tautan Google Drive (URL Hyperlink) *
                </label>
                <input
                  type="url"
                  required
                  value={newDriveUrl}
                  onChange={e => setNewDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kategori Aset
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="creative_assets">Creative & Design</option>
                    <option value="campaigns">Marketing Campaigns</option>
                    <option value="raw_footage">Video Footage</option>
                    <option value="brand_guidelines">Brand Guidelines</option>
                    <option value="finance_legal">Legal & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Warna Badge Brand
                  </label>
                  <select
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="bg-blue-600">Biru (Blue 600)</option>
                    <option value="bg-indigo-600">Indigo (Indigo 600)</option>
                    <option value="bg-purple-600">Ungu (Purple 600)</option>
                    <option value="bg-emerald-600">Hijau (Emerald 600)</option>
                    <option value="bg-amber-600">Kuning Emas (Amber 600)</option>
                    <option value="bg-rose-600">Merah Crimson (Rose 600)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi Singkat Folder
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Jelaskan jenis file atau aturan akses folder ini..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="creative, assets, video, 2026"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                >
                  Simpan & Daftarkan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL EDIT DIREKTORI FOLDER BRAND (Requested Feature) */}
      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit & Kustomisasi Direktori Folder
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbarui nama, link Google Drive, atau warna badge brand.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFolder(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBrandName}
                    onChange={e => setEditBrandName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kode Singkat (2-4 Huruf)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editBrandCode}
                    onChange={e => setEditBrandCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 uppercase focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Judul Folder Master *
                </label>
                <input
                  type="text"
                  required
                  value={editFolderTitle}
                  onChange={e => setEditFolderTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tautan Google Drive (URL Hyperlink) *
                </label>
                <input
                  type="url"
                  required
                  value={editDriveUrl}
                  onChange={e => setEditDriveUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kategori Aset
                  </label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="creative_assets">Creative & Design</option>
                    <option value="campaigns">Marketing Campaigns</option>
                    <option value="raw_footage">Video Footage</option>
                    <option value="brand_guidelines">Brand Guidelines</option>
                    <option value="finance_legal">Legal & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Warna Badge Brand
                  </label>
                  <select
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="bg-blue-600">Biru (Blue 600)</option>
                    <option value="bg-indigo-600">Indigo (Indigo 600)</option>
                    <option value="bg-purple-600">Ungu (Purple 600)</option>
                    <option value="bg-emerald-600">Hijau (Emerald 600)</option>
                    <option value="bg-amber-600">Kuning Emas (Amber 600)</option>
                    <option value="bg-rose-600">Merah Crimson (Rose 600)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deskripsi Folder
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRM DELETE MODAL (Bypass blocked window.confirm in iframes) */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Hapus Master Folder?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini akan menghapus tautan folder dari direktori.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block truncate">
                {folderToDelete.folderTitle}
              </span>
              <span className="text-[11px] text-slate-500">
                Brand: {folderToDelete.brandName} • Code: {folderToDelete.brandCode}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBrandDriveFolder(folderToDelete.id);
                  setFolderToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP GOOGLE DRIVE FILE MANAGER MODAL (CRUD: Add, Rename, Delete files) */}
      {activeManagerFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shadow-2xs">
                  <GoogleDriveIcon className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-white dark:bg-white dark:text-slate-900">
                      {activeManagerFolder.brandCode}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {activeManagerFolder.brandName}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {activeManagerFolder.folderTitle}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveManagerFolder(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toast notification */}
            {driveToast && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                <span>{driveToast}</span>
                <button onClick={() => setDriveToast(null)} className="text-emerald-700 dark:text-emerald-300">✕</button>
              </div>
            )}

            {/* Upload New File Section */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Upload File Baru ke Google Drive</span>
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFileObj(f);
                      setUploadFileName(f.name);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                />
                <button
                  type="button"
                  disabled={!uploadFileObj || isUploading}
                  onClick={async () => {
                    if (!uploadFileObj) return;
                    setIsUploading(true);
                    const res = await uploadFileToGoogleDrive(activeManagerFolder.id, uploadFileName || uploadFileObj.name, uploadFileObj);
                    if (res.success && res.file) {
                      setManagerFiles(prev => [res.file!, ...prev]);
                      setDriveToast(res.message);
                      setUploadFileObj(null);
                      setUploadFileName('');
                    } else {
                      setDriveToast(res.message);
                    }
                    setIsUploading(false);
                  }}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer shrink-0"
                >
                  {isUploading ? 'Mengunggah...' : 'Upload File'}
                </button>
              </div>
            </div>

            {/* Files List Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Daftar File di Folder ({managerFiles.length})
              </h4>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {isLoadingDriveFiles ? (
                  <div className="p-8 text-center text-xs text-slate-400">Memuat file dari Google Drive...</div>
                ) : managerFiles.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">Belum ada file di folder ini. Silakan upload file baru.</div>
                ) : (
                  managerFiles.map(file => (
                    <div key={file.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] shrink-0">
                          {file.mimeType.includes('pdf') ? 'PDF' : file.mimeType.includes('image') ? 'IMG' : file.mimeType.includes('video') ? 'VID' : 'DOC'}
                        </div>
                        <div className="min-w-0 flex-1">
                          {renamingFileId === file.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newFileNameInput}
                                onChange={e => setNewFileNameInput(e.target.value)}
                                className="rounded-lg border border-blue-400 px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!newFileNameInput.trim()) return;
                                  const res = await renameGoogleDriveFile(file.id, newFileNameInput.trim());
                                  if (res.success) {
                                    setManagerFiles(prev => prev.map(f => f.id === file.id ? { ...f, name: newFileNameInput.trim() } : f));
                                    setDriveToast(res.message);
                                  }
                                  setRenamingFileId(null);
                                }}
                                className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingFileId(null)}
                                className="rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 text-[11px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {file.size || '1.2 MB'} • {file.modifiedTime || 'Baru saja'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Buka File"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingFileId(file.id);
                            setNewFileNameInput(file.name);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Ubah Nama File"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await deleteGoogleDriveFile(file.id);
                            if (res.success) {
                              setManagerFiles(prev => prev.filter(f => f.id !== file.id));
                              setDriveToast(res.message);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Hapus File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveManagerFolder(null)}
                className="rounded-xl bg-slate-900 text-white px-5 py-2 text-xs font-bold hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Tutup Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

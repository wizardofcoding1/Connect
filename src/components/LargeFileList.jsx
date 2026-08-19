import React, { useState, useEffect, useMemo } from 'react';
import {
  getLargeFilesByTab,
  deleteLargeFile,
  renameLargeFile,
  getStreamUrl,
  formatFileSize
} from '../services/largeFileUploadService';
import {
  Trash2, Download, Loader2, Play, ChevronUp, AlertTriangle,
  FileVideo, Package, Pencil, Check, X, FileArchive, FileText, SearchX
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

// Containers browsers decode natively in <video>. Anything else needs a real
// player, so we offer a download instead of an element that silently fails.
const PLAYABLE_VIDEO = ['mp4', 'm4v', 'webm', 'ogv', 'ogg', 'mov'];
const UNPLAYABLE_VIDEO = ['avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', '3gp'];
const ARCHIVE = ['zip', 'rar', '7z', 'tar', 'gz', 'iso', 'dmg', 'apk', 'exe', 'bin'];

const getExtension = (fileName = '') => fileName.split('.').pop().toLowerCase();

// Extension wins over mime_type: assets uploaded before the content-type fix
// are all stored as application/octet-stream.
const getVideoSupport = (file) => {
  const ext = getExtension(file.file_name);
  if (PLAYABLE_VIDEO.includes(ext)) return 'playable';
  if (UNPLAYABLE_VIDEO.includes(ext)) return 'unplayable';
  return file.mime_type?.startsWith('video/') ? 'unplayable' : null;
};

const getCategory = (file) => {
  if (getVideoSupport(file)) return 'video';
  if (ARCHIVE.includes(getExtension(file.file_name))) return 'archive';
  return 'document';
};

// Custom title when set, original file name otherwise
const getDisplayName = (file) => file.title || file.file_name;

export default function LargeFileList({
  tabId,
  refreshTrigger,
  isDarkMode = true,
  searchQuery = '',
  typeFilter = 'all',
  sortBy = 'newest'
}) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [streamUrls, setStreamUrls] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    if (tabId) loadFiles();
  }, [tabId, refreshTrigger]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFiles(await getLargeFilesByTab(tabId));
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = files.filter((file) => {
      const matchesType = typeFilter === 'all' || getCategory(file) === typeFilter;
      if (!matchesType) return false;
      if (!query) return true;
      // Search both the custom title and the original name
      return (
        getDisplayName(file).toLowerCase().includes(query) ||
        file.file_name.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
    } else if (sortBy === 'largest') {
      sorted.sort((a, b) => b.file_size - a.file_size);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
    } else {
      sorted.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
    }
    return sorted;
  }, [files, searchQuery, typeFilter, sortBy]);

  const handleDelete = async (fileId) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;

    setDeleting(fileId);
    try {
      await deleteLargeFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (previewId === fileId) setPreviewId(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const startEditing = (file) => {
    setEditingId(file.id);
    setDraftTitle(getDisplayName(file));
  };

  const saveTitle = async (file) => {
    const next = draftTitle.trim();
    if (next === getDisplayName(file)) {
      setEditingId(null);
      return;
    }

    setSavingTitle(true);
    try {
      await renameLargeFile(file.id, next);
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, title: next || null } : f))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Rename error:', err);
      setError(err.message);
    } finally {
      setSavingTitle(false);
    }
  };

  // Stream URLs carry a token, so they're built on demand rather than stored
  const togglePreview = async (file) => {
    if (previewId === file.id) {
      setPreviewId(null);
      return;
    }
    setPreviewId(file.id);
    if (!streamUrls[file.id]) {
      try {
        const url = await getStreamUrl(file.id);
        setStreamUrls((prev) => ({ ...prev, [file.id]: url }));
      } catch (err) {
        console.error('Stream URL error:', err);
        setError(err.message);
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      const url = streamUrls[file.id] || (await getStreamUrl(file.id));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Could not start download: ' + err.message);
    }
  };

  if (!tabId) return null;

  const card = isDarkMode ? 'border-slate-700/70 bg-slate-800/40' : 'border-slate-200 bg-white';
  const heading = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const muted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const rowHover = isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50';
  const divide = isDarkMode ? 'divide-slate-700/70' : 'divide-slate-200';
  const iconBtn = 'rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';

  const categoryIcon = (file) => {
    const category = getCategory(file);
    if (category === 'video') return <FileVideo className="h-4 w-4" />;
    if (category === 'archive') return <FileArchive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const categoryTint = (file) => {
    const category = getCategory(file);
    if (category === 'video') return 'bg-purple-500/15 text-purple-400';
    if (category === 'archive') return 'bg-amber-500/15 text-amber-500';
    return isDarkMode ? 'bg-slate-700/60 text-slate-300' : 'bg-slate-100 text-slate-500';
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-500" />
        <h3 className={`text-base font-semibold ${heading}`}>Large Files</h3>
        {files.length > 0 && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            {visibleFiles.length === files.length
              ? files.length
              : `${visibleFiles.length} of ${files.length}`}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0" aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={`overflow-hidden rounded-xl border ${card}`}>
        {isLoading ? (
          <div className={`flex flex-col items-center gap-2 p-10 ${muted}`}>
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-sm">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className={`flex flex-col items-center gap-1 p-10 text-center ${muted}`}>
            <Package className="mb-1 h-8 w-8 opacity-40" />
            <p className="text-sm font-medium">No large files uploaded yet</p>
            <p className="text-xs">Use the upload button above to get started</p>
          </div>
        ) : visibleFiles.length === 0 ? (
          <div className={`flex flex-col items-center gap-1 p-10 text-center ${muted}`}>
            <SearchX className="mb-1 h-8 w-8 opacity-40" />
            <p className="text-sm font-medium">No files match your filters</p>
            <p className="text-xs">Try a different search term or file type</p>
          </div>
        ) : (
          <>
            {/* Column headers — hidden on mobile, where rows become stacked cards */}
            <div className={`hidden gap-3 border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide md:grid md:grid-cols-[minmax(0,2.5fr)_auto_auto_auto] ${muted} ${
              isDarkMode ? 'border-slate-700/70 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <span>Name</span>
              <span className="w-24 text-right">Size</span>
              <span className="w-24 text-right">Uploaded</span>
              <span className="w-36 text-right">Actions</span>
            </div>

            <ul className={`divide-y ${divide}`}>
              {visibleFiles.map((file) => {
                const videoSupport = getVideoSupport(file);
                const isOpen = previewId === file.id;
                const isDeleting = deleting === file.id;
                const isEditing = editingId === file.id;

                return (
                  <li key={file.id}>
                    <div className={`flex flex-col gap-3 px-4 py-3 transition-colors md:grid md:grid-cols-[minmax(0,2.5fr)_auto_auto_auto] md:items-center ${rowHover}`}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryTint(file)}`}>
                          {categoryIcon(file)}
                        </span>

                        {isEditing ? (
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <input
                              autoFocus
                              value={draftTitle}
                              onChange={(e) => setDraftTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle(file);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              maxLength={200}
                              placeholder={file.file_name}
                              className={`min-w-0 flex-1 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode
                                  ? 'border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500'
                                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                            <button
                              onClick={() => saveTitle(file)}
                              disabled={savingTitle}
                              className={`${iconBtn} text-green-400 hover:bg-green-500/15`}
                              title="Save title"
                              aria-label="Save title"
                            >
                              {savingTitle
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={`${iconBtn} ${muted} hover:bg-white/10`}
                              title="Cancel"
                              aria-label="Cancel rename"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className={`truncate text-sm font-medium ${heading}`} title={getDisplayName(file)}>
                                {getDisplayName(file)}
                              </p>
                              <button
                                onClick={() => startEditing(file)}
                                className={`shrink-0 rounded p-1 transition-colors ${muted} hover:text-blue-400`}
                                title="Rename"
                                aria-label="Rename file"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className={`truncate text-xs ${muted}`} title={file.file_name}>
                              {file.title ? file.file_name : (file.mime_type || 'Unknown type')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className={`text-sm tabular-nums md:w-24 md:text-right ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <span className={`mr-1 text-xs md:hidden ${muted}`}>Size:</span>
                        {formatFileSize(file.file_size)}
                      </div>

                      <div className={`text-sm md:w-24 md:text-right ${muted}`}>
                        <span className="mr-1 text-xs md:hidden">Uploaded:</span>
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1 md:w-36 md:justify-end">
                        {videoSupport && (
                          <button
                            onClick={() => togglePreview(file)}
                            className={`${iconBtn} text-purple-400 hover:bg-purple-500/15`}
                            title={isOpen ? 'Hide preview' : 'Preview video'}
                            aria-label={isOpen ? 'Hide preview' : 'Preview video'}
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          className={`${iconBtn} text-blue-400 hover:bg-blue-500/15`}
                          title="Download file"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                          className={`${iconBtn} text-red-400 hover:bg-red-500/15`}
                          title="Delete file"
                          aria-label="Delete file"
                        >
                          {isDeleting
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className={`px-4 pb-4 ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
                        {videoSupport === 'playable' ? (
                          streamUrls[file.id] ? (
                            <VideoPlayer src={streamUrls[file.id]} isDarkMode={isDarkMode} />
                          ) : (
                            <div className={`flex items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-sm ${muted} ${
                              isDarkMode ? 'border-slate-700' : 'border-slate-300'
                            }`}>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Preparing stream...
                            </div>
                          )
                        ) : (
                          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div>
                              <p className={`text-sm font-semibold ${heading}`}>
                                .{getExtension(file.file_name)} can&apos;t play in a browser
                              </p>
                              <p className={`mt-1 text-xs leading-relaxed ${muted}`}>
                                No browser decodes this container natively. Download the file
                                and open it in VLC or another desktop player.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

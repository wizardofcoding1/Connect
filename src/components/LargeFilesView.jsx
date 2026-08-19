import React, { useState } from 'react';
import LargeFileUploader from './LargeFileUploader';
import LargeFileList from './LargeFileList';
import { Search, SlidersHorizontal, HardDrive, Info, X } from 'lucide-react';

export default function LargeFilesView({ items, isDarkMode = true }) {
  const [largeFileRefresh, setLargeFileRefresh] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Use the first note's ID as the tab ID
  const firstNote = items.find((i) => i.type === 'note');
  const tabId = firstNote?.id;

  const heading = isDarkMode ? 'text-white' : 'text-slate-900';
  const muted = isDarkMode ? 'text-slate-400' : 'text-slate-600';

  const field = `rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode
      ? 'border-slate-700 bg-slate-800/60 text-slate-200 placeholder:text-slate-500'
      : 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400'
  }`;

  return (
    <div className={`flex flex-1 flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b px-6 py-6 sm:px-8 ${
        isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      }`}>
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-600/25">
            <HardDrive className="h-6 w-6 text-white" />
          </span>
          <div className="min-w-0">
            <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${heading}`}>
              Large File Storage
            </h1>
            <p className={`mt-0.5 text-sm ${muted}`}>
              Upload and manage files up to 1GB, stored on GitHub Releases
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-5">
          {!tabId ? (
            <div className={`flex items-start gap-3 rounded-xl border-2 border-dashed p-6 ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800/40 text-slate-400'
                : 'border-slate-300 bg-white text-slate-600'
            }`}>
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <p className="text-sm">
                Create a note first to start uploading large files.
              </p>
            </div>
          ) : (
            <>
              {/* Toolbar: search, filters, upload */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files by name..."
                    className={`${field} w-full pl-9 ${searchQuery ? 'pr-9' : ''}`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors ${muted} hover:text-red-400`}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <SlidersHorizontal className={`h-4 w-4 shrink-0 ${muted}`} />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    aria-label="Filter by file type"
                    className={`${field} cursor-pointer`}
                  >
                    <option value="all">All types</option>
                    <option value="video">Video</option>
                    <option value="archive">Archives &amp; apps</option>
                    <option value="document">Documents</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort files"
                    className={`${field} cursor-pointer`}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="largest">Largest first</option>
                    <option value="name">Name (A–Z)</option>
                  </select>
                </div>

                <div className="lg:shrink-0">
                  <LargeFileUploader
                    tabId={tabId}
                    onUploadSuccess={() => setLargeFileRefresh((prev) => prev + 1)}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              <LargeFileList
                tabId={tabId}
                refreshTrigger={largeFileRefresh}
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                typeFilter={typeFilter}
                sortBy={sortBy}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

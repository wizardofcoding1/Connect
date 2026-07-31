import React from "react";
import { Search, Code, LayoutGrid, CheckSquare, FolderPlus, X } from "lucide-react";
import UploadDropdown from "./UploadDropdown";

const CanvasToolbar = ({
  searchQuery,
  onSearchChange,
  codeMode,
  setCodeMode,
  isSelectMode,
  toggleSelectMode,
  filteredCount,
  onFileUpload,
  onOpenNewFolderModal,
  activeFilter,
  onFilterChange,
  filterOptions = [],
  isDarkMode = true,
  children,
}) => {
  const displayFilterOptions =
    filterOptions && filterOptions.length > 0
      ? filterOptions
      : [
          { id: "all", label: "All" },
          { id: "folder", label: "Folders" },
          { id: "pdf", label: "PDFs" },
          { id: "image", label: "Images" },
          { id: "doc", label: "Docs" },
        ];

  return (
    <div
      className={`px-4 sm:px-6 py-4 flex flex-col gap-4 border-b select-none transition-colors ${
        isDarkMode ? "bg-[#070d18]/90 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* ROW 1: TITLE & ACTION BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Item Count Badge */}
        <div className="flex items-center gap-2.5">
          <h2
            className={`text-base sm:text-lg font-black tracking-tight flex items-center gap-2 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Document Workspace
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              isDarkMode ? "bg-slate-800/90 text-blue-400 border border-slate-700/60" : "bg-slate-200 text-blue-700 font-black"
            }`}
          >
            {filteredCount}
          </span>
        </div>

        {/* Primary Action Buttons Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* New Folder Button */}
          {onOpenNewFolderModal && (
            <button
              type="button"
              onClick={onOpenNewFolderModal}
              className="p-2 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center gap-1.5 bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 shrink-0"
              title="Create a new folder"
            >
              <FolderPlus size={15} />
              <span>+ Folder</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <button
            type="button"
            onClick={() => setCodeMode(!codeMode)}
            className={`p-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              codeMode
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40"
                : isDarkMode
                ? "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
            title={codeMode ? "Switch to Visual Cards View" : "Switch to Developer Code View"}
          >
            {codeMode ? <LayoutGrid size={15} /> : <Code size={15} />}
            <span className="hidden sm:inline">{codeMode ? "Visual" : "Code View"}</span>
          </button>

          {/* Multi-Select Toggle */}
          <button
            type="button"
            onClick={toggleSelectMode}
            className={`p-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isSelectMode
                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                : isDarkMode
                ? "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle Multi-Select Mode"
          >
            <CheckSquare size={15} />
            <span className="hidden sm:inline">Select</span>
          </button>

          {/* Upload Dropdown Button */}
          {onFileUpload && (
            <UploadDropdown onFileUpload={onFileUpload} isDarkMode={isDarkMode} />
          )}

          {children}
        </div>
      </div>

      {/* ROW 2: SEARCH INPUT & CATEGORY FILTER PILLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filter Pills (Scrollable horizontally) */}
        {onFilterChange && displayFilterOptions.length > 1 && (
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto custom-scrollbar shrink-0 max-w-full ${
              isDarkMode
                ? "bg-slate-950/80 border-slate-800/80"
                : "bg-slate-100 border-slate-200 shadow-inner"
            }`}
          >
            {displayFilterOptions.map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFilterChange(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-medium outline-none border transition-all ${
              isDarkMode
                ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/40"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-md"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CanvasToolbar);

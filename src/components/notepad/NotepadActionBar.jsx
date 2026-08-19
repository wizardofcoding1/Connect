import React, { useState, useCallback, useRef, useEffect } from "react";
import { Sun, Palette, Copy, Check, Save, Download, ChevronDown, FileText, Code, FileSpreadsheet, Printer, Terminal } from "lucide-react";

const COLOR_OPTIONS = [
  { id: "default", label: "Default", bg: "bg-slate-400" },
  { id: "blue", label: "Blue", bg: "bg-blue-500" },
  { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500" },
  { id: "rose", label: "Rose", bg: "bg-rose-500" },
  { id: "purple", label: "Purple", bg: "bg-purple-500" },
];

const NotepadActionBar = ({
  currentTitle,
  currentContent,
  isDirty,
  isSaving,
  activeNote,
  onTitleChange,
  onSave,
  autoSaveEnabled = true,
  onToggleAutoSave,
  textColor = "default",
  onTextColorChange,
  isDarkMode = true,
  onDownload,
  onShare,
  isSharing,
  children,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const menuRef = useRef(null);

  const handleCopyAll = useCallback(async () => {
    if (!currentContent) return;
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error("Failed to copy note:", err);
    }
  }, [currentContent]);

  // Click outside to close download dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`px-3 sm:px-6 py-3 flex flex-col items-stretch border-b gap-3 transition-colors ${
        isDarkMode ? "bg-[#070d18] border-slate-800/80 text-white" : "bg-white border-slate-200"
      }`}
    >
      {/* Upper/Left Row: Sun Icon + Title Input + Color Palette */}
      <div className="flex flex-wrap items-center gap-2.5 w-full min-w-0">
        {/* Sun Indicator Icon */}
        {/* <div
          className={`p-2 rounded-xl border shrink-0 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-amber-400 shadow-md"
              : "bg-slate-100 border-slate-200 text-amber-500"
          }`}
          title="Notepad Workspace Active"
        >
          <Sun size={16} />
        </div> */}

        {/* Note Title Input */}
        <input
          type="text"
          className={`rounded-xl px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold outline-none transition-all duration-200 flex-1 min-w-[120px] border ${
            isDarkMode
              ? "bg-slate-950/80 border-slate-800 text-white focus:border-blue-500/60"
              : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600/60"
          }`}
          value={currentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isDirty) {
              onSave();
            }
          }}
          placeholder="Note Title (e.g. Note 4)..."
          disabled={!activeNote}
        />

        {/* Text Color Swatches */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border shrink-0 max-w-full overflow-x-auto custom-scrollbar transition-colors ${
            isDarkMode
              ? "bg-[#151f2e] border-slate-700/80 shadow-lg"
              : "bg-slate-100 border-slate-300 shadow-sm"
          }`}
        >
          <Palette size={14} className="text-slate-400 mr-0.5 shrink-0" title="Text Color Picker" />
          <div className="flex items-center gap-1.5 shrink-0">
            {COLOR_OPTIONS.map((opt) => {
              const isSelected = textColor === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTextColorChange(opt.id)}
                  disabled={!activeNote}
                  className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full ${opt.bg} transition-all cursor-pointer ${
                    isSelected
                      ? `ring-2 ring-sky-400 ring-offset-2 ${
                          isDarkMode ? "ring-offset-[#151f2e]" : "ring-offset-slate-100"
                        } opacity-100 scale-110`
                      : "opacity-80 hover:opacity-100"
                  } ${!activeNote ? "opacity-30 cursor-not-allowed" : ""}`}
                  title={`Set text color: ${opt.label}`}
                />
              );
            })}
          </div>
        </div>

        {children}
      </div>

      {/* Right Row: Auto Save Toggle + Status (Synced/Unsaved) + Actions */}
      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5 w-full pt-3 border-t border-slate-800/40">
        {/* Auto Save Toggle Switch */}
        <button
          type="button"
          onClick={onToggleAutoSave}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all duration-200 select-none ${
            autoSaveEnabled
              ? isDarkMode
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                : "bg-emerald-50 border-emerald-300 text-emerald-700"
              : isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-400"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
          title={autoSaveEnabled ? "Auto Save ENABLED" : "Auto Save DISABLED"}
        >
          <span className="text-[11px] font-bold">Auto Save</span>
          <div
            className={`w-6 h-3.5 rounded-full p-0.5 transition-colors ${
              autoSaveEnabled ? "bg-emerald-500" : "bg-slate-600"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full bg-white transition-transform ${
                autoSaveEnabled ? "translate-x-2.5" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold shrink-0 mr-1">
          {isSaving ? (
            <span className="text-blue-400 font-extrabold animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              Syncing...
            </span>
          ) : isDirty ? (
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Unsaved
            </span>
          ) : activeNote ? (
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Synced
            </span>
          ) : null}
        </div>

        {/* Copy All Text Button */}
        <button
          type="button"
          onClick={handleCopyAll}
          disabled={!activeNote || !currentContent}
          aria-label={copiedAll ? "Note text copied" : "Copy all note text"}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            copiedAll
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          } ${!activeNote || !currentContent ? "opacity-40 cursor-not-allowed" : ""}`}
          title="Copy entire note to clipboard"
        >
          {copiedAll ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copiedAll ? "Copied!" : "Copy"}</span>
        </button>

        {/* Export / Download Dropdown Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowDownloadMenu((prev) => !prev)}
            disabled={!activeNote}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all duration-200 border ${
              showDownloadMenu
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                : isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            } ${!activeNote ? "opacity-40 cursor-not-allowed" : ""}`}
            title="Download Note to Local formats"
          >
            <Download size={14} />
            <span>Export</span>
            <ChevronDown size={11} className={`transition-transform duration-200 ${showDownloadMenu ? "rotate-180" : ""}`} />
          </button>

          {showDownloadMenu && (
            <div
              className={`absolute right-0 mt-2 w-44 rounded-2xl border shadow-xl z-50 overflow-hidden animate-slideIn ${
                isDarkMode
                  ? "bg-[#0c1424]/95 border-slate-800 text-white backdrop-blur-xl shadow-black/45"
                  : "bg-white border-slate-200 text-slate-800 shadow-slate-200/50"
              }`}
            >
              {[
                { id: "txt", label: "Plain Text (.txt)", icon: <FileText size={13} /> },
                { id: "md", label: "Markdown (.md)", icon: <Code size={13} /> },
                { id: "docx", label: "Word Doc (.docx)", icon: <FileText size={13} /> },
                { id: "xlsx", label: "Excel Sheet (.xlsx)", icon: <FileSpreadsheet size={13} /> },
                { id: "pdf", label: "Print / PDF (.pdf)", icon: <Printer size={13} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onDownload(item.id);
                    setShowDownloadMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    isDarkMode ? "hover:bg-slate-800/80 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="text-slate-400 shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Share to Terminal CLI Button */}
        <button
          type="button"
          onClick={onShare}
          disabled={!activeNote || isSharing}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 border cursor-pointer ${
            isSharing
              ? "bg-slate-900 border-slate-800 text-slate-400 font-extrabold animate-pulse"
              : isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          } ${!activeNote ? "opacity-40 cursor-not-allowed" : ""}`}
          title="Share note as copyable CLI command for secondary devices"
        >
          {isSharing ? (
            <>
              <span className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></span>
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <Terminal size={14} />
              <span>Share CLI</span>
            </>
          )}
        </button>

        {/* Save Sync Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving || !activeNote}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-xs font-extrabold transition-all duration-200 border cursor-pointer ${
            isDirty
              ? "bg-blue-600 hover:bg-blue-550 text-white border-blue-500 shadow-lg shadow-blue-600/25 active:scale-95"
              : "bg-blue-600/40 border-blue-500/30 text-blue-200/50 cursor-not-allowed"
          }`}
          title="Save Note Sync (Ctrl+S)"
        >
          <Save size={14} />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(NotepadActionBar);

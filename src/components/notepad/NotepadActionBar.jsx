import React from "react";
import { Save, Sun, Palette } from "lucide-react";

const COLOR_OPTIONS = [
  { id: "default", label: "Default", color: "inherit", bg: "bg-slate-300 border-slate-400" },
  { id: "#38bdf8", label: "Electric Blue", color: "#38bdf8", bg: "bg-sky-400 border-sky-300" },
  { id: "#34d399", label: "Emerald Green", color: "#34d399", bg: "bg-emerald-400 border-emerald-300" },
  { id: "#fbbf24", label: "Amber Gold", color: "#fbbf24", bg: "bg-amber-400 border-amber-300" },
  { id: "#c084fc", label: "Neon Purple", color: "#c084fc", bg: "bg-purple-400 border-purple-300" },
  { id: "#f472b6", label: "Rose Pink", color: "#f472b6", bg: "bg-pink-400 border-pink-300" },
  { id: "#fb7185", label: "Coral Red", color: "#fb7185", bg: "bg-rose-400 border-rose-300" },
  { id: "#22d3ee", label: "Cyan", color: "#22d3ee", bg: "bg-cyan-400 border-cyan-300" },
];

const NotepadActionBar = ({
  currentTitle,
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
  children,
}) => {
  return (
    <div
      className={`px-3 sm:px-6 py-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between border-b gap-3 transition-colors ${
        isDarkMode ? "bg-[#070d18] border-slate-800/80 text-white" : "bg-white border-slate-200"
      }`}
    >
      {/* Upper/Left Row: Sun Icon + Title Input + Color Palette */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        {/* Sun Indicator Icon */}
        <div
          className={`p-2 rounded-xl border shrink-0 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-amber-400 shadow-md"
              : "bg-slate-100 border-slate-200 text-amber-500"
          }`}
          title="Notepad Workspace Active"
        >
          <Sun size={16} />
        </div>

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

        {/* Text Color Swatches (Always visible on ALL screen sizes!) */}
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

      {/* Right Row: Auto Save Toggle + Status (Synced/Unsaved) + Save Sync Button */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
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

        {/* Status Indicator (● Synced / ● Unsaved) */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold shrink-0">
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
          <span>Save Sync</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(NotepadActionBar);
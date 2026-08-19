import React from "react";
import { Folder, FolderOpen, Edit3, Trash2, ArrowRight, Pin, Check, X, Square, CheckSquare } from "lucide-react";

const FolderCard = ({
  item,
  itemCount = 0,
  isSelectMode,
  selected,
  onToggleSelect,
  onOpenFolder,
  onStartEditing,
  onSaveTitle,
  onCancelEditing,
  isEditing,
  tempTitle,
  setTempTitle,
  onConfirmDelete,
  onTogglePin,
  isDarkMode = true,
}) => {
  return (
    <div
      onClick={() => {
        if (isSelectMode) {
          onToggleSelect(item.id);
        } else {
          onOpenFolder(item.id);
        }
      }}
      className={`document-card-transition animate-popIn relative rounded-3xl p-5 border group flex flex-col justify-between transition-all duration-300 cursor-pointer h-fit self-start ${
        isDarkMode
          ? "bg-[#0b1329]/95 border-slate-800/90 shadow-xl shadow-black/50 hover:border-amber-500/40 hover:shadow-amber-500/10"
          : "bg-white border-slate-200 shadow-md hover:border-amber-400"
      } ${
        isSelectMode && selected
          ? isDarkMode
            ? "border-amber-500 ring-2 ring-amber-500/50 bg-amber-950/20"
            : "border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/50"
          : ""
      }`}
    >
      {/* SELECTION CHECKBOX FOR FOLDER */}
      {isSelectMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          className={`absolute top-4 right-4 z-20 p-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
            selected
              ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 scale-105"
              : isDarkMode
              ? "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 opacity-80 group-hover:opacity-100"
              : "bg-white border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 opacity-80 group-hover:opacity-100"
          }`}
          title={selected ? "Deselect folder" : "Select folder"}
        >
          {selected ? <CheckSquare size={16} /> : <Square size={16} />}
        </button>
      )}

      <div>
        {/* Header Row: Folder Icon + Title / Rename Input + Pinned Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/5 group-hover:scale-105 transition-transform duration-300">
            <Folder size={24} className="fill-amber-400/20" />
          </div>

          <div className={`flex items-center gap-1.5 shrink-0 ${isSelectMode ? "mr-9" : ""}`}>
            {item.is_pinned && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                <Pin size={10} className="fill-amber-400" />
                <span>Pinned</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
              FOLDER
            </span>
          </div>
        </div>

        {/* Title or Rename Input */}
        <div className="mb-4">
          {isEditing ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input
                className={`rounded-xl px-3 py-1.5 text-xs font-bold outline-none w-full border ${
                  isDarkMode
                    ? "bg-slate-950 border-amber-500/60 text-white focus:border-amber-400"
                    : "bg-slate-50 border-amber-500/60 text-slate-900 focus:border-amber-600"
                }`}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onSaveTitle(item.id);
                  } else if (e.key === "Escape") {
                    e.stopPropagation();
                    onCancelEditing();
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveTitle(item.id);
                }}
                className="text-emerald-400 p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer shrink-0"
                title="Save Title"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEditing();
                }}
                className="text-red-400 p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer shrink-0"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <h4
                className={`text-sm font-extrabold truncate tracking-tight mb-0.5 transition-colors ${
                  isDarkMode ? "text-white group-hover:text-amber-400" : "text-slate-900 group-hover:text-amber-600"
                }`}
                title={item.title}
              >
                {item.title || "Untitled Folder"}
              </h4>
              <p className="text-[11px] font-bold text-slate-400">
                {itemCount} {itemCount === 1 ? "item" : "items"} inside
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Spacious & Clean Action Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-800/50">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFolder(item.id);
          }}
          className="w-full py-2 px-3 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-white shadow-md shadow-amber-500/20 active:scale-95"
        >
          <FolderOpen size={14} />
          <span>Open Folder</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="grid grid-cols-3 gap-1 text-[11px] font-extrabold">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onTogglePin) onTogglePin(item.id);
            }}
            className={`min-w-0 transition cursor-pointer flex items-center justify-center gap-1 px-1 py-1 rounded-xl ${
              item.is_pinned
                ? "text-amber-400 bg-amber-500/15 border border-amber-500/30 font-black"
                : "text-slate-400 hover:text-amber-400"
            }`}
            title={item.is_pinned ? "Unpin folder" : "Pin folder"}
          >
            <Pin size={12} className={item.is_pinned ? "fill-amber-400" : ""} />
            <span>{item.is_pinned ? "Pinned" : "Pin"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing(item);
            }}
            className="min-w-0 text-slate-400 hover:text-amber-400 transition cursor-pointer flex items-center justify-center gap-1 px-1 py-1 rounded-xl"
            title="Rename folder"
          >
            <Edit3 size={12} />
            <span>Rename</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete(item.id);
            }}
            className="min-w-0 text-slate-400 hover:text-red-400 transition cursor-pointer flex items-center justify-center gap-1 px-1 py-1 rounded-xl"
            title="Delete folder"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FolderCard);

import React, { useState } from "react";
import { X } from "lucide-react";

const NotepadTabItem = ({
  tab,
  isActive,
  hasDraft,
  displayTitle,
  isEditingInline,
  onSelect,
  onDelete,
  onStartInlineEdit,
  onSaveInlineEdit,
  isDarkMode = true,
  children,
}) => {
  const [inlineTitle, setInlineTitle] = useState(displayTitle);

  return (
    <div
      className={`tab-transition animate-slideInRight flex items-center text-[11px] sm:text-xs font-bold cursor-pointer shrink-0 gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 border-t-2 rounded-xl max-w-[180px] sm:max-w-[220px] ${
        isActive
          ? isDarkMode
            ? "bg-slate-950 border-t-blue-500 text-white shadow-lg"
            : "bg-white border-t-blue-600 text-blue-600 shadow-md shadow-slate-200"
          : isDarkMode
          ? "bg-slate-900/30 border-t-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
          : "bg-slate-200/30 border-t-transparent text-slate-500 hover:bg-slate-200/80 hover:text-slate-700"
      }`}
      onClick={() => onSelect(tab.id)}
    >
      {isEditingInline ? (
        <input
          type="text"
          value={inlineTitle}
          onChange={(e) => setInlineTitle(e.target.value)}
          onBlur={() => onSaveInlineEdit(tab.id, inlineTitle)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveInlineEdit(tab.id, inlineTitle);
            if (e.key === "Escape") onSaveInlineEdit(tab.id, displayTitle);
          }}
          className={`px-2 py-0.5 rounded outline-none border text-xs w-24 font-bold ${
            isDarkMode
              ? "bg-slate-950 border-blue-500 text-white"
              : "bg-white border-blue-600 text-blue-600"
          }`}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="max-w-[110px] truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartInlineEdit(tab);
          }}
          title="Double-click to rename tab"
        >
          {displayTitle || "Note 1"}
        </span>
      )}

      {children}

      <span
        className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-250 ${
          hasDraft ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-sm"
        }`}
        title={hasDraft ? "Unsaved changes" : "Saved"}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(tab.id);
        }}
        className="hover:text-red-500 text-slate-400 transition-colors ml-1 p-0.5 rounded-md hover:bg-slate-200/50"
        title="Close tab"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default React.memo(NotepadTabItem);

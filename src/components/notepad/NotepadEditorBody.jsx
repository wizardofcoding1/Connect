import React, { useCallback, useRef, useState } from "react";
import { Edit3, Copy, Check } from "lucide-react";

const NotepadEditorBody = ({
  activeNote,
  currentContent,
  textColor = "default",
  isDarkMode = true,
  onContentChange,
  children,
}) => {
  const textareaRef = useRef(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [copied, setCopied] = useState(false);

  const hasSelection = selection.end > selection.start;
  const selectedText = hasSelection
    ? currentContent.slice(selection.start, selection.end)
    : "";

  const updateSelection = useCallback((e) => {
    setSelection({
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    });
  }, []);

  const handleCopySelection = useCallback(async () => {
    if (!selectedText) return;
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy selection:", err);
    }
  }, [selectedText]);

  return (
    <div
      className={`flex-1 relative overflow-hidden flex flex-col min-h-[300px] sm:min-h-[450px] ${
        isDarkMode ? "bg-[#060b14] text-slate-100" : "bg-white text-slate-800"
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {activeNote ? (
        <div className="flex-1 flex flex-col animate-fadeIn relative">
          {hasSelection && (
            <button
              type="button"
              onClick={handleCopySelection}
              aria-label={copied ? "Selected text copied" : "Copy selected text"}
              className={`absolute top-3 right-4 sm:top-4 sm:right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer transition-all duration-200 border animate-fadeIn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : isDarkMode
                  ? "bg-slate-800/95 hover:bg-sky-600 text-slate-200 hover:text-white border-slate-700/80 hover:border-sky-500"
                  : "bg-white hover:bg-blue-600 text-slate-800 hover:text-white border-slate-300 hover:border-blue-600"
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy Selection"}</span>
            </button>
          )}
          <textarea
            ref={textareaRef}
            className={`w-full flex-1 p-4 sm:p-6 text-xs sm:text-sm font-medium leading-relaxed resize-none outline-none custom-scrollbar transition-colors min-h-[260px] sm:min-h-[400px] ${
              isDarkMode
                ? "bg-[#060b14] placeholder-slate-600 focus:bg-[#060b14]"
                : "bg-white placeholder-slate-400 focus:bg-white"
            }`}
            style={{
              color:
                textColor !== "default"
                  ? textColor
                  : isDarkMode
                  ? "#f8fafc"
                  : "#1e293b",
            }}
            placeholder="Type your notes here... (Ctrl+S to save)"
            value={currentContent}
            onChange={(e) => {
              onContentChange(e.target.value);
              updateSelection(e);
            }}
            onSelect={updateSelection}
            onKeyUp={updateSelection}
            onMouseUp={updateSelection}
          />
          {children}
        </div>
      ) : (
        /* Notepad Empty State with Standalone Pencil Icon */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none animate-fadeIn min-h-[260px]">
          <div className="mb-4 animate-bounce">
            <Edit3
              size={48}
              className={`transition-colors ${
                isDarkMode ? "text-slate-500/80" : "text-slate-400"
              }`}
            />
          </div>
          <h3
            className={`text-base font-extrabold mb-1 tracking-tight ${
              isDarkMode ? "text-slate-200" : "text-slate-800"
            }`}
          >
            No Note Selected
          </h3>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Select a note or create one to start editing
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(NotepadEditorBody);

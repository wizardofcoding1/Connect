import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import ToastNotification from "./common/ToastNotification";
import NotepadTabItem from "./notepad/NotepadTabItem";
import NotepadActionBar from "./notepad/NotepadActionBar";
import NotepadEditorBody from "./notepad/NotepadEditorBody";

const Notepad = ({
  tabs = [],
  activeTabId,
  setActiveTabId,
  onAddTab,
  onUpdate,
  onDelete,
  isDarkMode = true,
}) => {
  const [drafts, setDrafts] = useState({}); // maps noteId -> { content, title }
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTabId, setDeletingTabId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTabId, setEditingTabId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("connect_autosave_enabled");
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [textColor, setTextColor] = useState(() => {
    try {
      return localStorage.getItem("connect_note_text_color") || "default";
    } catch (e) {
      return "default";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("connect_autosave_enabled", JSON.stringify(autoSaveEnabled));
    } catch (e) {}
  }, [autoSaveEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("connect_note_text_color", textColor);
    } catch (e) {}
  }, [textColor]);

  // Helper to compute display title (auto-naming Note 1, Note 2 if title is blank)
  const getTabTitle = useCallback(
    (targetTab, allTabs, draftsMap) => {
      if (!targetTab) return "Note 1";
      const targetDraft = draftsMap[targetTab.id];
      const targetTitle = (
        targetDraft !== undefined ? targetDraft.title : targetTab.title || ""
      ).trim();
      if (targetTitle) return targetTitle;

      const usedTitles = new Set();
      for (const t of allTabs) {
        if (t.id === targetTab.id) break;
        const draft = draftsMap[t.id];
        const explicitTitle = (
          draft !== undefined ? draft.title : t.title || ""
        ).trim();
        if (explicitTitle) {
          usedTitles.add(explicitTitle.toLowerCase());
        } else {
          let counter = 1;
          while (usedTitles.has(`note ${counter}`)) {
            counter++;
          }
          usedTitles.add(`note ${counter}`);
        }
      }

      for (const t of allTabs) {
        if (t.id === targetTab.id) continue;
        const draft = draftsMap[t.id];
        const explicitTitle = (
          draft !== undefined ? draft.title : t.title || ""
        ).trim();
        if (explicitTitle) {
          usedTitles.add(explicitTitle.toLowerCase());
        }
      }

      let counter = 1;
      while (usedTitles.has(`note ${counter}`)) {
        counter++;
      }
      return `Note ${counter}`;
    },
    []
  );

  const filteredTabs = useMemo(() => {
    return tabs.filter((t) => {
      const noteTitle = getTabTitle(t, tabs, drafts);
      const noteContent = drafts[t.id]?.content || t.content || "";
      const q = searchQuery.toLowerCase();
      return (
        noteTitle.toLowerCase().includes(q) || noteContent.toLowerCase().includes(q)
      );
    });
  }, [tabs, drafts, searchQuery, getTabTitle]);

  const activeNote = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId]
  );

  const currentContent =
    drafts[activeTabId] !== undefined
      ? drafts[activeTabId].content
      : activeNote?.content || "";

  const currentTitle =
    drafts[activeTabId] !== undefined
      ? drafts[activeTabId].title
      : activeNote?.title || "";

  const isDirty = drafts[activeTabId] !== undefined;

  // Prevent inspect element & DevTools shortcuts inside Notepad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" ||
            e.key === "i" ||
            e.key === "J" ||
            e.key === "j" ||
            e.key === "C" ||
            e.key === "c")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
      ) {
        e.preventDefault();
        return false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleContentChange = useCallback(
    (newContent) => {
      if (!activeTabId) return;
      setDrafts((prev) => ({
        ...prev,
        [activeTabId]: {
          content: newContent,
          title: currentTitle,
        },
      }));
    },
    [activeTabId, currentTitle]
  );

  const handleTitleChange = useCallback(
    (newTitle) => {
      if (!activeTabId) return;
      setDrafts((prev) => ({
        ...prev,
        [activeTabId]: {
          content: currentContent,
          title: newTitle,
        },
      }));
    },
    [activeTabId, currentContent]
  );

  const handleSave = useCallback(async () => {
    if (!activeTabId || !isDirty || isSaving) return;
    setIsSaving(true);

    let finalTitle = (currentTitle || "").trim();
    if (!finalTitle) {
      finalTitle = getTabTitle(activeNote, tabs, drafts);
    } else {
      const isDuplicate = tabs.some(
        (t) =>
          t.id !== activeTabId &&
          (t.title || "").trim().toLowerCase() === finalTitle.toLowerCase()
      );
      if (isDuplicate) {
        setNotification({
          type: "warning",
          title: "Duplicate Note Title",
          message: `A note titled "${finalTitle}" already exists! Please give it a unique name.`,
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      await onUpdate(activeTabId, currentContent, finalTitle);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[activeTabId];
        return next;
      });
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  }, [
    activeTabId,
    isDirty,
    isSaving,
    currentTitle,
    currentContent,
    activeNote,
    tabs,
    drafts,
    getTabTitle,
    onUpdate,
  ]);

  // Debounced Auto Save when autoSaveEnabled is true
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || isSaving || !activeTabId) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoSaveEnabled, isDirty, isSaving, activeTabId, currentContent, currentTitle, handleSave]);

  // Intercept Ctrl+S / Cmd+S globally in Notepad
  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [handleSave]);

  const handleStartInlineEdit = useCallback((tab) => {
    setEditingTabId(tab.id);
  }, []);

  const handleSaveInlineEdit = useCallback(
    async (tabId, rawTitle) => {
      setEditingTabId(null);
      let trimmed = rawTitle.trim();
      const targetTab = tabs.find((t) => t.id === tabId);
      if (!targetTab) return;

      if (!trimmed) {
        trimmed = getTabTitle(targetTab, tabs, drafts);
      } else {
        const isDuplicate = tabs.some(
          (t) =>
            t.id !== tabId &&
            (t.title || "").trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) {
          setNotification({
            type: "warning",
            title: "Duplicate Note Title",
            message: `A note titled "${trimmed}" already exists! Please choose a unique title.`,
          });
          return;
        }
      }

      const noteContent =
        drafts[tabId] !== undefined
          ? drafts[tabId].content
          : targetTab.content || "";
      await onUpdate(tabId, noteContent, trimmed);
    },
    [tabs, drafts, getTabTitle, onUpdate]
  );

  return (
    <div
      className={`flex-1 flex flex-col h-full min-h-full overflow-hidden p-4 sm:p-6 transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      <ToastNotification
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Sleek Outer Container Card for Notepad (matching Image 2) */}
      <div
        className={`flex-1 flex flex-col h-full min-h-full overflow-hidden rounded-[2rem] border shadow-2xl transition-all ${
          isDarkMode
            ? "bg-[#070d18] border-slate-800/90 shadow-black/60"
            : "bg-white border-slate-200 shadow-slate-200/80"
        }`}
      >
        {/* TOP TAB BAR & SEARCH ROW */}
        <div
          className={`px-4 pt-3 pb-1 border-b flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar transition-colors ${
            isDarkMode
              ? "bg-slate-900/50 border-slate-800/80"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar flex-1">
            {filteredTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const hasDraft = drafts[tab.id] !== undefined;
              const displayTitle = getTabTitle(tab, tabs, drafts);
              const isEditingInline = editingTabId === tab.id;

              return (
                <NotepadTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={isActive}
                  hasDraft={hasDraft}
                  displayTitle={displayTitle}
                  isEditingInline={isEditingInline}
                  onSelect={setActiveTabId}
                  onDelete={setDeletingTabId}
                  onStartInlineEdit={handleStartInlineEdit}
                  onSaveInlineEdit={handleSaveInlineEdit}
                  isDarkMode={isDarkMode}
                />
              );
            })}

            <button
              type="button"
              onClick={onAddTab}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
                isDarkMode
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60"
                  : "bg-white hover:bg-slate-200 text-slate-600 border-slate-300 shadow-sm"
              }`}
              title="Create New Note (Auto-names Note 1, Note 2 if empty)"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Note Search Input */}
          <div className="relative shrink-0 hidden sm:block w-48">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs outline-none border transition ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500/50"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600/50"
              }`}
            />
          </div>
        </div>

        {/* HEADER ACTION BAR */}
        <NotepadActionBar
          currentTitle={currentTitle}
          isDirty={isDirty}
          isSaving={isSaving}
          activeNote={activeNote}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={() => setAutoSaveEnabled((prev) => !prev)}
          textColor={textColor}
          onTextColorChange={setTextColor}
          isDarkMode={isDarkMode}
        />

        {/* TEXTAREA EDITOR BODY */}
        <NotepadEditorBody
          activeNote={activeNote}
          currentContent={currentContent}
          textColor={textColor}
          isDarkMode={isDarkMode}
          onContentChange={handleContentChange}
        />
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deletingTabId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-base font-bold text-white mb-2">Delete Note Tab?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete this note tab? Unsaved changes will be lost.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingTabId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deletingTabId;
                  setDeletingTabId(null);
                  setDrafts((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  });
                  await onDelete(id);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-550 text-white shadow-lg shadow-red-600/25 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Notepad);

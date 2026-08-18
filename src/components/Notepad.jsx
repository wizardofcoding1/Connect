import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, X, Clipboard, Check, Terminal, FileText, Code, FileSpreadsheet, Printer, Download, Share2 } from "lucide-react";
import { supabase } from "../supabaseClient";
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

  // Sharing states
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalData, setShareModalData] = useState(null); // { code, url, title }
  const [selectedShareFormat, setSelectedShareFormat] = useState("txt");
  const [selectedShareShell, setSelectedShareShell] = useState("bash");
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("connect_autosave_enabled");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [textColor, setTextColor] = useState(() => {
    try {
      return localStorage.getItem("connect_note_text_color") || "default";
    } catch {
      return "default";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("connect_autosave_enabled", JSON.stringify(autoSaveEnabled));
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded)
    }
  }, [autoSaveEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("connect_note_text_color", textColor);
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded)
    }
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

  // Generate 4-character typo-safe alphanumeric code
  const generateShortCode = useCallback(() => {
    const chars = "23456789ABCDEFGHJKMNPQRSTWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Upload share file to Supabase Public Bucket with expiration header
  const handleShareToTerminal = useCallback(async () => {
    if (!activeNote || isSharing) return;
    setIsSharing(true);

    const title = getTabTitle(activeNote, tabs, drafts);
    const content = drafts[activeNote.id]?.content !== undefined ? drafts[activeNote.id].content : activeNote.content || "";

    const code = generateShortCode();
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7); // 7 days expiration limit

    const fileContent = `CONNECT_SHARE_EXPIRE: ${expireDate.toISOString()}\n${content}`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const file = new File([blob], `${code}.txt`, { type: "text/plain;charset=utf-8" });

    try {
      const { error } = await supabase.storage
        .from("documents")
        .upload(`shares/${code}.txt`, file);

      if (error) throw error;

      const publicUrl = `https://crosser.vercel.app/t/${code}`;
      setShareModalData({
        code,
        url: publicUrl,
        title,
      });
      setSelectedShareFormat("txt");
      setSelectedShareShell("bash");
      setNotification({
        type: "success",
        title: "CLI Share Ready",
        message: "Upload complete! Code generated.",
      });
    } catch (err) {
      console.error("Upload share error:", err);
      setNotification({
        type: "error",
        title: "Share Failed",
        message: err.message || "Failed to upload file to storage.",
      });
    } finally {
      setIsSharing(false);
    }
  }, [activeNote, isSharing, generateShortCode, getTabTitle, tabs, drafts]);

  // Handle local exports from browser
  const handleDownloadNote = useCallback((format) => {
    if (!activeNote) return;
    const title = getTabTitle(activeNote, tabs, drafts);
    const content = drafts[activeNote.id]?.content !== undefined ? drafts[activeNote.id].content : activeNote.content || "";
    const filename = `${title.replace(/[\s\W]+/g, "_")}.${format}`;

    if (format === "txt") {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } else if (format === "md") {
      const mdContent = `# ${title}\n\n${content}`;
      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } else if (format === "docx") {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #1e3a8a; font-size: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 16px; }
            p { font-size: 14px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${content.replace(/\n/g, "<br/>")}</p>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } else if (format === "xlsx") {
      const rows = content.split("\n");
      const tableRows = rows.map((row) => `<tr><td>${row}</td></tr>`).join("");
      const excelContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title.slice(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
          <table>
            <thead>
              <tr><th style="font-weight:bold;background-color:#cbd5e1;text-align:left;">${title}</th></tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } else if (format === "pdf") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.7; }
                h1 { color: #1d4ed8; font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
                p { white-space: pre-wrap; font-size: 14px; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <p>${content}</p>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }, [activeNote, tabs, drafts, getTabTitle]);

  // Compute live command
  const getShareCommand = useCallback((code, format, shell) => {
    const extension = format === "txt" ? "" : `.${format}`;
    const url = `https://crosser.vercel.app/t/${code}${extension}`;
    const filename = `note_${code.toLowerCase()}.${format}`;

    if (shell === "bash") {
      return `curl -sL ${url} > ${filename} && echo -e "\\n\\x1b[35m[!] Classified data synchronized successfully... 😈\\x1b[0m"`;
    }
    if (shell === "powershell") {
      return `Invoke-RestMethod -Uri ${url} -OutFile ${filename}; Write-Host "[!] Classified data synchronized successfully... 😈" -ForegroundColor Cyan`;
    }
    if (shell === "cmd") {
      return `curl -sL ${url} -o ${filename} && echo [!] Classified data synchronized successfully... 😈`;
    }
    return `curl -sL ${url} > ${filename}`;
  }, []);

  const handleCopyCmd = useCallback((cmdText) => {
    navigator.clipboard.writeText(cmdText);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  }, []);

  const handleCopyLink = useCallback((linkText) => {
    navigator.clipboard.writeText(linkText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, []);

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

      {/* Sleek Outer Container Card for Notepad */}
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
              title="Create New Note"
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
          currentContent={currentContent}
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
          onDownload={handleDownloadNote}
          onShare={handleShareToTerminal}
          isSharing={isSharing}
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

      {/* SHARE TO TERMINAL MODAL */}
      {shareModalData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800/80 p-6 md:p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-left animate-zoomIn text-slate-100 flex flex-col relative select-text">
            
            <button
              onClick={() => setShareModalData(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
              title="Close Panel"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/10 border border-blue-500/25 text-blue-400 rounded-2xl">
                <Terminal size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Share to Terminal</h3>
                <p className="text-slate-400 text-[11px] font-semibold mt-0.5 uppercase tracking-wider">
                  Sync document to secondary devices
                </p>
              </div>
            </div>

            {/* FORMAT CHOOSER */}
            <div className="mb-5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                1. Select Export Format
              </label>
              <div className="flex flex-wrap gap-2">
                {["txt", "md", "docx", "xlsx", "pdf"].map((fmt) => {
                  const isActive = selectedShareFormat === fmt;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedShareFormat(fmt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer uppercase ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SHELL CHOOSER */}
            <div className="mb-5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                2. Select Terminal Shell
              </label>
              <div className="flex gap-2">
                {[
                  { id: "bash", label: "Bash (Mac/Linux)" },
                  { id: "powershell", label: "PowerShell (Windows)" },
                  { id: "cmd", label: "Command Prompt (CMD)" },
                ].map((sh) => {
                  const isActive = selectedShareShell === sh.id;
                  return (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setSelectedShareShell(sh.id)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {sh.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYNC COMMAND */}
            <div className="mb-5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                3. Run CLI command on target device
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-4 rounded-2xl select-text relative font-mono text-xs text-blue-300 leading-relaxed shadow-inner max-w-full overflow-x-auto">
                <span className="whitespace-pre">
                  {getShareCommand(shareModalData.code, selectedShareFormat, selectedShareShell)}
                </span>
                <button
                  onClick={() =>
                    handleCopyCmd(
                      getShareCommand(shareModalData.code, selectedShareFormat, selectedShareShell)
                    )
                  }
                  className={`p-2 rounded-xl border shrink-0 transition ml-auto cursor-pointer ${
                    copiedCmd
                      ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white"
                  }`}
                  title="Copy command to clipboard"
                >
                  {copiedCmd ? <Check size={14} /> : <Clipboard size={14} />}
                </button>
              </div>
            </div>

            {/* SHORT URL */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                Short share URL
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-4 py-3 rounded-2xl select-text font-mono text-xs text-slate-300">
                <span className="truncate">{`${shareModalData.url}${selectedShareFormat === "txt" ? "" : `.${selectedShareFormat}`}`}</span>
                <button
                  onClick={() =>
                    handleCopyLink(
                      `${shareModalData.url}${selectedShareFormat === "txt" ? "" : `.${selectedShareFormat}`}`
                    )
                  }
                  className={`p-2 rounded-xl border shrink-0 transition ml-auto cursor-pointer ${
                    copiedLink
                      ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400"
                      : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white"
                  }`}
                  title="Copy link to clipboard"
                >
                  {copiedLink ? <Check size={14} /> : <Clipboard size={14} />}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
              <span>Expires automatically in 7 days</span>
              <span className="text-yellow-500/70">Secure Code: {shareModalData.code}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Notepad);

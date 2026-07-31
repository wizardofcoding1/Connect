import React, { useState, useMemo, useCallback } from "react";
import { UploadCloud, Folder, ChevronRight, ArrowLeft, FileText } from "lucide-react";
import ConfirmModal from "./canvas/ConfirmModal";
import SelectionBar from "./canvas/SelectionBar";
import RocketProgressConsole from "./canvas/RocketProgressConsole";
import DocumentCard from "./canvas/DocumentCard";
import FolderCard from "./canvas/FolderCard";
import NewFolderModal from "./canvas/NewFolderModal";
import CanvasToolbar from "./canvas/CanvasToolbar";
import CanvasEmptyState from "./canvas/CanvasEmptyState";
import CanvasGrid from "./canvas/CanvasGrid";

const CanvasEditor = ({
  items = [],
  onDelete,
  onDeleteMultiple,
  onFileUpload,
  onCreateFolder,
  onTogglePin,
  onCancelUpload,
  onCancelFile,
  onCloseNotification,
  uploadProgress,
  onUpdateTitle,
  isDarkMode = true,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState("");
  const [codeMode, setCodeMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const activeFolder = useMemo(
    () => items.find((i) => i.id === activeFolderId && i.type === "folder"),
    [items, activeFolderId]
  );

  // Scoped items belonging to the root or current active folder
  const scopedItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFolderId) {
        return item.folder_id === activeFolderId;
      } else {
        return !item.folder_id;
      }
    });
  }, [items, activeFolderId]);

  // Dynamically generate filter options based ONLY on types actually present in scopedItems
  const dynamicFilterOptions = useMemo(() => {
    const typesPresent = new Set(scopedItems.map((i) => i.type).filter(Boolean));
    const options = [{ id: "all", label: "All" }];

    if (typesPresent.has("folder")) options.push({ id: "folder", label: "Folders" });
    if (typesPresent.has("pdf")) options.push({ id: "pdf", label: "PDFs" });
    if (typesPresent.has("image")) options.push({ id: "image", label: "Images" });
    if (typesPresent.has("doc")) options.push({ id: "doc", label: "Docs" });

    typesPresent.forEach((t) => {
      if (!["folder", "pdf", "image", "doc", "note", "link"].includes(t)) {
        options.push({ id: t, label: t.toUpperCase() });
      }
    });

    return options;
  }, [scopedItems]);

  // Filter scoped items by search query & active category filter
  const filteredItems = useMemo(() => {
    return scopedItems.filter((item) => {
      const matchesSearch =
        (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "folder" || activeFilter === "folders") return item.type === "folder";
      if (activeFilter === "pdf") return item.type === "pdf";
      if (activeFilter === "image") return item.type === "image";
      if (activeFilter === "doc") return item.type === "doc";
      return item.type === activeFilter;
    });
  }, [scopedItems, searchQuery, activeFilter]);

  // Sort items so pinned items (is_pinned === true) always appear at the top
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [filteredItems]);

  // Separate folders and documents for clean top-stacked folder section
  const foldersList = useMemo(
    () => sortedItems.filter((i) => i.type === "folder"),
    [sortedItems]
  );

  const documentsList = useMemo(
    () => sortedItems.filter((i) => i.type !== "folder"),
    [sortedItems]
  );

  const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === sortedItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedItems.map((i) => i.id));
    }
  }, [selectedIds, sortedItems]);

  const handleDownload = useCallback(async (url, filename) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document";
      link.target = "_blank";
      link.click();
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileUpload(Array.from(e.dataTransfer.files), activeFolderId);
      }
    },
    [onFileUpload, activeFolderId]
  );

  const handleStartEditing = useCallback((item) => {
    setEditingId(item.id);
    setTempTitle(item.title || "");
  }, []);

  const handleSaveTitle = useCallback(
    (id) => {
      onUpdateTitle(id, tempTitle);
      setEditingId(null);
    },
    [onUpdateTitle, tempTitle]
  );

  const handleCancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleCreateFolderSubmit = (folderTitle) => {
    if (onCreateFolder) {
      onCreateFolder(folderTitle, activeFolderId);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full min-h-full overflow-hidden transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* TOOLBAR COMPONENT */}
      <CanvasToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        codeMode={codeMode}
        setCodeMode={setCodeMode}
        isSelectMode={isSelectMode}
        toggleSelectMode={toggleSelectMode}
        filteredCount={sortedItems.length}
        onFileUpload={(files) => onFileUpload(files, activeFolderId)}
        onOpenNewFolderModal={() => setShowNewFolderModal(true)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={dynamicFilterOptions}
        isDarkMode={isDarkMode}
      />

      {/* ACTIVE FILE DRAG OVERLAY */}
      {isDragging && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none pointer-events-none">
          <div className="w-full max-w-lg p-12 rounded-[2.5rem] border-2 border-dashed border-blue-500 bg-[#070e1c]/95 flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-500/25 animate-popIn">
            <div className="mb-5 animate-bounce">
              <UploadCloud size={64} className="text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
              Drop your files here
            </h3>
            <p className="text-xs font-bold text-slate-400">
              {activeFolder ? `Files will be stored in "${activeFolder.title}"` : "PDFs, Docs, or Images up to 50MB"}
            </p>
          </div>
        </div>
      )}

      {/* ROCKET PROGRESS CONSOLE */}
      {uploadProgress && (
        <RocketProgressConsole
          uploadProgress={uploadProgress}
          onCancelUpload={onCancelUpload}
          onCancelFile={onCancelFile}
          onCloseNotification={onCloseNotification}
          isDarkMode={isDarkMode}
        />
      )}

      {/* NEW FOLDER CREATION MODAL */}
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreateFolder={handleCreateFolderSubmit}
        isDarkMode={isDarkMode}
      />

      {/* MAIN DOCUMENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* BREADCRUMB NAVIGATION BAR WHEN INSIDE A FOLDER */}
        {activeFolderId && (
          <div
            className={`mb-6 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3.5 px-4 sm:px-5 rounded-2xl border animate-fadeIn transition-all shadow-md ${
              isDarkMode
                ? "bg-[#070e1b]/90 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 shadow-sm text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-extrabold min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveFolderId(null);
                  setSearchQuery("");
                }}
                className={`transition cursor-pointer flex items-center gap-1 shrink-0 hover:underline ${
                  isDarkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Documents</span>
              </button>
              <ChevronRight
                size={14}
                className={`shrink-0 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}
              />
              <div
                className={`flex items-center gap-1.5 min-w-0 ${
                  isDarkMode ? "text-amber-400" : "text-amber-600 font-black"
                }`}
              >
                <Folder size={15} className="shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[240px]" title={activeFolder?.title || "Folder"}>
                  {activeFolder?.title || "Folder"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveFolderId(null);
                setSearchQuery("");
              }}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0 ${
                isDarkMode
                  ? "bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/80 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
              }`}
            >
              <ArrowLeft size={14} />
              <span className="hidden xs:inline">Back to </span>
              <span>Documents</span>
            </button>
          </div>
        )}

        {/* SELECTION BAR (AT TOP) */}
        {isSelectMode && (
          <SelectionBar
            selectedCount={selectedIds.length}
            totalCount={sortedItems.length}
            onSelectAll={handleSelectAll}
            onBatchDelete={() => setShowBatchDeleteModal(true)}
            onDeleteAll={() => setShowDeleteAllModal(true)}
            onCancel={toggleSelectMode}
            isDarkMode={isDarkMode}
          />
        )}

        {sortedItems.length === 0 ? (
          <CanvasEmptyState
            onFileUpload={(files) => onFileUpload(files, activeFolderId)}
            isDragging={isDragging}
            activeFolder={activeFolder}
            isDarkMode={isDarkMode}
          />
        ) : (
          <div className="space-y-8">
            {/* DEDICATED TOP-STACKED FOLDERS SECTION */}
            {foldersList.length > 0 && (
              <div className="border-b border-slate-800/60 pb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Folder size={14} className="fill-amber-400/20" />
                  <span>Folders ({foldersList.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {foldersList.map((item) => {
                    const itemCountInside = items.filter(
                      (i) => i.folder_id === item.id
                    ).length;

                    return (
                      <FolderCard
                        key={item.id}
                        item={item}
                        itemCount={itemCountInside}
                        isSelectMode={isSelectMode}
                        selected={isSelected(item.id)}
                        onToggleSelect={toggleSelect}
                        onOpenFolder={(folderId) => {
                          setActiveFolderId(folderId);
                          setSearchQuery("");
                        }}
                        onStartEditing={handleStartEditing}
                        onSaveTitle={handleSaveTitle}
                        onCancelEditing={handleCancelEditing}
                        isEditing={editingId === item.id}
                        tempTitle={tempTitle}
                        setTempTitle={setTempTitle}
                        onConfirmDelete={(id) => {
                          setItemToDelete(item);
                          setShowDeleteModal(true);
                        }}
                        onTogglePin={(id) => onTogglePin && onTogglePin(id, activeFolderId)}
                        isDarkMode={isDarkMode}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* DOCUMENTS & FILES SECTION */}
            {documentsList.length > 0 && (
              <div>
                {foldersList.length > 0 && (
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Files & Documents ({documentsList.length})</span>
                  </h4>
                )}
                <CanvasGrid isDarkMode={isDarkMode}>
                  {documentsList.map((item) => (
                    <DocumentCard
                      key={item.id}
                      item={item}
                      codeMode={codeMode}
                      isSelectMode={isSelectMode}
                      selected={isSelected(item.id)}
                      isDeleting={deletingId === item.id}
                      onToggleSelect={toggleSelect}
                      onStartEditing={handleStartEditing}
                      onSaveTitle={handleSaveTitle}
                      onCancelEditing={handleCancelEditing}
                      isEditing={editingId === item.id}
                      tempTitle={tempTitle}
                      setTempTitle={setTempTitle}
                      onConfirmDelete={(id) => {
                        setItemToDelete(item);
                        setShowDeleteModal(true);
                      }}
                      onDownload={handleDownload}
                      onTogglePin={(id) => onTogglePin && onTogglePin(id, activeFolderId)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </CanvasGrid>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRM MODALS */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (itemToDelete) {
            setDeletingId(itemToDelete.id);
            setShowDeleteModal(false);
            await onDelete(itemToDelete.id);
            setDeletingId(null);
          }
        }}
        title={itemToDelete?.type === "folder" ? "Delete Folder?" : "Delete Document?"}
        message={`Are you sure you want to delete "${itemToDelete?.title}"? ${
          itemToDelete?.type === "folder" ? "Files inside this folder will also be deleted." : "This action cannot be undone."
        }`}
        confirmText="Delete"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={showBatchDeleteModal}
        onClose={() => setShowBatchDeleteModal(false)}
        onConfirm={async () => {
          setShowBatchDeleteModal(false);
          await onDeleteMultiple(selectedIds);
          setSelectedIds([]);
          setIsSelectMode(false);
        }}
        title="Delete Selected Items?"
        message={`Are you sure you want to delete ${selectedIds.length} selected document(s)?`}
        confirmText="Delete Selected"
        isDanger={true}
      />

      <ConfirmModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={async () => {
          setShowDeleteAllModal(false);
          const allIds = sortedItems.map((i) => i.id);
          await onDeleteMultiple(allIds);
          setSelectedIds([]);
          setIsSelectMode(false);
        }}
        title="Delete ALL Documents?"
        message="Are you sure you want to delete ALL documents in this view? This action is permanent."
        confirmText="Delete All Documents"
        isDanger={true}
      />
    </div>
  );
};

export default React.memo(CanvasEditor);

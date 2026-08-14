import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Footer from "../common/Footer";

// Lazy-load subcomponents to decrease initial bundle size and boost performance
const Notepad = lazy(() => import("../Notepad"));
const CanvasEditor = lazy(() => import("../CanvasEditor"));
const OurStory = lazy(() => import("../OurStory"));
const LinkVault = lazy(() => import("../LinkVault"));

const SubcomponentLoader = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-slate-400 py-20">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
    <span className="text-xs font-semibold tracking-wider">Loading Workspace...</span>
  </div>
);

const WorkspaceView = ({
  viewType,
  items,
  activeTabId,
  setActiveTabId,
  addNewTab,
  updateNoteContent,
  deleteItem,
  deleteMultipleItems,
  handleFileUpload,
  onCreateFolder,
  onTogglePin,
  handleCancelUpload,
  handleCancelFile,
  onCloseNotification,
  uploadProgress,
  renameItem,
  addLinkItem,
  editLinkItem,
  isDarkMode,
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
      <div className="flex-1 flex flex-col shrink-0 min-h-[calc(100vh-3.5rem)] md:min-h-screen">
        <Suspense fallback={<SubcomponentLoader />}>
          {viewType === "notes" ? (
            <Notepad
              tabs={items.filter((i) => i.type === "note")}
              activeTabId={activeTabId}
              setActiveTabId={setActiveTabId}
              onAddTab={addNewTab}
              onUpdate={updateNoteContent}
              onDelete={deleteItem}
              isDarkMode={isDarkMode}
            />
          ) : viewType === "canvas" ? (
            <CanvasEditor
              items={items.filter((i) => i.type !== "note" && i.type !== "link")}
              onDelete={deleteItem}
              onDeleteMultiple={deleteMultipleItems}
              onFileUpload={handleFileUpload}
              onCreateFolder={onCreateFolder}
              onTogglePin={onTogglePin}
              onCancelUpload={handleCancelUpload}
              onCancelFile={handleCancelFile}
              onCloseNotification={onCloseNotification}
              uploadProgress={uploadProgress}
              onUpdateTitle={renameItem}
              isDarkMode={isDarkMode}
            />
          ) : viewType === "links" ? (
            <LinkVault
              items={items}
              onAddLink={addLinkItem}
              onDeleteLink={deleteItem}
              onEditLink={editLinkItem}
              isDarkMode={isDarkMode}
            />
          ) : (
            <OurStory />
          )}
        </Suspense>
      </div>

      {/* FOOTER COMPONENT WITH SOCIAL LINKS & COLLABORATION QUOTE */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default React.memo(WorkspaceView);

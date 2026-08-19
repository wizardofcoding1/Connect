import React from "react";
import {
  FileText,
  Trash2,
  Eye,
  Edit3,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  Download,
  Square,
  CheckSquare,
  FileSpreadsheet,
  FileArchive,
  Link as LinkIcon,
  Pin,
  Loader,
} from "lucide-react";
import { useSignedUrl } from "../../lib/storage";

const DocumentCard = ({
  item,
  codeMode,
  isSelectMode,
  selected,
  isDeleting,
  onToggleSelect,
  onStartEditing,
  onSaveTitle,
  onCancelEditing,
  isEditing,
  tempTitle,
  setTempTitle,
  onConfirmDelete,
  onDownload,
  onTogglePin,
  isDarkMode = true,
}) => {
  const getFileDetails = (type, title = "") => {
    const lowerType = (type || "").toLowerCase();
    const ext = title.split(".").pop().toLowerCase();

    if (lowerType === "image" || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
      return {
        icon: <ImageIcon size={26} className="text-emerald-400" />,
        badge: "IMAGE",
        iconBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5",
      };
    }
    if (lowerType === "pdf" || ext === "pdf") {
      return {
        icon: <FileCode size={26} className="text-red-400" />,
        badge: "PDF",
        iconBg: "bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/5",
      };
    }
    if (lowerType === "link" || lowerType.includes("link")) {
      return {
        icon: <LinkIcon size={26} className="text-blue-400" />,
        badge: "LINK",
        iconBg: "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/5",
      };
    }
    if (["doc", "docx"].includes(ext) || lowerType.includes("doc")) {
      return {
        icon: <FileText size={26} className="text-blue-400" />,
        badge: "DOC",
        iconBg: "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/5",
      };
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return {
        icon: <FileSpreadsheet size={26} className="text-emerald-400" />,
        badge: "SHEET",
        iconBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5",
      };
    }
    if (["zip", "rar", "7z", "tar"].includes(ext)) {
      return {
        icon: <FileArchive size={26} className="text-amber-400" />,
        badge: "ARCHIVE",
        iconBg: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5",
      };
    }
    return {
      icon: <FileText size={26} className="text-indigo-400" />,
      badge: (type || ext || "FILE").toUpperCase(),
      iconBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-indigo-500/5",
    };
  };

  const details = getFileDetails(item.type, item.title);
  const signedUrl = useSignedUrl(item.url);

  // While signing is in flight, use empty string to avoid showing an old public URL
  const displayUrl = signedUrl || "";

  return (
    <div
      onClick={() => {
        if (isSelectMode) onToggleSelect(item.id);
      }}
      className={`document-card-transition animate-popIn relative ${
        isDeleting
          ? "scale-75 opacity-0 rotate-3 translate-y-4 pointer-events-none"
          : "scale-100 opacity-100"
      } ${
        codeMode
          ? `bg-[#161b22] border-l-4 ${
              isSelectMode && selected
                ? "border-blue-400 bg-blue-950/30"
                : "border-blue-500"
            } p-4 flex items-center justify-between group hover:bg-[#1c2128] border-y border-r border-[#30363d] rounded-r-xl ${
              isDeleting
                ? "max-h-0 py-0 my-0 border-none overflow-hidden"
                : "max-h-[150px]"
            }`
          : `${
              isDarkMode
                ? "bg-[#0b1329]/90 border border-slate-800/90 shadow-2xl shadow-black/50 hover:border-slate-700/80 hover:shadow-black/70"
                : "bg-white border-slate-200 shadow-lg hover:border-slate-300"
            } p-6 sm:p-7 rounded-[2rem] border ${
              isSelectMode && selected
                ? isDarkMode
                  ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/20"
                  : "border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/50"
                : "hover:border-blue-500/40"
            } group flex flex-col justify-between transition-all duration-300 ${
              isSelectMode ? "cursor-pointer" : ""
            }`
      }`}
    >
      {/* CARD SELECTION CHECKBOX */}
      {isSelectMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          className={`z-20 p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
            codeMode ? "mr-2 shrink-0" : "absolute top-5 right-5"
          } ${
            selected
              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30 scale-105"
              : isDarkMode
              ? "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 opacity-80 group-hover:opacity-100"
              : "bg-white border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 opacity-80 group-hover:opacity-100"
          }`}
          title={selected ? "Deselect item" : "Select item"}
        >
          {selected ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>
      )}

      {/* ITEM CARD CONTENTS */}
      <div className={codeMode ? "flex items-center gap-4 flex-1 min-w-0" : ""}>
        {!codeMode && item.type === "image" && item.url ? (
          <div
            className={`w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-4 border flex items-center justify-center p-2 relative transition-all duration-300 ${
              isDarkMode
                ? "bg-slate-950/90 border-slate-800/80 group-hover:border-blue-500/40 shadow-inner"
                : "bg-slate-100 border-slate-200 group-hover:border-blue-500/40 shadow-inner"
            }`}
          >
            {displayUrl ? (
              <img
                src={displayUrl}
                alt={item.title || "Image"}
                className="max-h-full max-w-full object-contain rounded-xl drop-shadow-lg group-hover:scale-105 transition-all duration-300"
              />
            ) : (
              <Loader size={24} className="text-blue-400 animate-spin" />
            )}
          </div>
        ) : (
          !codeMode && (
            <div className="flex items-start justify-between gap-3 mb-5">
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${details.iconBg}`}
              >
                {details.icon}
              </div>
            </div>
          )
        )}

        {codeMode && (
          <div className="p-2.5 rounded-xl bg-slate-800 shrink-0">
            {details.icon}
          </div>
        )}

        {/* Title / Info */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                className={`rounded-xl px-3.5 py-2 text-xs outline-none w-full border ${
                  codeMode
                    ? "bg-[#0d1117] text-white border-blue-500"
                    : isDarkMode
                    ? "bg-slate-950 border-slate-800 text-white focus:border-blue-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600"
                }`}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveTitle(item.id);
                }}
                className="text-emerald-400 p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <Check size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEditing();
                }}
                className="text-red-400 p-1.5 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div>
              <h3
                className={`text-sm sm:text-base font-extrabold truncate tracking-tight mb-1 ${
                  codeMode
                    ? "text-blue-400 font-mono"
                    : isDarkMode
                    ? "text-white"
                    : "text-slate-900"
                }`}
                title={item.title}
              >
                {codeMode ? (
                  <>
                    <span className="text-slate-500 font-normal">const </span>
                    <span className="text-blue-400 font-bold">doc</span> ={" "}
                    <span className="text-orange-400">"{item.type}"</span>
                  </>
                ) : (
                  item.title || "Untitled Document"
                )}
              </h3>
              {!codeMode && (
                <div className="flex items-center gap-2 mb-6">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest">
                    {details.badge}
                  </p>
                  {item.is_pinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                      <Pin size={10} className="fill-amber-400" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTION FOOTER */}
      <div
        className={`flex flex-col gap-4 ${
          codeMode
            ? "ml-4 !flex-row items-center justify-between"
            : `border-t pt-5 ${
                isDarkMode ? "border-slate-800/80" : "border-slate-200"
              }`
        }`}
      >
        {!codeMode ? (
          <>
            <div className="grid grid-cols-2 gap-3 w-full">
              <a
                href={displayUrl || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!displayUrl) e.preventDefault();
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs text-white shadow-lg shadow-blue-600/25 active:scale-[0.97] transition-all duration-200 ${
                  displayUrl
                    ? "bg-blue-600 hover:bg-blue-550 cursor-pointer"
                    : "bg-slate-600 cursor-not-allowed opacity-60"
                }`}
                title={displayUrl ? "View File" : "Signing URL..."}
                disabled={!displayUrl}
              >
                {displayUrl ? (
                  <>
                    <Eye size={16} className="shrink-0" />
                    <span>View</span>
                  </>
                ) : (
                  <>
                    <Loader size={14} className="shrink-0 animate-spin" />
                    <span>Signing...</span>
                  </>
                )}
              </a>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (displayUrl) onDownload(displayUrl, item.title);
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs text-white shadow-lg shadow-emerald-600/25 active:scale-[0.97] transition-all duration-200 ${
                  displayUrl
                    ? "bg-emerald-600 hover:bg-emerald-550 cursor-pointer"
                    : "bg-slate-600 cursor-not-allowed opacity-60"
                }`}
                title={displayUrl ? "Download File" : "Signing URL..."}
                disabled={!displayUrl}
              >
                {displayUrl ? (
                  <>
                    <Download size={16} className="shrink-0" />
                    <span>Download</span>
                  </>
                ) : (
                  <>
                    <Loader size={14} className="shrink-0 animate-spin" />
                    <span>Signing...</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between px-1 border-t border-slate-800/40 pt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTogglePin) onTogglePin(item.id);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer px-2 py-1 rounded-xl ${
                  item.is_pinned
                    ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                    : "text-slate-400 hover:text-amber-400"
                }`}
                title={item.is_pinned ? "Unpin document" : "Pin document (max 5)"}
              >
                <Pin size={14} className={item.is_pinned ? "fill-amber-400" : ""} />
                <span>{item.is_pinned ? "Pinned" : "Pin"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEditing(item);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer px-2 py-1 rounded-xl ${
                  isDarkMode
                    ? "hover:text-blue-400 text-slate-400"
                    : "hover:text-blue-600 text-slate-600"
                }`}
                title="Rename File"
              >
                <Edit3 size={14} />
                <span>Rename</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmDelete(item);
                }}
                className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer px-2 py-1 rounded-xl ${
                  isDarkMode
                    ? "hover:text-red-400 text-slate-400"
                    : "hover:text-red-600 text-slate-600"
                }`}
                title="Delete File"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTogglePin) onTogglePin(item.id);
              }}
              className={`p-2.5 rounded-xl transition cursor-pointer ${
                item.is_pinned
                  ? "text-amber-400 bg-amber-500/20 border border-amber-500/40"
                  : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
              }`}
              title={item.is_pinned ? "Unpin File" : "Pin File (max 5)"}
            >
              <Pin size={16} className={item.is_pinned ? "fill-amber-400" : ""} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(item);
              }}
              className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Rename File"
            >
              <Edit3 size={16} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmDelete(item);
              }}
              className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Delete File"
            >
              <Trash2 size={16} />
            </button>
            <a
              href={displayUrl || "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                if (!displayUrl) e.preventDefault();
              }}
              className={`p-2.5 rounded-xl transition border ${
                displayUrl
                  ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 border-blue-500/20"
                  : "text-slate-500 bg-slate-500/10 border-slate-500/20 cursor-not-allowed opacity-50"
              }`}
              title={displayUrl ? "View File" : "Signing URL..."}
            >
              {displayUrl ? <Eye size={16} /> : <Loader size={16} className="animate-spin" />}
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (displayUrl) onDownload(displayUrl, item.title);
              }}
              className={`p-2.5 rounded-xl transition border ${
                displayUrl
                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/20 cursor-pointer"
                  : "text-slate-500 bg-slate-500/10 border-slate-500/20 cursor-not-allowed opacity-50"
              }`}
              title={displayUrl ? "Download File" : "Signing URL..."}
              disabled={!displayUrl}
            >
              {displayUrl ? <Download size={16} /> : <Loader size={16} className="animate-spin" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DocumentCard);

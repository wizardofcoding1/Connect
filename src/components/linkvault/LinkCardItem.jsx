import React from "react";
import { ExternalLink, Copy, Check, Trash2, Pencil } from "lucide-react";

const LinkCardItem = ({
  linkItem,
  copiedId,
  onCopy,
  onDelete,
  onEdit,
  isDarkMode = true,
  children,
}) => {
  const isCopied = copiedId === linkItem.id;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-300 animate-popIn flex flex-col justify-between hover:-translate-y-1 group relative overflow-hidden ${
        isDarkMode
          ? "bg-[#0b1326] border-slate-800/90 hover:border-sky-500/40 text-white shadow-2xl"
          : "bg-white border-slate-200 hover:border-blue-400/50 text-slate-900 shadow-md hover:shadow-xl"
      }`}
    >
      <div>
        {/* Top Row: Title + Edit/Delete Buttons */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h4
              className={`text-base font-black truncate tracking-tight ${
                isDarkMode ? "text-sky-400" : "text-blue-600"
              }`}
            >
              {linkItem.title || "Untitled Link"}
            </h4>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(linkItem)}
                aria-label={`Edit ${linkItem.title || "link"}`}
                className={`p-1.5 rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isDarkMode
                    ? "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
                title="Edit Link"
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(linkItem.id)}
              aria-label={`Delete ${linkItem.title || "link"}`}
              className={`p-1.5 rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                isDarkMode
                  ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50"
              }`}
              title="Delete Link"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* URL Box */}
        <div className="mb-4">
          <p
            className={`text-xs font-mono truncate px-3 py-2.5 rounded-xl border ${
              isDarkMode
                ? "bg-[#050a14] text-sky-400 border-slate-800/90"
                : "bg-slate-50 text-blue-600 border-slate-200/90"
            }`}
          >
            {linkItem.url || "No URL specified"}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className={`flex items-center gap-2 pt-2 border-t ${isDarkMode ? "border-slate-800/60" : "border-slate-200"}`}>
        <button
          type="button"
          onClick={() => onCopy(linkItem)}
          aria-label={isCopied ? "Link copied to clipboard" : `Copy ${linkItem.title || "link"} URL`}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            isCopied
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10 scale-[1.02]"
              : isDarkMode
              ? "bg-slate-800/90 hover:bg-sky-600 text-slate-200 hover:text-white border-slate-700/80 hover:border-sky-500 shadow-md"
              : "bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white border-slate-200 hover:border-blue-600"
          }`}
        >
          {isCopied ? <Check size={14} className="text-emerald-400 animate-bounce" /> : <Copy size={14} />}
          <span>{isCopied ? "Copied!" : "Copy Link"}</span>
        </button>

        {linkItem.url && (
          <a
            href={linkItem.url.startsWith("http") ? linkItem.url : `https://${linkItem.url}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${linkItem.title || "link"} in new tab`}
            className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              isDarkMode
                ? "text-slate-400 hover:text-sky-400 bg-slate-800/60 hover:bg-slate-800 border-slate-700/80"
                : "text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 border-slate-200"
            }`}
            title="Open link in new tab"
          >
            <ExternalLink size={15} />
          </a>
        )}
        {children}
      </div>
    </div>
  );
};

export default React.memo(LinkCardItem);

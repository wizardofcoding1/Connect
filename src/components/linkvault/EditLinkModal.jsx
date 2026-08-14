import React, { useState, useEffect, useRef, useId } from "react";
import { Bookmark, Globe, Pencil, X } from "lucide-react";

const EditLinkModal = ({ linkItem, onClose, onSave, isDarkMode = true }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);
  const titleFieldId = useId();
  const urlFieldId = useId();
  const headingId = useId();

  useEffect(() => {
    if (linkItem) {
      setTitle(linkItem.title || "");
      setUrl(linkItem.url || "");
      // Focus the first field once the modal mounts
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  }, [linkItem]);

  useEffect(() => {
    if (!linkItem) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [linkItem, onClose]);

  if (!linkItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(linkItem.id, title.trim(), url.trim());
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border relative ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close edit link dialog"
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            isDarkMode
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800/60">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30">
            <Pencil size={20} />
          </div>
          <h3 id={headingId} className="text-lg font-extrabold tracking-tight">
            Edit Saved Link
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label
              htmlFor={titleFieldId}
              className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
            >
              <Bookmark size={13} className="text-blue-400" />
              <span>Link Title</span>
            </label>
            <input
              id={titleFieldId}
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GitHub Repository, Figma Design..."
              className={`w-full px-4 py-3 rounded-xl text-xs font-semibold outline-none border transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={urlFieldId}
              className="text-xs font-bold text-slate-300 flex items-center gap-1.5"
            >
              <Globe size={13} className="text-indigo-400" />
              <span>Target URL</span>
            </label>
            <input
              id={urlFieldId}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/project"
              className={`w-full px-4 py-3 rounded-xl text-xs font-semibold outline-none border transition-all duration-200 ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              }`}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-sm transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !title.trim() || !url.trim()}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition shadow-lg active:scale-95 cursor-pointer bg-blue-600 hover:bg-blue-550 text-white shadow-blue-600/15 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLinkModal;

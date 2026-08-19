import React, { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import ToastNotification from "./common/ToastNotification";
import LinkVaultForm from "./linkvault/LinkVaultForm";
import LinkCardItem from "./linkvault/LinkCardItem";
import EditLinkModal from "./linkvault/EditLinkModal";

const LinkVault = ({ items = [], onAddLink, onDeleteLink, onEditLink, isDarkMode = true }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingLink, setEditingLink] = useState(null);

  // Filter items for link type
  const links = useMemo(() => items.filter((i) => i.type === "link"), [items]);
  const filteredLinks = useMemo(
    () =>
      links.filter(
        (l) =>
          (l.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.url && l.url.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [links, searchQuery]
  );

  const handleCopy = useCallback((linkItem) => {
    if (!linkItem.url) return;
    navigator.clipboard.writeText(linkItem.url);
    setCopiedId(linkItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmedTitle = title.trim();
      const trimmedUrl = url.trim();

      if (!trimmedTitle || !trimmedUrl) {
        setNotification({
          type: "warning",
          title: "Missing Fields",
          message: "Please enter both a title and a valid URL.",
        });
        return;
      }

      // Check for duplicate URLs or Titles
      const isDuplicateUrl = links.some(
        (l) => (l.url || "").trim().toLowerCase() === trimmedUrl.toLowerCase()
      );
      const isDuplicateTitle = links.some(
        (l) => (l.title || "").trim().toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (isDuplicateUrl) {
        setNotification({
          type: "warning",
          title: "Duplicate Link URL",
          message: `The URL "${trimmedUrl}" is already saved in your Link Vault!`,
        });
        return;
      }

      if (isDuplicateTitle) {
        setNotification({
          type: "warning",
          title: "Duplicate Link Title",
          message: `A link titled "${trimmedTitle}" already exists! Please choose a unique title.`,
        });
        return;
      }

      setIsAdding(true);
      try {
        await onAddLink(trimmedTitle, trimmedUrl);
        setTitle("");
        setUrl("");
        setNotification({
          type: "success",
          title: "Link Saved",
          message: `"${trimmedTitle}" was successfully added to Link Vault!`,
        });
      } catch (err) {
        console.error("Failed to add link:", err);
      } finally {
        setIsAdding(false);
      }
    },
    [title, url, links, onAddLink]
  );

  return (
    <div
      className={`flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-screen p-6 transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      <ToastNotification
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {onEditLink && (
        <EditLinkModal
          linkItem={editingLink}
          onClose={() => setEditingLink(null)}
          onSave={onEditLink}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="max-w-6xl mx-auto w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2
              className={`text-2xl font-extrabold tracking-tight ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Link Vault
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Organize, store, and quickly copy your essential project links & resources.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved links..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600"
              }`}
            />
          </div>
        </div>

        {/* ADD LINK FORM */}
        <LinkVaultForm
          title={title}
          setTitle={setTitle}
          url={url}
          setUrl={setUrl}
          isAdding={isAdding}
          onSubmit={handleSubmit}
          isDarkMode={isDarkMode}
        />

        {/* LINKS GRID */}
        {filteredLinks.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center border-2 border-dashed ${
              isDarkMode ? "border-slate-800 bg-slate-900/20" : "border-slate-300 bg-white"
            }`}
          >
            <p className="text-sm font-bold text-slate-400">No saved links found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a new bookmark using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredLinks.map((linkItem) => (
              <LinkCardItem
                key={linkItem.id}
                linkItem={linkItem}
                copiedId={copiedId}
                onCopy={handleCopy}
                onDelete={onDeleteLink}
                onEdit={onEditLink ? setEditingLink : undefined}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(LinkVault);

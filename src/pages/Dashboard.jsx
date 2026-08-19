import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import MobileTopBar from "../components/dashboard/MobileTopBar";
import DashboardModals from "../components/dashboard/DashboardModals";
import WorkspaceView from "../components/dashboard/WorkspaceView";

const Dashboard = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [viewType, setViewType] = useState("notes");
  const [activeTabId, setActiveTabId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    active: false,
    overall: 0,
    files: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notification, setNotification] = useState(null);
  const [oversizedModalData, setOversizedModalData] = useState(null);
  const isUploadCancelledRef = useRef(false);
  const cancelledFileNamesRef = useRef(new Set());

  // Load user-scoped cache immediately on user session resolution
  useEffect(() => {
    if (!user) return;
    try {
      const cached = localStorage.getItem(`connect_items_${user.id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setItems(parsed);
        // Set first note as active if none is currently selected
        if (parsed.length > 0) {
          const firstNote = parsed.find((i) => i.type === "note");
          if (firstNote) {
            setActiveTabId(firstNote.id);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read local cache:", e);
    }
  }, [user]);

  // Sync cache changes securely
  useEffect(() => {
    if (!user || items.length === 0) return;
    const stableItems = items.filter((item) => !String(item.id).startsWith("temp-"));
    localStorage.setItem(`connect_items_${user.id}`, JSON.stringify(stableItems));
  }, [items, user]);

  // Set dynamic browser tab title based on active view type
  useEffect(() => {
    switch (viewType) {
      case "notes":
        document.title = "Notepad - Connect";
        break;
      case "canvas":
        document.title = "Documents - Connect";
        break;
      case "links":
        document.title = "Saved Links - Connect";
        break;
      case "story":
        document.title = "Behind the Spark ✨ - Connect";
        break;
      default:
        document.title = "Connect - Workspace";
    }
  }, [viewType]);

  // Helper for localStorage pinned cache fallback
  const getPinnedIds = useCallback(() => {
    try {
      const saved = localStorage.getItem(`connect_pinned_${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [user]);

  const savePinnedIds = useCallback((pinnedIds) => {
    try {
      localStorage.setItem(`connect_pinned_${user?.id}`, JSON.stringify(pinnedIds));
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded) — pin state still lives in DB
    }
  }, [user]);

  // Fetch Items on user load & set up Real-time channel
  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        const pinnedSet = new Set(getPinnedIds());
        const processedData = (data || []).map((item) => ({
          ...item,
          is_pinned: item.is_pinned || pinnedSet.has(item.id),
        }));

        setItems((prev) => {
          const tempItem = prev.find((i) => String(i.id).startsWith("temp-"));
          if (!tempItem) {
            if (processedData?.length > 0) {
              const firstNote = processedData.find((i) => i.type === "note");
              if (firstNote) {
                setActiveTabId((prevActive) => prevActive || firstNote.id);
              }
            }
            return processedData;
          }

          const newestNote = processedData.find((i) => i.type === "note");
          if (newestNote) {
            const exists = prev.some((i) => i.id === newestNote.id);
            if (!exists) {
              setActiveTabId((prevActive) => (prevActive === tempItem.id ? newestNote.id : prevActive));
              return prev.map((item) => (item.id === tempItem.id ? newestNote : item));
            }
          }

          return processedData;
        });
      }
    };

    fetchItems();

    const channel = supabase
      .channel(`user-data-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login", { replace: true });
    } catch (e) {
      alert("Logout failed: " + e.message);
    }
  };

  // Clear stale upload progress notifications when switching active workspace views
  useEffect(() => {
    setUploadProgress(null);
  }, [viewType]);

  const generateAutoNoteTitle = useCallback((itemsList, currentId = null) => {
    const existingTitles = new Set(
      itemsList
        .filter((i) => i.type === "note" && i.id !== currentId)
        .map((i) => (i.title || "").toLowerCase().trim())
    );
    let num = 1;
    while (existingTitles.has(`note ${num}`) || existingTitles.has(`note${num}`)) {
      num++;
    }
    return `Note ${num}`;
  }, []);

  const generateAutoDocTitle = useCallback((itemsList, currentId = null) => {
    const existingTitles = new Set(
      itemsList
        .filter((i) => i.type !== "note" && i.type !== "link" && i.id !== currentId)
        .map((i) => (i.title || "").toLowerCase().trim())
    );
    let num = 1;
    while (existingTitles.has(`doc ${num}`) || existingTitles.has(`doc${num}`)) {
      num++;
    }
    return `Doc ${num}`;
  }, []);

  const addNewTab = useCallback(async () => {
    const noteTitle = generateAutoNoteTitle(items);

    const tempId = `temp-${Date.now()}`;
    const newNote = {
      id: tempId,
      title: noteTitle,
      content: "",
      type: "note",
      user_id: user.id,
      created_at: new Date().toISOString(),
    };

    // Keep backups in case of DB insertion errors
    const backupItems = [...items];
    const backupActiveTabId = activeTabId;

    // Optimistically update local states immediately
    setItems((prev) => [newNote, ...prev]);
    setActiveTabId(tempId);

    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            title: noteTitle,
            content: "",
            type: "note",
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        const realNote = data[0];
        setItems((prev) =>
          prev.map((item) => (item.id === tempId ? realNote : item))
        );
        setActiveTabId((prevActive) => (prevActive === tempId ? realNote.id : prevActive));
      }
    } catch (e) {
      // Rollback on error
      setItems(backupItems);
      setActiveTabId(backupActiveTabId);
      setNotification({
        type: "error",
        title: "Error Creating Note",
        message: e.message,
      });
    }
  }, [items, activeTabId, user, generateAutoNoteTitle]);

  const updateNoteContent = async (id, newContent, newTitle) => {
    let trimmedTitle = (newTitle || "").trim();

    if (!trimmedTitle) {
      trimmedTitle = generateAutoNoteTitle(items, id);
    } else {
      const isDuplicate = items.some(
        (i) =>
          i.id !== id &&
          i.type === "note" &&
          (i.title || "").trim().toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (isDuplicate) {
        setNotification({
          type: "warning",
          title: "Duplicate Note Title",
          message: `A note titled "${trimmedTitle}" already exists! Please choose a unique title.`,
        });
        return;
      }
    }

    const backupItems = [...items];
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, content: newContent, title: trimmedTitle }
            : item
        )
      );

      const { error } = await supabase
        .from("items")
        .update({ content: newContent, title: trimmedTitle })
        .eq("id", id);

      if (error) throw error;
    } catch (e) {
      // Rollback
      setItems(backupItems);
      setNotification({
        type: "error",
        title: "Update Failed",
        message: e.message,
      });
    }
  };

  const getStoragePathFromUrl = (url) => {
    const parts = url.split("/storage/v1/object/public/documents/");
    return parts.length > 1 ? parts[1] : null;
  };

  const deleteItem = async (id) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;

    const backupItems = [...items];
    const backupActiveTabId = activeTabId;

    try {
      // Optimistic delete
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (activeTabId === id) setActiveTabId(null);

      // Delete from DB
      const { error: dbError } = await supabase
        .from("items")
        .delete()
        .eq("id", id);
      if (dbError) throw dbError;

      // Delete from Storage if it has a file URL
      if (itemToDelete.type !== "note" && itemToDelete.url) {
        const path = getStoragePathFromUrl(itemToDelete.url);
        if (path) {
          await supabase.storage.from("documents").remove([path]);
        }
      }
    } catch (e) {
      // Rollback
      setItems(backupItems);
      setActiveTabId(backupActiveTabId);
      setNotification({
        type: "error",
        title: "Delete Failed",
        message: e.message,
      });
    }
  };

  const deleteMultipleItems = async (ids) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    const itemsToDelete = items.filter((item) => idSet.has(item.id));
    if (itemsToDelete.length === 0) return;

    const backupItems = [...items];
    const backupActiveTabId = activeTabId;

    try {
      // Optimistic delete
      setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
      if (idSet.has(activeTabId)) setActiveTabId(null);

      // Batch delete from DB
      const { error: dbError } = await supabase
        .from("items")
        .delete()
        .in("id", ids);
      if (dbError) throw dbError;

      // Collect storage paths
      const storagePaths = itemsToDelete
        .filter((item) => item.type !== "note" && item.url)
        .map((item) => getStoragePathFromUrl(item.url))
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await supabase.storage.from("documents").remove(storagePaths);
      }
    } catch (e) {
      // Rollback on error
      setItems(backupItems);
      setActiveTabId(backupActiveTabId);
      setNotification({
        type: "error",
        title: "Batch Delete Failed",
        message: e.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setShowDeleteAccountModal(false);

    try {
      // 1. Delete all database items belonging to this user
      const { error: dbError } = await supabase
        .from("items")
        .delete()
        .eq("user_id", user.id);

      if (dbError) console.warn("DB purge error:", dbError.message);

      // 2. Delete storage files
      try {
        const { data: fileList } = await supabase.storage
          .from("documents")
          .list(user.id);
        if (fileList && fileList.length > 0) {
          const filePaths = fileList.map((f) => `${user.id}/${f.name}`);
          await supabase.storage.from("documents").remove(filePaths);
        }
      } catch (stErr) {
        console.warn("Storage purge error:", stErr);
      }

      // 3. Clear localStorage cache
      localStorage.removeItem(`connect_items_${user.id}`);

      // 4. Sign out auth session & navigate to login
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      setNotification({
        type: "error",
        title: "Account Deletion Failed",
        message: e.message,
      });
    }
  };

  const addLinkItem = async (title, url) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            title,
            url,
            type: "link",
            user_id: user.id,
          },
        ])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setItems((prev) => [data[0], ...prev]);
      }
    } catch (e) {
      setNotification({
        type: "error",
        title: "Error Saving Link",
        message: e.message,
      });
    }
  };

  const editLinkItem = useCallback(
    async (id, newTitle, newUrl) => {
      const trimmedTitle = (newTitle || "").trim();
      const trimmedUrl = (newUrl || "").trim();

      if (!trimmedTitle || !trimmedUrl) {
        setNotification({
          type: "warning",
          title: "Missing Fields",
          message: "Please enter both a title and a valid URL.",
        });
        return;
      }

      const isDuplicateUrl = items.some(
        (i) =>
          i.type === "link" &&
          i.id !== id &&
          (i.url || "").trim().toLowerCase() === trimmedUrl.toLowerCase()
      );
      const isDuplicateTitle = items.some(
        (i) =>
          i.type === "link" &&
          i.id !== id &&
          (i.title || "").trim().toLowerCase() === trimmedTitle.toLowerCase()
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

      const backupItems = [...items];
      try {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, title: trimmedTitle, url: trimmedUrl } : item
          )
        );

        const { error } = await supabase
          .from("items")
          .update({ title: trimmedTitle, url: trimmedUrl })
          .eq("id", id);

        if (error) throw error;

        setNotification({
          type: "success",
          title: "Link Updated",
          message: `"${trimmedTitle}" was successfully updated!`,
        });
      } catch (e) {
        setItems(backupItems);
        setNotification({
          type: "error",
          title: "Update Failed",
          message: e.message,
        });
      }
    },
    [items]
  );

  const createFolder = async (folderTitle, parentFolderId = null) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            title: folderTitle,
            type: "folder",
            user_id: user.id,
            folder_id: parentFolderId || null,
          },
        ])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setItems((prev) => [data[0], ...prev]);
      }
    } catch (e) {
      setNotification({
        type: "error",
        title: "Error Creating Folder",
        message: e.message,
      });
    }
  };

  const togglePinItem = async (id, folderId = null) => {
    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;

    const currentlyPinned = !!targetItem.is_pinned;
    const targetFolderId = folderId || targetItem.folder_id || null;

    if (!currentlyPinned) {
      if (targetFolderId) {
        // Scoped inside a folder: Max 3 pinned items
        const pinnedInFolder = items.filter(
          (i) => i.folder_id === targetFolderId && i.is_pinned
        ).length;

        if (pinnedInFolder >= 3) {
          setNotification({
            type: "warning",
            title: "Folder Pin Limit Reached",
            message: "Maximum limit reached! You can pin up to 3 items inside a folder.",
          });
          return;
        }
      } else {
        // Root level: Max 5 pinned items
        const pinnedAtRoot = items.filter(
          (i) => !i.folder_id && i.is_pinned
        ).length;

        if (pinnedAtRoot >= 5) {
          setNotification({
            type: "warning",
            title: "Root Pin Limit Reached",
            message: "Maximum limit reached! You can pin up to 5 items at root level.",
          });
          return;
        }
      }
    }

    const nextPinnedState = !currentlyPinned;

    // Update local state & localStorage immediately
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, is_pinned: nextPinnedState } : i
      );
      const pinnedIds = updated.filter((i) => i.is_pinned).map((i) => i.id);
      savePinnedIds(pinnedIds);
      return updated;
    });

    // Save to Supabase DB if column is present, swallow error so pin never reverts
    try {
      await supabase
        .from("items")
        .update({ is_pinned: nextPinnedState })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase is_pinned update notice:", e);
    }
  };

  const renameItem = useCallback(async (id, newTitle) => {
    let trimmedTitle = (newTitle || "").trim();
    const itemToRename = items.find((i) => i.id === id);

    if (!trimmedTitle) {
      if (itemToRename?.type === "note") {
        trimmedTitle = generateAutoNoteTitle(items, id);
      } else {
        trimmedTitle = generateAutoDocTitle(items, id);
      }
    } else {
      const isDuplicate = items.some(
        (i) =>
          i.id !== id &&
          (i.title || "").trim().toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (isDuplicate) {
        setNotification({
          type: "warning",
          title: "Duplicate Name",
          message: `An item named "${trimmedTitle}" already exists! Please choose a unique name.`,
        });
        return;
      }
    }

    const backupItems = [...items];
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, title: trimmedTitle } : item
        )
      );

      const { error } = await supabase
        .from("items")
        .update({ title: trimmedTitle })
        .eq("id", id);

      if (error) throw error;
    } catch (e) {
      // Rollback
      setItems(backupItems);
      setNotification({
        type: "error",
        title: "Rename Failed",
        message: e.message,
      });
    }
  }, [items, generateAutoNoteTitle, generateAutoDocTitle]);

  // Browsers expose the dropped/picked directory shape on webkitRelativePath ("Project/sub/a.pdf").
  // Plain file picks have an empty string here, so they resolve to a bare file name at the destination.
  const getRelativePath = (file) =>
    file.webkitRelativePath || file.relativePath || file.name;

  const getDirPath = (relPath) => {
    const cut = relPath.lastIndexOf("/");
    return cut === -1 ? "" : relPath.slice(0, cut);
  };

  // Materialize a folder row per directory level of an uploaded tree, reusing any
  // folder that already exists at that destination. Returns dirPath -> folder id,
  // where "" maps to the upload destination itself.
  const ensureFolderTree = async (dirPaths, rootFolderId, knownItems) => {
    const pathToId = new Map([["", rootFolderId || null]]);

    // Expand every directory into its full ancestor chain, then create shallowest first
    const allDirs = new Set();
    for (const dirPath of dirPaths) {
      if (!dirPath) continue;
      const segments = dirPath.split("/");
      for (let i = 1; i <= segments.length; i++) {
        allDirs.add(segments.slice(0, i).join("/"));
      }
    }

    const ordered = [...allDirs].sort(
      (a, b) => a.split("/").length - b.split("/").length
    );

    const createdFolders = [];
    let pool = knownItems;

    for (const dirPath of ordered) {
      const segments = dirPath.split("/");
      const title = segments[segments.length - 1];
      const parentId = pathToId.get(segments.slice(0, -1).join("/")) ?? null;

      const existing = pool.find(
        (i) =>
          i.type === "folder" &&
          (i.folder_id || null) === parentId &&
          (i.title || "").trim().toLowerCase() === title.trim().toLowerCase()
      );

      if (existing) {
        pathToId.set(dirPath, existing.id);
        continue;
      }

      const { data, error } = await supabase
        .from("items")
        .insert([
          {
            title,
            type: "folder",
            user_id: user.id,
            folder_id: parentId,
          },
        ])
        .select();

      if (error) throw error;

      const created = data[0];
      pathToId.set(dirPath, created.id);
      createdFolders.push(created);
      // Keep the lookup pool current so sibling levels in this same batch reuse it
      pool = [created, ...pool];
    }

    if (createdFolders.length > 0) {
      setItems((prev) => [...createdFolders, ...prev]);
    }

    return pathToId;
  };

  const handleFileUpload = async (files, targetFolderId = null, skipOversizedCheck = false) => {
    const rawFileList = Array.isArray(files) ? files : [files];
    if (rawFileList.length === 0 || !user) return;

    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

    if (!skipOversizedCheck) {
      const oversizedFiles = rawFileList.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
      const validSizeFiles = rawFileList.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);

      if (oversizedFiles.length > 0) {
        setOversizedModalData({
          oversizedFiles,
          validSizeFiles,
          targetFolderId: targetFolderId || null,
        });
        return;
      }
    }

    // Rebuild any dropped directory structure as real folder rows first, so each
    // file can be filed against its own destination rather than landing flat.
    let dirPathToFolderId;
    try {
      const dirPaths = rawFileList.map((f) => getDirPath(getRelativePath(f)));
      dirPathToFolderId = await ensureFolderTree(dirPaths, targetFolderId, items);
    } catch (e) {
      setNotification({
        type: "error",
        title: "Error Creating Folders",
        message: e.message,
      });
      return;
    }

    // Filter out duplicates scoped to each file's own resolved destination folder
    const existingDocTitles = new Set(
      items
        .filter((i) => i.type !== "note" && i.type !== "link" && i.type !== "folder")
        .map((i) => `${i.folder_id || ""}::${(i.title || "").toLowerCase()}`)
    );

    const fileList = [];
    const duplicateNames = [];

    for (const f of rawFileList) {
      const relPath = getRelativePath(f);
      const destFolderId = dirPathToFolderId.get(getDirPath(relPath)) ?? null;
      const dedupeKey = `${destFolderId || ""}::${f.name.toLowerCase()}`;

      if (existingDocTitles.has(dedupeKey)) {
        duplicateNames.push(f.name);
      } else {
        existingDocTitles.add(dedupeKey);
        fileList.push({ file: f, relPath, destFolderId });
      }
    }

    if (duplicateNames.length > 0) {
      setNotification({
        type: "warning",
        title: "Duplicate Files Skipped",
        message: `${duplicateNames.length} file(s) (${duplicateNames.slice(0, 3).join(", ")}) already exist in your documents and were skipped.`,
      });
    }

    if (fileList.length === 0) return;

    isUploadCancelledRef.current = false;
    cancelledFileNamesRef.current = new Set();

    // Initialize progress tracking state for each file
    const initialFilesState = fileList.map(({ file }) => ({
      name: file.name,
      progress: 0,
      status: "waiting",
      error: null,
      size: file.size,
      uploadedBytes: 0,
    }));

    setUploadProgress({
      active: true,
      overall: 0,
      files: initialFilesState,
    });

    const totalBytes = fileList.reduce((acc, { file }) => acc + file.size, 0);
    const uploadBatchTimestamp = Date.now();

    // Helper to dynamically update individual file status and recalculate aggregate progress
    const updateFileProgress = (index, updates) => {
      setUploadProgress((prev) => {
        if (!prev) return prev;
        const nextFiles = [...prev.files];
        nextFiles[index] = { ...nextFiles[index], ...updates };

        const allTerminal = nextFiles.every(
          (f) =>
            f.status === "success" ||
            f.status === "error" ||
            f.status === "cancelled"
        );

        // Accumulate overall uploaded bytes weighted by file size
        const totalUploaded = nextFiles.reduce(
          (acc, f) =>
            acc + (f.status === "cancelled" ? f.size : f.uploadedBytes || 0),
          0
        );
        const overall = allTerminal
          ? 100
          : totalBytes > 0
          ? Math.round((totalUploaded / totalBytes) * 100)
          : 0;

        if (allTerminal) {
          setTimeout(() => {
            setUploadProgress((current) =>
              current ? { ...current, active: false } : current
            );
          }, 1800);
        }

        return {
          active: true,
          overall: Math.min(100, overall),
          files: nextFiles,
        };
      });
    };

    const concurrencyLimit = 3;
    let nextIndex = 0;
    let activeUploads = 0;

    const runUpload = async (index) => {
      const { file, relPath, destFolderId } = fileList[index];
      if (
        isUploadCancelledRef.current ||
        cancelledFileNamesRef.current.has(file.name)
      ) {
        return;
      }
      // Prepend user id and a shared batch timestamp directory to preserve folder shapes uniquely
      const fileName = `${user.id}/${uploadBatchTimestamp}/${relPath}`;

      updateFileProgress(index, { status: "uploading", progress: 0 });

      let progressInterval;
      try {
        // Stepped mock animation for Supabase uploads
        progressInterval = setInterval(() => {
          if (
            isUploadCancelledRef.current ||
            cancelledFileNamesRef.current.has(file.name)
          ) {
            clearInterval(progressInterval);
            return;
          }
          setUploadProgress((prev) => {
            if (!prev) return prev;
            const currentVal = prev.files[index]?.progress || 0;
            if (currentVal < 85) {
              const step = Math.min(
                85,
                currentVal + Math.floor(Math.random() * 15) + 5
              );
              const bytes = Math.round((step / 100) * file.size);
              const nextFiles = [...prev.files];
              nextFiles[index] = {
                ...nextFiles[index],
                progress: step,
                uploadedBytes: bytes,
              };

              const totalUploaded = nextFiles.reduce(
                (acc, f) => acc + (f.uploadedBytes || 0),
                0
              );
              const overall =
                totalBytes > 0
                  ? Math.round((totalUploaded / totalBytes) * 100)
                  : 0;

              return {
                active: true,
                overall: Math.min(100, overall),
                files: nextFiles,
              };
            }
            return prev;
          });
        }, 200);

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, file);

        clearInterval(progressInterval);

        if (
          isUploadCancelledRef.current ||
          cancelledFileNamesRef.current.has(file.name)
        ) {
          return;
        }

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("documents").getPublicUrl(fileName);

        let fileType = "doc";
        if (file.type.includes("pdf")) {
          fileType = "pdf";
        } else if (
          file.type.includes("image") ||
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        ) {
          fileType = "image";
        }

        const { error: dbError } = await supabase.from("items").insert([
          {
            title: file.name,
            type: fileType,
            url: publicUrl,
            user_id: user.id,
            folder_id: destFolderId || null,
          },
        ]);

        if (dbError) throw dbError;

        updateFileProgress(index, {
          status: "success",
          progress: 100,
          uploadedBytes: file.size,
        });
      } catch (error) {
        if (progressInterval) clearInterval(progressInterval);
        console.error("File upload error:", file.name, error);
        updateFileProgress(index, {
          status: "error",
          error: error.message || "Upload failed",
          uploadedBytes: 0,
        });
      }
    };

    const runNext = async () => {
      if (isUploadCancelledRef.current) return;

      if (nextIndex >= fileList.length) {
        if (activeUploads === 0) {
          setUploadProgress((prev) =>
            prev ? { ...prev, overall: 100 } : prev
          );
          // Finish and close console after 1.8s delay
          setTimeout(() => {
            setUploadProgress((prev) =>
              prev ? { ...prev, active: false } : prev
            );
          }, 1800);
        }
        return;
      }

      const currentIndex = nextIndex++;
      activeUploads++;

      await runUpload(currentIndex);

      activeUploads--;
      runNext();
    };

    // Spawn up to concurrencyLimit upload workers
    const batchPromises = [];
    for (let i = 0; i < Math.min(concurrencyLimit, fileList.length); i++) {
      batchPromises.push(runNext());
    }
    await Promise.all(batchPromises);
  };

  const handleCancelUpload = () => {
    isUploadCancelledRef.current = true;
    setUploadProgress((prev) => {
      if (!prev) return prev;
      const nextFiles = prev.files.map((f) =>
        f.status === "waiting" || f.status === "uploading"
          ? { ...f, status: "cancelled" }
          : f
      );
      return {
        ...prev,
        cancelled: true,
        files: nextFiles,
      };
    });

    setNotification({
      type: "info",
      title: "Upload Cancelled",
      message: "Folder / file upload batch was cancelled.",
    });

    setTimeout(() => {
      setUploadProgress((prev) => (prev ? { ...prev, active: false } : prev));
    }, 1800);
  };

  const handleCancelFile = (fileName) => {
    cancelledFileNamesRef.current.add(fileName);
    setUploadProgress((prev) => {
      if (!prev) return prev;
      const nextFiles = prev.files.map((f) =>
        f.name === fileName ? { ...f, status: "cancelled", progress: 0 } : f
      );

      const allTerminal = nextFiles.every(
        (f) =>
          f.status === "success" ||
          f.status === "error" ||
          f.status === "cancelled"
      );

      const overall = allTerminal ? 100 : prev.overall;

      if (allTerminal) {
        setTimeout(() => {
          setUploadProgress((current) =>
            current ? { ...current, active: false } : current
          );
        }, 1800);
      }

      return {
        ...prev,
        overall,
        files: nextFiles,
      };
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 relative">
      <DashboardModals
        notification={notification}
        onCloseNotification={() => setNotification(null)}
        oversizedModalData={oversizedModalData}
        onCloseOversizedModal={() => setOversizedModalData(null)}
        onProceedEligibleUpload={() => {
          const validFiles = oversizedModalData?.validSizeFiles || [];
          const targetFolderId = oversizedModalData?.targetFolderId || null;
          setOversizedModalData(null);
          if (validFiles.length > 0) {
            handleFileUpload(validFiles, targetFolderId, true);
          }
        }}
        showDeleteAccountModal={showDeleteAccountModal}
        onCloseDeleteAccountModal={() => setShowDeleteAccountModal(false)}
        onConfirmDeleteAccount={handleDeleteAccount}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Mobile Logic */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-300 ease-out z-50`}
      >
        <Sidebar
          userEmail={user.user_metadata?.display_name || "User"}
          setViewType={(v) => {
            setViewType(v);
            setIsSidebarOpen(false);
          }}
          viewType={viewType}
          onLogout={handleLogout}
          onDeleteAccount={() => setShowDeleteAccountModal(true)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </div>

      {/* Content Area */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-300 ${
          isDarkMode ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <MobileTopBar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />

        <WorkspaceView
          viewType={viewType}
          items={items}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          addNewTab={addNewTab}
          updateNoteContent={updateNoteContent}
          deleteItem={deleteItem}
          deleteMultipleItems={deleteMultipleItems}
          handleFileUpload={handleFileUpload}
          onCreateFolder={createFolder}
          onTogglePin={togglePinItem}
          handleCancelUpload={handleCancelUpload}
          handleCancelFile={handleCancelFile}
          onCloseNotification={() => setUploadProgress(null)}
          uploadProgress={uploadProgress}
          renameItem={renameItem}
          addLinkItem={addLinkItem}
          editLinkItem={editLinkItem}
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  List,
  HardDrive,
  Clock,
  Share2,
  Trash2,
  UploadCloud,
  Plus,
  FolderOpen,
} from "lucide-react";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import { DirectoryContext } from "./context/DirectoryContext";
import { toast } from "react-hot-toast";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";
import ShareFileModal from "./components/shareFileModal";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directoryApi";

import {
  deleteFile,
  renameFile,
  shareFileByEmail,
  uploadComplete,
  uploadInitiate,
} from "./api/fileApi";
import DetailsPopup from "./components/DetailsPopup";

const BASE_URL = import.meta.env.VITE_SERVER_URL;

// Sidebar nav items
const NAV_ITEMS = [
  { icon: HardDrive, label: "All Files", key: "all" },
  { icon: Clock, label: "Recent", key: "recent" },
  { icon: Share2, label: "Shared", key: "shared" },
  { icon: Trash2, label: "Trash", key: "trash" },
];

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Storage");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [activeNav, setActiveNav] = useState("all");

  const handleOpenShareModal = (fileId) => {
    setSelectedFileId(fileId);
    setShowShareModal(true);
  };

  const handleShareFile = async (email) => {
    try {
      await shareFileByEmail(selectedFileId, email);
      setShowShareModal(false);
      toast.success("File shared successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to share file");
    }
  };

  const fileInputRef = useRef(null);

  const [uploadItem, setUploadItem] = useState(null);
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = useCallback(async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Storage");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  }, [dirId, navigate]);

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
  }, [dirId, loadDirectory]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf": return "pdf";
      case "png": case "jpg": case "jpeg": case "gif": return "image";
      case "mp4": case "mov": case "avi": return "video";
      case "zip": case "rar": case "tar": case "gz": return "archive";
      case "js": case "jsx": case "ts": case "tsx": case "html": case "css": case "py": case "java": return "code";
      default: return "alt";
    }
  }

  function handleRowClick(type, id) {
    if (type === "directory") navigate(`/directory/${id}`);
    else window.location.href = `${BASE_URL}/file/${id}`;
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      e.target.value = "";
      return;
    }

    const tempItem = {
      file, name: file.name, size: file.size, type: file.type,
      id: `temp-${Date.now()}`, isUploading: true, progress: 0,
    };
    try {
      const data = await uploadInitiate({
        name: file.name, size: file.size, ContentType: file.type, parentDirId: dirId,
      });
      const { uploadSignedUrl, fileId } = data;
      setFilesList((prev) => [tempItem, ...prev]);
      setUploadItem(tempItem);
      e.target.value = "";
      startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || error.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }

  function startUpload({ item, uploadUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("PUT", uploadUrl);
    xhr.withCredentials = true;

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {
      if (xhr.status == 200) await uploadComplete(fileId);
      else {
        setErrorMessage("File not uploaded successfully!");
        setTimeout(() => setErrorMessage(""), 3000);
      }
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = () => {
      setErrorMessage("Something went wrong during upload!");
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
      setDeleteItem(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);
      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  useEffect(() => {
    const onDragEnter = (e) => { e.preventDefault(); setIsDragActive(true); };
    const onDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
    const onDragLeave = (e) => { e.preventDefault(); if (e.target === document.body) setIsDragActive(false); };
    const onDrop = (e) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const fakeEvent = { target: { files: [file], value: "" } };
        handleFileSelect(fakeEvent);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  const filteredItems = combinedItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem ? { [uploadItem.id]: uploadItem.progress || 0 } : {};
  const totalItems = combinedItems.length;

  return (
    <DirectoryContext.Provider
      value={{
        handleRowClick,
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveContextMenu(id);
        },
        getFileIcon,
        isUploading,
        progressMap,
        handleCancelUpload,
        setDeleteItem,
        openRenameModal,
        openDetailsPopup,
        handleOpenShareModal,
      }}
    >
      <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
        <div className="relative z-10 flex min-h-screen">

          {/* ── Sidebar ── */}
          <aside className="hidden md:flex w-64 flex-col bg-black border-r-2 border-[#facc15]/30 shrink-0">
            {/* Brand */}
            <div className="px-5 py-5 border-b-2 border-[#facc15]/30 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#facc15] flex items-center justify-center border-2 border-black shadow-brutal-sm shrink-0">
                <HardDrive className="w-4 h-4 text-black" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">
                  Store<span className="text-[#facc15]">my</span>files
                </p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  File Vault
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map(({ icon: Icon, label, key }) => {
                const isActive = activeNav === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveNav(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-black uppercase tracking-wide transition-all duration-100 border-2 ${
                      isActive
                        ? "bg-[#facc15] text-black border-black shadow-brutal-sm"
                        : "bg-transparent text-white/60 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-[#facc15]"}`}
                      strokeWidth={2.5}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Upgrade */}
            <div className="mx-3 mb-4">
              <button
                type="button"
                onClick={() => navigate("/plans")}
                className="w-full py-2 bg-[#facc15] text-black text-xs font-black uppercase tracking-wide border-2 border-black shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all duration-150"
              >
                Upgrade Plan
              </button>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Header bar */}
            <DirectoryHeader
              directoryName={directoryName}
              onCreateFolderClick={() => setShowCreateDirModal(true)}
              onUploadFilesClick={() => fileInputRef.current.click()}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              disabled={
                errorMessage === "Directory not found or you do not have access to it!"
              }
            />

            <div className="flex-1 p-4 md:p-6">
              {/* Toolbar row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
                <div className="px-3 py-1.5 bg-[#facc15] text-black text-xs font-black uppercase tracking-wide border-2 border-black shadow-brutal-sm self-start">
                  {totalItems} items
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-40 sm:w-52 px-3 py-2 bg-[#111] border-2 border-white/20 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#facc15] transition-colors font-medium"
                  />
                  {/* View toggle */}
                  <div className="inline-flex border-2 border-white/20">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-1 px-2.5 py-2 text-xs font-black uppercase transition-colors ${
                        viewMode === "list"
                          ? "bg-[#facc15] text-black"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center gap-1 px-2.5 py-2 text-xs font-black uppercase transition-colors border-l-2 border-white/20 ${
                        viewMode === "grid"
                          ? "bg-[#facc15] text-black"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-4 px-4 py-3 bg-red-950 border-2 border-red-500 text-xs text-red-300 font-bold flex items-center gap-2">
                  <span>✕</span> {errorMessage}
                </div>
              )}

              {/* File/folder content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={dirId || "root"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {filteredItems.length === 0 ? (
                    errorMessage === "Directory not found or you do not have access to it!" ? (
                      <p className="text-center text-white/40 mt-12 text-sm font-bold">
                        Directory not found or you do not have access to it.
                      </p>
                    ) : (
                      <div className="mt-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#111] border-2 border-[#facc15]/40 flex items-center justify-center mb-4">
                          <UploadCloud className="w-7 h-7 text-[#facc15]" strokeWidth={2} />
                        </div>
                        <p className="text-base font-black uppercase tracking-wide text-white mb-1">
                          Vault is empty
                        </p>
                        <p className="text-xs text-white/40 font-medium max-w-xs">
                          Drop files here or hit the yellow{" "}
                          <strong className="text-[#facc15]">+</strong> button to start uploading.
                        </p>
                      </div>
                    )
                  ) : (
                    <DirectoryList items={filteredItems} viewMode={viewMode} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* ── Floating Action Button ── */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="fixed bottom-8 right-8 z-30 w-16 h-16 bg-[#facc15] text-black border-2 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-150"
          title="Upload file"
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>

        {/* ── Drag & drop overlay ── */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="border-4 border-dashed border-[#facc15] px-12 py-10 bg-[#111] text-center max-w-sm mx-4">
                <UploadCloud className="w-10 h-10 text-[#facc15] mx-auto mb-3" strokeWidth={2} />
                <p className="text-base font-black uppercase tracking-wide text-white">
                  Drop to upload
                </p>
                <p className="mt-1 text-xs text-white/50 font-medium">
                  into <span className="text-[#facc15]">{directoryName}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Modals ── */}
        {showCreateDirModal && (
          <CreateDirectoryModal
            newDirname={newDirname}
            setNewDirname={setNewDirname}
            onClose={() => setShowCreateDirModal(false)}
            onCreateDirectory={handleCreateDirectory}
          />
        )}
        {showRenameModal && (
          <RenameModal
            renameType={renameType}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onClose={() => setShowRenameModal(false)}
            onRenameSubmit={handleRenameSubmit}
          />
        )}
        {detailsItem && (
          <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
        )}
        {deleteItem && (
          <ConfirmDeleteModal
            item={deleteItem}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteItem(null)}
            type={deleteItem.isDirectory ? "directory" : "file"}
          />
        )}
        {showShareModal && (
          <ShareFileModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            onSend={handleShareFile}
          />
        )}
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;

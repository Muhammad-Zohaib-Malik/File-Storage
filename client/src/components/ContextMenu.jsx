import { useDirectoryContext } from "../context/DirectoryContext";

function ContextMenu({ item, isUploadingItem }) {
  const {
    handleCancelUpload,
    setDeleteItem,
    openRenameModal,
    openDetailsPopup,
    handleOpenShareModal,
  } = useDirectoryContext();

  const BASE_URL = import.meta.env.VITE_SERVER_URL;

  const menuCls =
    "absolute right-2 top-[calc(100%+4px)] z-50 min-w-[160px] bg-[#0a0a0a] border-2 border-[#facc15] shadow-[4px_4px_0px_0px_#facc15] overflow-hidden";
  const itemCls =
    "block w-full text-left px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-[#facc15] hover:text-black transition-colors duration-100 cursor-pointer";
  const dangerCls =
    "block w-full text-left px-4 py-2.5 text-sm font-black uppercase tracking-wide text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-100 cursor-pointer border-t-2 border-white/10";

  if (isUploadingItem && item.isUploading) {
    return (
      <div className={menuCls}>
        <button
          className={dangerCls}
          onClick={(e) => { e.stopPropagation(); handleCancelUpload(item.id); }}
        >
          ✕ Cancel Upload
        </button>
      </div>
    );
  }

  if (item.isDirectory) {
    return (
      <div className={menuCls}>
        <button
          className={itemCls}
          onClick={(e) => { e.stopPropagation(); openRenameModal("directory", item.id, item.name); }}
        >
          ✎ Rename
        </button>
        <button
          className={itemCls}
          onClick={(e) => { e.stopPropagation(); openDetailsPopup(item); }}
        >
          ℹ Details
        </button>
        <button
          className={dangerCls}
          onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
        >
          ✕ Delete
        </button>
      </div>
    );
  }

  return (
    <div className={menuCls}>
      <button
        className={itemCls}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
        }}
      >
        ↓ Download
      </button>
      <button
        className={itemCls}
        onClick={(e) => { e.stopPropagation(); openRenameModal("file", item.id, item.name); }}
      >
        ✎ Rename
      </button>
      <button
        className={itemCls}
        onClick={(e) => { e.stopPropagation(); openDetailsPopup(item); }}
      >
        ℹ Details
      </button>
      <button
        className={itemCls}
        onClick={(e) => { e.stopPropagation(); handleOpenShareModal(item.id); }}
      >
        ↗ Share
      </button>
      <button
        className={dangerCls}
        onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
      >
        ✕ Delete
      </button>
    </div>
  );
}

export default ContextMenu;

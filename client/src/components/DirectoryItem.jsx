import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaFileCode,
  FaFileAlt,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import ContextMenu from "./ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";
import { formatSize } from "./DetailsPopup";

function DirectoryItem({ item, uploadProgress, viewMode = "list" }) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
  } = useDirectoryContext();

  function renderFileIcon(iconString) {
    const cls = "text-white/80 text-lg";
    switch (iconString) {
      case "pdf": return <FaFilePdf className={cls} />;
      case "image": return <FaFileImage className={cls} />;
      case "video": return <FaFileVideo className={cls} />;
      case "archive": return <FaFileArchive className={cls} />;
      case "code": return <FaFileCode className={cls} />;
      default: return <FaFileAlt className={cls} />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");
  const isDirectory = item.isDirectory;

  const gridCard = viewMode === "grid";

  return (
    <div
      className={`relative cursor-pointer bg-[#111] border-2 border-white/10 border-t-4 border-t-[#facc15] card-hover group ${
        gridCard ? "flex flex-col gap-3 p-4 min-h-[130px]" : "flex flex-row items-center gap-3 px-4 py-3"
      } ${activeContextMenu === item.id ? "z-50" : "z-10"}`}
      onClick={() =>
        !(activeContextMenu || isUploading) &&
        handleRowClick(item.isDirectory ? "directory" : "file", item.id)
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      {/* Icon */}
      <div
        className={`shrink-0 flex items-center justify-center ${
          gridCard ? "w-10 h-10 bg-[#1a1a1a] border-2 border-white/10" : ""
        }`}
      >
        {isDirectory ? (
          <FaFolder className="text-[#facc15] text-xl" />
        ) : (
          renderFileIcon(getFileIcon(item.name))
        )}
      </div>

      {/* Info */}
      <div className={`min-w-0 ${gridCard ? "" : "flex-1"}`}>
        <p className="text-sm font-black text-white truncate leading-snug">
          {item.name}
        </p>
        {!isDirectory && (
          <p className="mt-0.5 text-[10px] text-white/40 font-bold uppercase">
            {formatSize(item.size)}
          </p>
        )}
      </div>

      {/* Three-dot menu button */}
      <div
        className="ml-auto shrink-0 p-1.5 text-white/30 hover:text-[#facc15] hover:bg-[#facc15]/10 transition-colors"
        onClick={(e) => handleContextMenu(e, item.id)}
      >
        <BsThreeDotsVertical className="text-sm" />
      </div>

      {/* Context menu */}
      {activeContextMenu === item.id && (
        <ContextMenu item={item} isUploadingItem={isUploadingItem} />
      )}

      {/* Upload progress */}
      {isUploadingItem && (
        <div className={`${gridCard ? "mt-1" : "absolute bottom-0 left-0 right-0"} px-4 pb-1`}>
          <div className="w-full h-1.5 bg-[#222] border border-white/10 overflow-hidden">
            <div
              className="h-full bg-[#facc15] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-[#facc15] font-black">
            Uploading {Math.floor(uploadProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default DirectoryItem;

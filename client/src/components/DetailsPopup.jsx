import { useEffect, useState } from "react";
import { Info } from "lucide-react";

export const formatSize = (bytes = 0) => {
  const KB = 1024, MB = KB * 1024, GB = MB * 1024;
  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed(2) + " KB";
  return bytes + " B";
};

function DetailsPopup({ item, onClose }) {
  if (!item) return null;

  const [details] = useState({
    path: "/",
    size: 0,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    numberOfFiles: 0,
    numberOfFolders: 0,
  });

  const { name, isDirectory, size, createdAt, updatedAt } = item;
  const { path, numberOfFiles, numberOfFolders } = details;

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const Row = ({ label, value }) => (
    <div className="flex items-start gap-3 py-2 border-b border-white/5">
      <span className="text-[11px] font-black uppercase tracking-widest text-[#facc15] w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-white/70 font-medium break-all">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border-2 border-[#facc15] shadow-[6px_6px_0px_0px_#facc15] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#facc15] flex items-center justify-center border-2 border-black shrink-0">
            <Info className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Details
          </h2>
        </div>

        <div className="space-y-0">
          <Row label="Name" value={name} />
          <Row label="Path" value={path} />
          <Row label="Size" value={formatSize(size)} />
          <Row label="Created" value={new Date(createdAt).toLocaleString()} />
          <Row label="Updated" value={new Date(updatedAt).toLocaleString()} />
          {isDirectory && (
            <>
              <Row label="Files" value={numberOfFiles} />
              <Row label="Folders" value={numberOfFolders} />
            </>
          )}
        </div>

        <div className="flex justify-end mt-5">
          <button
            className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-transparent border-2 border-white/20 text-white/60 hover:border-[#facc15] hover:text-white transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailsPopup;

import { useEffect, useRef } from "react";
import { Pencil } from "lucide-react";

function RenameModal({ renameType, renameValue, setRenameValue, onClose, onRenameSubmit }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            <Pencil className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Rename {renameType === "file" ? "File" : "Folder"}
          </h2>
        </div>

        <form onSubmit={onRenameSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
            placeholder="Enter new name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-transparent border-2 border-white/20 text-white/60 hover:border-white hover:text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-[#facc15] text-black border-2 border-black shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all duration-150"
            >
              Save →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameModal;

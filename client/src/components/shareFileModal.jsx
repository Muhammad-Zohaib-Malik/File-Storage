import { useState } from "react";
import { Share2 } from "lucide-react";

const ShareFileModal = ({ isOpen, onClose, onSend }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSend(email);
    setEmail("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border-2 border-[#facc15] shadow-[6px_6px_0px_0px_#facc15] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#facc15] flex items-center justify-center border-2 border-black shrink-0">
            <Share2 className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wide text-white">
            Share File
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-black text-white/70 mb-2 uppercase tracking-widest">
            Recipient Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#facc15] transition-colors font-medium"
            required
          />
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-transparent border-2 border-white/20 text-white/60 hover:border-white hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-[#facc15] text-black border-2 border-black shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all duration-150"
            >
              Send Link →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareFileModal;

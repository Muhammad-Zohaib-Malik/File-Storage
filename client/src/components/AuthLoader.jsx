import { HardDrive } from "lucide-react";

/**
 * Full-screen loader shown while the auth check is in-flight.
 * Black background + yellow spinning ring to match the Neo-Brutalism theme.
 */
const AuthLoader = () => (
  <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 z-50">
    {/* Logo mark */}
    <div className="w-14 h-14 bg-[#facc15] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
      <HardDrive className="w-7 h-7 text-black" strokeWidth={2.5} />
    </div>

    {/* Spinner */}
    <svg
      className="animate-spin w-8 h-8 text-[#facc15]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <p className="text-[11px] font-black uppercase tracking-widest text-white/30">
      Checking session...
    </p>
  </div>
);

export default AuthLoader;

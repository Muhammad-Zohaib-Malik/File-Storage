import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaDesktop,
  FaMobileAlt,
  FaTabletAlt,
  FaSignOutAlt,
  FaGlobe,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { HardDrive, Clock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { LatestLoginActivity } from "./api/loginActivity";

export default function SessionManagement() {
  const navigate = useNavigate();

  /* --- COMMENTED OUT ORIGINAL LOGIC ---
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const fetchLatestLogin = async () => {
      const data = await LatestLoginActivity();
      console.log(data.latest);
      setLatest(data.latest);
    };
    fetchLatestLogin();
  }, []);

  const getDeviceIcon = (type) => {
    switch (type) {
      case "mobile":
        return <FaMobileAlt className="text-blue-500" />;
      case "tablet":
        return <FaTabletAlt className="text-green-500" />;
      default:
        return <FaDesktop className="text-purple-500" />;
    }
  };
  --------------------------------------- */

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#facc15 1px, transparent 1px),
                            linear-gradient(90deg, #facc15 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 max-w-7xl mx-auto border-b-2 border-[#facc15]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center border-2 border-black shadow-brutal-sm">
            <HardDrive className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase">
            Store<span className="text-[#facc15]">my</span>files
          </span>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={() => navigate("/")}
             className="text-sm font-bold text-white hover:text-[#facc15] transition-colors px-4 py-2 border-2 border-white/20 hover:border-[#facc15] uppercase tracking-wide flex items-center gap-2"
           >
             <ArrowLeft className="w-4 h-4" /> Back
           </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 px-6 sm:px-10 pt-20 sm:pt-32 pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="mb-8 w-20 h-20 bg-[#facc15] flex items-center justify-center border-4 border-black shadow-brutal">
           <Clock className="w-10 h-10 text-black" strokeWidth={2.5} />
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] mb-8 uppercase max-w-4xl">
          Active Sessions <br />
          <span className="text-[#facc15]">
            Coming soon
          </span>
        </h1>

        <p className="text-white/60 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl font-medium">
          We're building advanced session insights and security management tools. Soon you'll be able to monitor and manage all your active devices from here.
        </p>

        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-[#facc15] text-black font-black border-2 border-black shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#facc15] transition-all duration-150 uppercase tracking-wide text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Dashboard
        </button>
      </main>

      {/* --- COMMENTED OUT ORIGINAL JSX ---
      <div className="max-w-4xl mx-auto hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Active Sessions</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>
        </div>

        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Security Tips</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                For your security, please sign out of sessions you don't
                recognize.
              </p>
            </div>
            <div className="mt-5">
              <button
                onClick={() => {
                  {
                    // Implement logout all sessions
                    toast.success("All other sessions have been terminated");
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Sign Out of All Other Sessions
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Latest Login Activity
          </h3>

          {latest.length > 0 ? (
            latest.map((session) => (
              <div
                key={session._id}
                className="bg-white shadow sm:rounded-lg p-5 flex items-start space-x-4"
              >
                <div className="mt-1">
                  {getDeviceIcon(session.deviceType || "desktop")}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">
                      {session.browser || "Unknown Browser"} on{" "}
                      {session.os || "Unknown OS"}
                    </h4>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <FaGlobe className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                      <span>{session.ip}</span>
                      {(session.city || session.country) && (
                        <>
                          <span className="mx-2">•</span>
                          <span>
                            {session.city}, {session.country}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                      <span>
                        Logged in at:{" "}
                        {session.loginAt
                          ? new Date(session.loginAt).toLocaleString()
                          : "Unknown time"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No recent login activity found.
            </p>
          )}
        </div>
      </div>
      -------------------------------------- */}
    </div>
  );
}

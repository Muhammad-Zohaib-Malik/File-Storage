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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 w-full max-w-lg bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center border border-white/60 transition-all hover:shadow-indigo-500/10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6 transition-transform hover:rotate-3 duration-300">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 tracking-tight">
          Coming Soon
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg font-medium leading-relaxed">
          We're working on advanced session insights and management tools. Stay tuned for better security features!
        </p>

        <button
          onClick={() => navigate("/")}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-300 bg-slate-900 border border-transparent rounded-xl hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-md hover:shadow-indigo-500/30"
        >
          <span className="relative flex items-center gap-2">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Dashboard
          </span>
        </button>
      </div>

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

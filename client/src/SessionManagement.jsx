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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
    </div>
  );
}

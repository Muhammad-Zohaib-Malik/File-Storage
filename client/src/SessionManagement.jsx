import { useState } from "react";
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

export default function SessionManagement() {
  const navigate = useNavigate();

  // Mock data for sessions
  const [sessions, setSessions] = useState([
    {
      id: "current-session-123",
      device: {
        type: "desktop",
        browser: "Chrome",
        os: "Windows 10",
        ip: "192.168.1.1",
        location: "Karachi, Pakistan",
        lastActive: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isCurrent: true,
      },
    },
    {
      id: "session-456",
      device: {
        type: "mobile",
        browser: "Safari",
        os: "iOS 15",
        ip: "192.168.1.2",
        location: "Lahore, Pakistan",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isCurrent: false,
      },
    },
    {
      id: "session-789",
      device: {
        type: "tablet",
        browser: "Firefox",
        os: "Android 12",
        ip: "192.168.1.3",
        location: "Islamabad, Pakistan",
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isCurrent: false,
      },
    },
  ]);

  const currentSessionId = "current-session-123";

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

  const formatLastActive = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleLogoutSession = (sessionId) => {
    if (sessionId === currentSessionId) {
      toast.error("Cannot log out current session");
      return;
    }
    setSessions(sessions.filter((session) => session.id !== sessionId));
    toast.success("Session terminated successfully");
  };

  const handleLogoutAllSessions = () => {
    setSessions(sessions.filter((session) => session.id === currentSessionId));
    toast.success("All other sessions have been terminated");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Active Sessions</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            &larr; Back
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                session.device.isCurrent ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getDeviceIcon(session.device.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {session.device.browser} on {session.device.os}
                        </h3>
                        {session.device.isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <FaGlobe className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                          <span>{session.device.ip}</span>
                          <span className="mx-2">•</span>
                          <span>{session.device.location}</span>
                        </div>
                        <div className="flex items-center">
                          {session.device.isCurrent ? (
                            <FaCheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <FaTimesCircle className="mr-1.5 h-3.5 w-3.5 text-red-500" />
                          )}
                          <span>
                            {session.device.isCurrent
                              ? "Active now"
                              : `Last active ${formatLastActive(session.device.lastActive)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.device.isCurrent && (
                    <button
                      onClick={() => handleLogoutSession(session.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaSignOutAlt className="mr-1.5 h-3.5 w-3.5" />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  if (
                    window.confirm(
                      "This will log you out from all other devices. Continue?",
                    )
                  ) {
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
      </div>
    </div>
  );
}

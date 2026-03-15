import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import { FaFolderPlus, FaUpload, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import {
  HardDrive,
  ChevronRight,
  User,
  Settings,
  Shield,
  LogOut,
  Monitor,
  CreditCard,
} from "lucide-react";

// Deterministic colour from name initial
function getAvatarColor(name = "") {
  const colours = [
    "#facc15", // yellow
    "#f97316", // orange
    "#10b981", // emerald
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ef4444", // red
    "#06b6d4", // cyan
  ];
  const idx = (name.charCodeAt(0) || 0) % colours.length;
  return colours[idx];
}

function Avatar({ picture, name, size = "md" }) {
  const initials = name
    ? name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  const bgColor = getAvatarColor(name);

  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={`${sizeMap[size]} object-cover border-2 border-[#facc15] shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} flex items-center justify-center font-black border-2 border-black shrink-0`}
      style={{ backgroundColor: bgColor, color: "#000" }}
    >
      {initials}
    </div>
  );
}

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [maxStorageInBytes, setMaxStorageInBytes] = useState(0);
  const [usedStorageInBytes, setUsedStorageInBytes] = useState(0);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const formatStorage = (bytes) => {
    if (bytes >= 1024 ** 4) return (bytes / 1024 ** 4).toFixed(2) + " TB";
    if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
    if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
  };

  const usedPercent =
    maxStorageInBytes > 0
      ? Math.min(100, (usedStorageInBytes / maxStorageInBytes) * 100)
      : 0;

  const storageColor =
    usedPercent >= 90
      ? "#ef4444"
      : usedPercent >= 70
        ? "#f97316"
        : "#facc15";

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name || "");
        setUserEmail(user.email || "");
        setUserPicture(user.picture || "");
        setMaxStorageInBytes(Number(user.maxStorageInBytes) || 0);
        setUsedStorageInBytes(Number(user.usedStorageInBytes) || 0);
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
      } finally {
        setIsUserLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    function onOutsideClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // Menu link/button shared styles
  const menuItem =
    "group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-white/70 hover:bg-[#facc15] hover:text-black transition-colors duration-100 text-left";
  const menuItemIcon = "w-4 h-4 text-[#facc15] group-hover:text-black shrink-0 transition-colors";

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-black border-b-2 border-[#facc15]/30 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <HardDrive className="w-4 h-4 text-[#facc15] shrink-0" strokeWidth={2.5} />
        <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <h1 className="text-sm font-black uppercase tracking-wide text-white truncate">
          {directoryName}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* New Folder */}
        <button
          className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 transition-all duration-150 ${disabled
            ? "border-white/10 text-white/20 cursor-not-allowed"
            : "border-[#facc15]/50 text-[#facc15] hover:bg-[#facc15] hover:text-black hover:border-[#facc15] hover:shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px"
            }`}
          title="Create Folder"
          onClick={onCreateFolderClick}
          disabled={disabled}
        >
          <FaFolderPlus className="text-sm" />
          <span className="hidden sm:inline">New Folder</span>
        </button>

        {/* Upload */}
        <button
          className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 transition-all duration-150 ${disabled
            ? "border-white/10 text-white/20 cursor-not-allowed"
            : "border-[#facc15] bg-[#facc15] text-black shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal"
            }`}
          title="Upload Files"
          onClick={onUploadFilesClick}
          disabled={disabled}
        >
          <FaUpload className="text-sm" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* ── Avatar / User Menu ── */}
        <div className="relative" ref={userMenuRef}>
          {/* Trigger button */}
          <button
            id="user-menu-trigger"
            title="Account menu"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className={`flex items-center gap-2 pl-1 pr-2 py-1 border-2 transition-all duration-150 ${showUserMenu
              ? "border-[#facc15] bg-[#facc15]/10"
              : "border-white/20 hover:border-[#facc15] hover:bg-white/5"
              }`}
          >
            {isUserLoading ? (
              /* Spinner while loading user */
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <svg
                  className="animate-spin w-5 h-5 text-[#facc15]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-20"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="3"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              <Avatar picture={userPicture} name={userName} size="sm" />
            )}
            {!isUserLoading && (
              <span className="hidden md:block text-xs font-black text-white/80 max-w-[100px] truncate">
                {userName || "Account"}
              </span>
            )}
            <ChevronRight
              className={`w-3.5 h-3.5 text-white/30 shrink-0 transition-transform duration-200 ${showUserMenu ? "rotate-90" : ""
                }`}
            />
          </button>

          {/* ── Dropdown panel ── */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#0a0a0a] border-2 border-[#facc15] shadow-[6px_6px_0px_0px_#facc15] z-50 overflow-hidden">
              {loggedIn ? (
                <>
                  {/* Profile hero */}
                  <div className="px-5 py-4 bg-[#111] border-b-2 border-[#facc15]/20 flex items-center gap-4">
                    <Avatar picture={userPicture} name={userName} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white leading-tight truncate">
                        {userName || "User"}
                      </p>
                      <p className="text-[11px] text-white/40 font-medium truncate mt-0.5">
                        {userEmail}
                      </p>
                      {/* Storage bar */}
                      {maxStorageInBytes > 0 && (
                        <div className="mt-2">
                          <div className="w-full h-1 bg-[#222]">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${usedPercent}%`,
                                backgroundColor: storageColor,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-white/30 mt-1 font-bold">
                            {formatStorage(usedStorageInBytes)} /{" "}
                            {formatStorage(maxStorageInBytes)} used
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className={menuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className={menuItemIcon} />
                      <span>View Profile</span>
                    </Link>

                    <button
                      className={menuItem}
                      onClick={(e) => {
                        e.preventDefault();
                        toast.success("Sessions page is coming soon!");
                        setShowUserMenu(false);
                      }}
                    >
                      <Monitor className={menuItemIcon} />
                      <span>Active Sessions</span>
                    </button>

                    <Link
                      to="/plans"
                      className={menuItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CreditCard className={menuItemIcon} />
                      <span>Plans &amp; Billing</span>
                    </Link>
                  </div>

                  {/* Danger zone */}
                  <div className="border-t-2 border-white/10 py-1">
                    <button onClick={handleLogout} className={menuItem}>
                      <LogOut className={menuItemIcon} />
                      <span>Sign Out</span>
                    </button>
                    <button
                      onClick={handleLogoutAll}
                      className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-100"
                    >
                      <Shield className="w-4 h-4 shrink-0" />
                      <span>Sign Out All Devices</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Guest state */
                <div className="px-5 py-5 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-[#111] border-2 border-[#facc15]/40 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#facc15]" />
                  </div>
                  <p className="text-sm font-black text-white/60 uppercase tracking-wide">
                    Not signed in
                  </p>
                  <button
                    onClick={() => { navigate("/login"); setShowUserMenu(false); }}
                    className="w-full py-2.5 bg-[#facc15] text-black text-xs font-black uppercase tracking-wide border-2 border-black shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <FaSignInAlt />
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import { FaFolderPlus, FaUpload, FaUser, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { HardDrive, ChevronRight } from "lucide-react";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
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

  const usedPercent = Math.min(100, (usedStorageInBytes / maxStorageInBytes) * 100) || 0;

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser();
        setUserName(user.name);
        setUserEmail(user.email);
        setMaxStorageInBytes(Number(user.maxStorageInBytes));
        setUsedStorageInBytes(Number(user.usedStorageInBytes));
        setLoggedIn(true);
      } catch {
        setLoggedIn(false);
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
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

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

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 transition-all duration-150 ${
            disabled
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

        <button
          className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wide border-2 transition-all duration-150 ${
            disabled
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

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            className="flex items-center justify-center w-9 h-9 border-2 border-white/20 hover:border-[#facc15] bg-[#111] hover:bg-[#facc15]/10 transition-colors"
            title="User Menu"
            onClick={() => setShowUserMenu((prev) => !prev)}
          >
            {userPicture ? (
              <img className="w-full h-full object-cover" src={userPicture} alt={userName} />
            ) : (
              <FaUser className="text-[#facc15] text-sm" />
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-[#0a0a0a] border-2 border-[#facc15] z-50 shadow-[4px_4px_0px_0px_#facc15]">
              {loggedIn ? (
                <>
                  <div className="px-4 py-3 border-b-2 border-[#facc15]/20">
                    <p className="text-sm font-black text-white truncate">{userName}</p>
                    <p className="text-[11px] text-white/40 truncate">{userEmail}</p>
                    {maxStorageInBytes > 0 && (
                      <div className="mt-2">
                        <div className="w-full h-1.5 bg-[#222] border border-white/10">
                          <div
                            className="h-full bg-[#facc15]"
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 font-bold">
                          {formatStorage(usedStorageInBytes)} of {formatStorage(maxStorageInBytes)} used
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-[#facc15] hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser className="text-[#facc15] hover:text-black text-xs" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-[#facc15] hover:text-black transition-colors"
                  >
                    <FaSignOutAlt className="text-[#facc15] text-xs" />
                    Logout
                  </button>
                  <button
                    onClick={handleLogoutAll}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white transition-colors border-t-2 border-white/10"
                  >
                    <FaSignOutAlt className="text-xs" />
                    Logout All Devices
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { navigate("/login"); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-[#facc15] hover:text-black transition-colors"
                >
                  <FaSignInAlt className="text-[#facc15] text-xs" />
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;

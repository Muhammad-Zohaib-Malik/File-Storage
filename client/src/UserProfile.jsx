import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchUser, logoutUser, logoutAllSessions } from "./api/userApi";
import { Camera, User, Mail, Shield, LogOut, Key } from "lucide-react";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser();
        setUser(userData);
        setFullName(userData.name || "");
      } catch (err) {
        console.error("Failed to load user", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      toast.success("Logged out from all sessions successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout All failed", err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleImageChange = () => {};

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#facc15] border-t-black animate-spin shadow-[4px_4px_0px_0px_#facc15]"></div>
      </div>
    );
  }

  if (!user) return null;
  const isGoogleUser = user.createdWith === "google";
  const isGithubUser = user.createdWith === "github";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 relative overflow-hidden pb-20">
      {/* Grid bg */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#facc15 1px, transparent 1px), linear-gradient(90deg, #facc15 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-[#111] border-2 border-[#facc15] shadow-[8px_8px_0px_0px_#facc15] p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group shrink-0">
              <img
                src={user.picture || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=facc15&color=000&size=200`}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 object-cover border-4 border-black bg-[#222] shadow-[6px_6px_0px_0px_#facc15]"
              />
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageChange}
              />
              <button className="absolute -bottom-4 -right-4 bg-[#facc15] text-black p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#000] transition-all z-0">
                <Camera size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3 break-words">
                {user.name || "User"}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-black border-2 border-white/20 text-white/70 text-sm font-bold tracking-widest break-all">
                <Mail size={16} className="shrink-0" />
                <span className="truncate max-w-[200px] md:max-w-full">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Personal Info */}
            <div className="bg-[#111] border-2 border-white/20 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-white/10">
                <div className="p-2 bg-[#facc15] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <User size={20} className="text-black" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-wide">Personal Details</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-white/50 mb-2 uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white focus:outline-none focus:border-[#facc15] focus:shadow-[4px_4px_0px_0px_#facc15] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-white/50 mb-2 uppercase tracking-widest">
                    Email Address <span className="text-[#facc15] ml-1">(Read Only)</span>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/10 text-white/40 cursor-not-allowed font-medium"
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  className="w-full mt-2 py-3 px-4 bg-white text-black text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#facc15] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Change Password */}
            {!isGoogleUser && !isGithubUser && (
              <div className="bg-[#111] border-2 border-white/20 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-white/10">
                  <div className="p-2 bg-[#9333ea] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Key size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Change Password</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black text-white/50 mb-2 uppercase tracking-widest">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-white/20 text-white focus:outline-none focus:border-[#9333ea] focus:shadow-[4px_4px_0px_0px_#9333ea] transition-all font-medium"
                    />
                  </div>
                  <button className="w-full mt-2 py-3 px-4 bg-[#9333ea] text-white text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Connected Accounts */}
            {(isGoogleUser || isGithubUser) && (
              <div className="bg-[#111] border-2 border-white/20 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-white/10">
                  <div className="p-2 bg-green-500 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <Shield size={20} className="text-black" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-wide">Connected Accounts</h2>
                </div>

                <div className="space-y-4">
                  {isGoogleUser && (
                     <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-2 border-white/10 hover:border-white/30 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 pr-2">
                        <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                          <svg className="h-5 w-5" viewBox="0 0 533.5 544.3">
                             <path fill="#4285F4" d="M533.5 278.4c0-17.6-1.5-34.5-4.3-50.9H272v95.7h146.9c-6.3 33.6-25.2 62-53.9 81.1v67.1h87.1c50.9-46.9 80.4-115.9 80.4-193z" />
                             <path fill="#34A853" d="M272 544.3c72.9 0 134-24.1 178.7-65.3l-87.1-67.1c-24.2 16.2-55.1 25.8-91.6 25.8-70.5 0-130.3-47.5-151.6-111.5H32.9v69.8C77.4 482.8 168.5 544.3 272 544.3z" />
                             <path fill="#FBBC05" d="M120.4 323.5c-10.4-31.5-10.4-65.8 0-97.3V156.4H32.9c-39.7 77.5-39.7 168.1 0 245.6l87.5-69.8z" />
                             <path fill="#EA4335" d="M272 107.6c38.7-.6 75.9 13.3 104.1 38.6l78-78C405.1 24.5 343.9 0 272 0 168.5 0 77.4 61.5 32.9 156.4l87.5 69.8c21.3-64 81.1-111.5 151.6-118.6z" />
                           </svg>
                        </div>
                        <div className="truncate">
                          <p className="font-black uppercase tracking-wide">Google</p>
                          <p className="text-xs text-white/50 truncate max-w-[120px] sm:max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-widest shrink-0">
                        Connected
                      </span>
                    </div>
                  )}

                  {isGithubUser && (
                     <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-2 border-white/10 hover:border-white/30 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 pr-2">
                        <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
                          <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="truncate">
                          <p className="font-black uppercase tracking-wide">GitHub</p>
                          <p className="text-xs text-white/50 truncate max-w-[120px] sm:max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black uppercase tracking-widest shrink-0">
                        Connected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session Management */}
            <div className="bg-[#111] border-2 border-red-500/50 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.3)] p-6">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-500/20">
                  <div className="p-2 bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <LogOut size={20} className="text-black" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-wide text-red-100">Danger Zone</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-red-950/20 border-2 border-red-500/30">
                    <h3 className="font-black text-red-400 uppercase tracking-widest text-sm mb-1">Current Session</h3>
                    <p className="text-xs text-white/50 mb-5 font-medium">Log out from your current browser session only.</p>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 px-4 bg-[#1a0f0f] text-red-400 text-sm font-black uppercase tracking-wider border-2 border-red-500/50 hover:bg-red-500 hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all"
                    >
                      Log Out Now
                    </button>
                  </div>

                  <div className="p-5 bg-red-950/40 border-2 border-red-500">
                    <h3 className="font-black text-red-500 uppercase tracking-widest text-sm mb-1">All Devices</h3>
                    <p className="text-xs text-red-200/50 mb-5 font-medium">Log out from everywhere including mobile and other browsers.</p>
                    <button
                      onClick={handleLogoutAll}
                      className="w-full py-3 px-4 bg-red-500 text-black text-sm font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all"
                    >
                      Log Out Everywhere
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

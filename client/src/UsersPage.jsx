import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
  permanentDeleteUserById,
  recoverUserById,
  changeUserRoleById,
} from "./api/userApi";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("User");

  const [selectedUser, setSelectedUser] = useState(null);
  const [permanentMode, setPermanentMode] = useState(false);
  const [recoverMode, setRecoverMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("❌ Fetching users failed:", err);
      if (err.response?.status === 403) navigate("/");
      else if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const data = await fetchUser();
      setUserName(data.name);
      setUserEmail(data.email);
      setUserImage(data.picture);
      setUserRole(data.role);
    } catch (err) {
      console.error("❌ Fetching current user failed:", err);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const logoutUser = async (user) => {
    const confirmed = confirm(`You are about to logout ${user.email}`);
    if (!confirmed) return;
    try {
      await logoutUserById(user.id);
      fetchUsers();
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  };

  const handleSoftDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(false);
    setRecoverMode(false);
  };

  const handlePermanentDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(true);
    setRecoverMode(false);
  };

  const handleRecover = (user) => {
    setSelectedUser(user);
    setRecoverMode(true);
    setPermanentMode(false);
  };

  const changeUserRole = async (user, newRole) => {
    if (newRole === user.role) return;

    try {
      const res = await changeUserRoleById(user.id, newRole);
      fetchUsers();
      toast.success(res.message || "Role updated successfully.");
    } catch (err) {
      console.error("❌ Role change failed:", err);
      toast.error(err.response?.data?.message || "Failed to change role.");
    }
  };

  const confirmAction = async (user) => {
    try {
      if (recoverMode) {
        await recoverUserById(user.id);
      } else if (permanentMode) {
        await permanentDeleteUserById(user.id);
      } else {
        await deleteUserById(user.id);
      }
      fetchUsers();
    } catch (err) {
      console.error("❌ Action error:", err);
    } finally {
      setSelectedUser(null);
      setPermanentMode(false);
      setRecoverMode(false);
    }
  };

  const cancelDelete = () => {
    setSelectedUser(null);
    setPermanentMode(false);
    setRecoverMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome, <span className="font-medium">{userName}</span>
              <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {userRole}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage user accounts and permissions
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-indigo-600 font-medium ${user.picture ? 'hidden' : 'flex items-center justify-center h-full w-full'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isLoggedIn
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {user.isLoggedIn ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                    <button
                      onClick={() => logoutUser(user)}
                      disabled={!user.isLoggedIn}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.isLoggedIn
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>

                    {(userRole === "Admin" || userRole === "Owner") && (
                      <>
                        <button
                          onClick={() => handleSoftDelete(user)}
                          disabled={user.email === userEmail}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.email === userEmail
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                            }`}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>

                        <button
                          onClick={() => handlePermanentDelete(user)}
                          disabled={user.email === userEmail}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.email === userEmail
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Permanent Delete
                        </button>
                      </>
                    )}

                    {userRole === "Owner" && user.isDeleted === true ? (
                      <button
                        onClick={() => handleRecover(user)}
                        disabled={user.email === userEmail}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.email === userEmail
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recover User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRecover(user)}
                        disabled={user.isActive || user.email === userEmail}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${user.isActive || user.email === userEmail
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                          }`}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recover
                      </button>
                    )}

                    {(userRole === "Admin" || userRole === "Owner") && (
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user, e.target.value)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        {userRole === "Owner" && <option value="Owner">Owner</option>}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <ConfirmDeleteModal
            user={selectedUser}
            onConfirm={confirmAction}
            onCancel={cancelDelete}
            permanent={permanentMode}
            recover={recoverMode}
          />
        )}
      </div>
    </div>
  );
}

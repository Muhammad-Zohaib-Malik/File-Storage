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
import toast from 'react-hot-toast';



export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
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
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">All Users</h1>
      <p className="mb-4">
        <b>{userName}</b> <i>({userRole})</i>
      </p>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Logout</th>
            {(userRole === "Admin" || userRole === "Owner") && (
              <>
                <th className="p-2 text-left">Delete</th>
                <th className="p-2 text-left">Permanent Delete</th>
              </>
            )}
            <th className="p-2 text-left">Recover</th>
            {(userRole === "Admin" || userRole === "Owner") && (
              <th className="p-2 text-left">Change Role</th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                {user.isLoggedIn ? "Logged In" : "Logged Out"}
              </td>
              <td className="p-2">
                <button
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    user.isLoggedIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Logout
                </button>
              </td>

              {(userRole === "Admin" || userRole === "Owner") && (
                <>
                  <td className="p-2">
                    <button
                      onClick={() => handleSoftDelete(user)}
                      disabled={user.email === userEmail}
                      className={`px-3 py-1 text-sm text-white rounded ${
                        user.email === userEmail
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handlePermanentDelete(user)}
                      disabled={user.email === userEmail}
                      className={`px-3 py-1 text-sm text-white rounded ${
                        user.email === userEmail
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-700 hover:bg-red-800"
                      }`}
                    >
                      Permanent Delete
                    </button>
                  </td>
                </>
              )}

              <td className="p-2">
                {userRole === "Owner" && user.isDeleted === true ? (
                  <button
                    onClick={() => handleRecover(user)}
                    disabled={user.email === userEmail}
                    className={`px-3 py-1 text-sm text-white rounded ${
                      user.email === userEmail
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-700 hover:bg-green-800"
                    }`}
                  >
                    Recover User
                  </button>
                ) : (
                  "-"
                )}
              </td>

              {(userRole === "Admin" || userRole === "Owner") && (
                <td className="p-2">
                  {user.email === userEmail ? (
                    "-"
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => changeUserRole(user, e.target.value)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      <option value="Owner">
                        Owner {user.role === "Owner" ? "✅" : ""}
                      </option>
                      <option value="Admin">
                        Admin {user.role === "Admin" ? "✅" : ""}
                      </option>
                      <option value="Manager">
                        Manager {user.role === "Manager" ? "✅" : ""}
                      </option>
                    </select>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <ConfirmDeleteModal
          item={selectedUser}
          onConfirm={confirmAction}
          onCancel={cancelDelete}
          isPermanent={permanentMode}
          isRecover={recoverMode}
          type="user"
        />
      )}
    </div>
  );
}

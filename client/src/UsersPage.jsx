import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
  permanentDeleteUserById,
} from "./api/userApi"; 
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");
  const [selectedUser, setSelectedUser] = useState(null);
  const [permanentMode, setPermanentMode] = useState(false);

  const navigate = useNavigate();

  const logoutUser = async (user) => {
    const confirmed = confirm(`You are about to logout ${user.email}`);
    if (!confirmed) return;
    try {
      await logoutUserById(user.id);
      fetchUsers();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSoftDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(false);
  };

  const handlePermanentDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(true);
  };

  const confirmDelete = async (user) => {
    try {
      if (permanentMode) {
        await permanentDeleteUserById(user.id);
      } else {
        await deleteUserById(user.id);
      }
      fetchUsers();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setSelectedUser(null);
      setPermanentMode(false);
    }
  };

  const cancelDelete = () => {
    setSelectedUser(null);
    setPermanentMode(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  async function fetchUsers() {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      if (err.response?.status === 403) navigate("/");
      else if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching users failed:", err);
    }
  }

  async function fetchCurrentUser() {
    try {
      const data = await fetchUser();
      setUserName(data.name);
      setUserEmail(data.email);
      setUserRole(data.role);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else console.error("Fetching user failed:", err);
    }
  }

  return (
    <div className="max-w-5xl mt-10 mx-4">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      <p>
        <b>{userName}</b>: <i>({userRole})</i>
      </p>

      <table className="w-full mt-6 border-collapse">
        <thead>
          <tr>
            <th className="border p-3 bg-gray-200 text-left">Name</th>
            <th className="border p-3 bg-gray-200 text-left">Email</th>
            <th className="border p-3 bg-gray-200 text-left">Status</th>
            <th className="border p-3 bg-gray-200 text-left">Logout</th>
            {userRole === "Admin" && (
              <>
                <th className="border p-3 bg-gray-200 text-left">Delete</th>
                <th className="border p-3 bg-gray-200 text-left">
                  Permanent Delete
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-3">{user.name}</td>
              <td className="border p-3">{user.email}</td>
              <td className="border p-3">
                {user.isLoggedIn ? "Logged In" : "Logged Out"}
              </td>
              <td className="border p-3">
                <button
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                  className={`px-3 py-1 text-sm text-white rounded ${
                    user.isLoggedIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Logout
                </button>
              </td>
              {userRole === "Admin" && (
                <>
                  <td className="border p-3">
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
                  <td className="border p-3">
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {selectedUser && (
        <ConfirmDeleteModal
          item={selectedUser}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isPermanent={permanentMode}
          
        />
      )}
    </div>
  );
}

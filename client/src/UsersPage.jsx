import { useState } from "react";
import "./UsersPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState();
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4000";

  const getAllUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/all`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else if (response.status === 403) {
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("User data:", data);
        // Set user info if logged in
        setUserName(data.name);
        setUserEmail(data.email);
        setUserRole(data.role);
      } else if (response.status === 401) {
        navigate("/");
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const logoutUser = async (user) => {
    const { _id: id, email } = user;
    const isLoggedOutConfirmed = confirm(
      `Are you sure you want to logout this ${email}`
    );
    if (!isLoggedOutConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/user/${id}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        fetchUser();
        getAllUsers();
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };


  const deleteUser = async (user) => {
    const { _id: id, email } = user;
    const isLoggedOutConfirmed = confirm(
      `Are you sure you want to delete this ${email}`
    );
    if (!isLoggedOutConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        console.log("delete successfully");
        fetchUser();
        getAllUsers();
      } else {
        console.error("delete failed");
      }
    } catch (err) {
      console.error("delete error:", err);
    }
  };
  useEffect(() => {
    getAllUsers();
    fetchUser();
  }, []);

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <p>
        {userName}:{userRole}
      </p>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Logout User</th>
            {userRole === "Admin" && <th>Delete User</th>}
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>

              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>
              {userRole === "Admin" && (
                <td>
                  <button
                    className="logout-button delete-button"
                    onClick={() =>
                      deleteUser(user)
                    }
                    disabled={userEmail === user.email}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

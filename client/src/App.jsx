import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";
import UserProfile from "./UserProfile";
import SessionManagement from "./SessionManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/profile",
    element: <UserProfile />,
  },
  {
    path: "/sessions",
    element: <SessionManagement />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

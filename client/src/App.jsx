import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DirectoryView } from './DirectoryView';
import { Register } from './components/Register';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />
  },

  {
    path: "/directory/:dirId",
    element: <DirectoryView />
  },
  {
    path: "/register",
    element: <Register />
  },
])

export const App = () => {
  return <RouterProvider router={router} />
}



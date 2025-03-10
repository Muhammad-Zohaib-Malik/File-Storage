import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DirectoryView } from './DirectoryView';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />
  },

  {
    path: "/directory/:dirId",
    element: <DirectoryView />
  },
])

export const App = () => {
  return <RouterProvider router={router} />
}



import { createBrowserRouter ,RouterProvider} from 'react-router-dom';
import { DirectoryView } from './DirectoryView';

const router=createBrowserRouter([
  {
    path:"/*",
    element:<DirectoryView/>
  }
])

export const App = () => {
  return <RouterProvider router={router}/>
}


import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout, RequireAuth } from "./pages/layout/Layout";
import Homepage from "./pages/homepage/Homepage";
import Upload from "./pages/upload/Upload";
import Login from "./pages/login/Login";

import Debugg from "./pages/debugg/Debugg";
import Profile from "./pages/profile/Profile";
import ProfileUpdate from "./pages/profileUpdate/ProfileUpdate";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Homepage />,
        },
        {
          path: "/upload",
          element: <Upload />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/debugg",
          element: <Debugg />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/upload",
          element: <Upload />,
        },
        {
          path: "/debugg",
          element: <Debugg />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdate />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;

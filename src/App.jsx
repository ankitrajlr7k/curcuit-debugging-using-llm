import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout, RequireAuth } from "./pages/layout/Layout";
import Homepage from "./pages/homepage/Homepage";
import Upload from "./pages/upload/Upload";
import Login from "./pages/login/Login";
import ChatApp from "./pages/debugg/ChatApp";
import Debugg from "./pages/debugg/Debugg";
import Profile from "./pages/profile/Profile";
import ProfileUpdate from "./pages/profileUpdate/ProfileUpdate";
import Signup from "./pages/signup/Signup";


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
          element: <ChatApp />,
        },
        {
          path: "/register",
          element: <Signup />,
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
          element: <ChatApp />,
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

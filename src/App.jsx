import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import { Provider } from "react-redux";
import Home from "./components/Home/Home";
import Signin from "./components/SignIn/Signin";
import Signup from "./components/signup/Signup";
import Post from "./components/Post/Post";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/store";
import ProtectedRoute from "./protected.route/Protect";
import ProfileDetails from "./components/Profile/Profile";
import SkillCardGrid from "./components/skill-match/SkillMatch";
import Chat from "./components/chatBox/Chat";
import PasswordReset from "./components/forgot-pass/ForgotPass";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <NavBar />,
      children: [
        { index: true, element: <Home /> },
        { path: "/signin", element: <Signin /> },
        { path: "/signup", element: <Signup /> },
        {
          path: "/profile",
          element: (
            <ProtectedRoute>
              <ProfileDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: "/post",
          element: (
            <ProtectedRoute>
              <Post />
            </ProtectedRoute>
          ),
        },
        {
          path: "/match",
          element: (
            <ProtectedRoute>
              <SkillCardGrid />
            </ProtectedRoute>
          ),
        },
        {
          path: "/chat",
          element: (
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          ),
        },
        {
          path: "/forgot-pass",
          element: <PasswordReset />,
        },
      ],
    },
  ]);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

export default App;

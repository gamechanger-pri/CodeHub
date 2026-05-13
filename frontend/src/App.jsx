import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import StackOverflow from "./components/Stackoverflow/index";
import Header from "./components/Header";
import AddQuestion from "./components/AddQuestion";
import ViewQuestion from "./components/ViewQuestion";
import Auth from "./components/Auth";

import { useDispatch, useSelector } from "react-redux";
import { login, logout, selectUser, selectUserLoading, setLoading } from "./feature/userSlice";
import { useEffect } from "react";

import axios from "./api/axios";

function App() {
  const user = useSelector(selectUser);
  const loading = useSelector(selectUserLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    // Replace Firebase auth: check token and fetch user from API
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          dispatch(logout());
          return;
        }

        const res = await axios.get("/auth/me");
        if (res?.data?.success) {
          const user = res.data.data;
          const token = localStorage.getItem("token");
          dispatch(
            login({ user: { id: user._id, name: user.name, email: user.email }, token })
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth init error:", error);
        dispatch(logout());
      }
      finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9f9",
        }}
      >
        <div className="loading-container">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Stack_Overflow_icon.svg"
            alt="loading"
            style={{ width: "80px", animation: "pulse 1.5s infinite" }}
          />
        </div>
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 0.8; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <Header />

        <Routes>
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={user ? <StackOverflow /> : <Navigate to="/auth" />}
          />

          <Route
            path="/add-question"
            element={user ? <AddQuestion /> : <Navigate to="/auth" />}
          />

          <Route
            path="/question"
            element={user ? <ViewQuestion /> : <Navigate to="/auth" />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
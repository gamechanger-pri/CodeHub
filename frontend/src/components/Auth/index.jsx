import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useDispatch } from "react-redux";
import { login } from "../../feature/userSlice";

import "./index.css";

function Index() {
  const navigate = useNavigate();

  const [register, setRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Email validation
  function validateEmail(email) {
    const reg =
      /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/;

    return reg.test(email);
  }

  // Login using backend JWT
  const handleSignIn = async () => {
    setError("");

    if (!email || !password) return setError("Required field is missing");
    if (!validateEmail(email)) return setError("Email is malformed");

    try {
      setLoading(true);
      const res = await axios.post("/auth/login", { email, password });
      if (res.data?.success) {
        const { token, user } = res.data.data;
        // persist token handled by userSlice but set here as well
        localStorage.setItem("token", token);
        dispatch(
          login({ user: { id: user.id, name: user.name, email: user.email }, token })
        );
        navigate("/");
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Register using backend
  const handleRegister = async () => {
    setError("");

    if (!username || !email || !password) return setError("Required field is missing");
    if (!validateEmail(email)) return setError("Email is malformed");

    try {
      setLoading(true);
      const res = await axios.post("/auth/register", {
        name: username,
        email,
        password,
      });

      if (res.data?.success) {
        // After register, auto-login
        await handleSignIn();
      } else {
        setError(res.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-container">

        <p>Login or Register</p>

        {/* FORM */}
        <div className="auth-login">
          <div className="auth-login-container">

            {register ? (
              <>
                {/* Username */}
                <div className="input-field">
                  <p>Username</p>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                  />
                </div>

                {/* Email */}
                <div className="input-field">
                  <p>Email</p>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="text"
                  />
                </div>

                {/* Password */}
                <div className="input-field">
                  <p>Password</p>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  style={{ marginTop: "10px" }}
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </>
            ) : (
              <>
                {/* Email */}
                <div className="input-field">
                  <p>Email</p>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="text"
                  />
                </div>

                {/* Password */}
                <div className="input-field">
                  <p>Password</p>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                  />
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  style={{ marginTop: "10px" }}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </>
            )}

            {/* Toggle */}
            <p
              onClick={() => setRegister(!register)}
              style={{
                marginTop: "10px",
                textAlign: "center",
                color: "#0095ff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {register
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <p style={{ color: "red", fontSize: "14px", marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Index;
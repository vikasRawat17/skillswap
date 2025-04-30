import React, { useState } from "react";
import "./sn.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userAsyncThunk } from "../../store/login-store/Login.store";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function Signin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const resultAction = await dispatch(userAsyncThunk(user));
      if (userAsyncThunk.fulfilled.match(resultAction)) {
        navigate("/profile");
      } else if (userAsyncThunk.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;
        setErrorMessage(errorPayload?.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signin-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="auth-wrapper">
        <h2 className="auth-title">Sign In</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email..."
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group password-wrapper">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Enter your password..."
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          <div className="form-footer">
            <a href="/forgot-pass" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className={`auth-button ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;

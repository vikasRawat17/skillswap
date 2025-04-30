import React, { useState } from "react";
import "./su.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerAsyncThunk } from "../../store/login-store/Login.store";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    mobile: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);

    const showError = (message) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 2000);
    };

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.mobile ||
      !formData.gender
    ) {
      showError("Please fill out all fields!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match!");
      return;
    }

    const result = await dispatch(registerAsyncThunk(formData));

    if (result.error) {
      const errorMessage = result.payload?.message;
      showError(errorMessage);
      return;
    }

    if (registerAsyncThunk.fulfilled.match(result)) {
      showError("");
      setSuccess("Signed up successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        mobile: "",
      });

      setTimeout(() => navigate("/signin"), 2000);
    }
  };

  return (
    <div className="signup-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {success && <div className="error-message">{success}</div>}
      <div className="auth-wrapper">
        <h2 className="auth-title">Create Account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="input-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="Enter your full name..."
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="Enter your email..."
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-wrapper">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="Create a password..."
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="form-group password-wrapper">
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="input-field"
              placeholder="Confirm your password..."
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="gender" className="input-label">
              Gender
            </label>
            <select
              id="gender"
              className="input-field"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mobile" className="input-label">
              Mobile
            </label>
            <input
              id="mobile"
              type="number"
              className="input-field"
              placeholder="Mobile number..."
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="terms-checkbox">
            <input type="checkbox" id="termsAccept" required />
            <label htmlFor="termsAccept">
              I agree to the <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            className={`auth-button ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/signin">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

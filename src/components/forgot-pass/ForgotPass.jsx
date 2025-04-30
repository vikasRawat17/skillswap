import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./f.css";
import {
  changePassThunk,
  forgotPassThunk,
} from "../../store/login-store/Login.store";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector(
    (state) => state.authReducer
  );

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      // Request OTP without providing OTP value (initial request)
      const resultAction = await dispatch(
        forgotPassThunk({ email, otp: null })
      );
      if (forgotPassThunk.fulfilled.match(resultAction)) {
        setStep(2); // Move to OTP verification step
      } else {
        setError(resultAction.payload || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassThunk({ email, otp }));
      if (forgotPassThunk.fulfilled.match(resultAction)) {
        setStep(3); // Move to password change step
      } else {
        setError(resultAction.payload || "Invalid OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const resultAction = await dispatch(
        changePassThunk({
          email,
          password: newPassword,
        })
      );

      if (changePassThunk.fulfilled.match(resultAction)) {
        // Reset successful
        setStep(4); // Success step
      } else {
        setError(resultAction.payload?.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h2 className="card-title">Reset Your Password</h2>

        {error && <div className="error-message">{error}</div>}
        {reduxError && (
          <div className="error-message">
            {reduxError.message || reduxError}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="reset-form">
            <div className="progress-indicator">
              <div className="step active">1</div>
              <div className="step-line"></div>
              <div className="step">2</div>
              <div className="step-line"></div>
              <div className="step">3</div>
            </div>

            <h3>Enter Your Email</h3>
            <p className="form-description">
              We'll send a one-time password to your email address
            </p>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <div className="form-footer">
              <a href="/signin" className="back-link">
                Back to Login
              </a>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="reset-form">
            <div className="progress-indicator">
              <div className="step completed">1</div>
              <div className="step-line completed"></div>
              <div className="step active">2</div>
              <div className="step-line"></div>
              <div className="step">3</div>
            </div>

            <h3>Enter OTP</h3>
            <p className="form-description">
              Enter the one-time password sent to {email}
            </p>

            <div className="form-group">
              <label htmlFor="otp">One-Time Password</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="text-button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => handleEmailSubmit({ preventDefault: () => {} })}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="reset-form">
            <div className="progress-indicator">
              <div className="step completed">1</div>
              <div className="step-line completed"></div>
              <div className="step completed">2</div>
              <div className="step-line completed"></div>
              <div className="step active">3</div>
            </div>

            <h3>Set New Password</h3>
            <p className="form-description">
              Create a new password for your account
            </p>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>

            <div className="form-footer">
              <button
                type="button"
                className="text-button"
                onClick={() => setStep(2)}
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h3>Password Reset Successful!</h3>
            <p>Your password has been changed successfully.</p>
            <a href="/signin" className="submit-button">
              Login with New Password
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;

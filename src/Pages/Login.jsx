import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../CSS/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setError("");
    setShowErrorPopup(false); // Reset popup

    if (!username || !password) {
      setError("All fields are required.");
      setShowErrorPopup(true); // Show popup instead of inline
      return;
    }

    try {
      const response = await axios.post('http://13.214.122.184:8000/api/users/login', {
        username,
        password,
      });

      const user = response.data;

      if (user.role === "admin") {
        localStorage.setItem('currentUser', JSON.stringify({ username: user.username, role: user.role }));
        navigate('/Adminpage');
      } else {
        setError("Only admin accounts can log in.");
        setShowErrorPopup(true); // Show popup instead of inline
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid username or password.");
      setShowErrorPopup(true); // Show popup instead of inline
      
      // Auto-close after 4 seconds
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 4000);
    }
  };
  
  const handleForgotPassword = async () => {
    setError("");
    setShowError(false);
    setLoading(true);
    
    try {
      const response = await axios.post('http://13.214.122.184:8000/api/users/request', { username });

      if (response.data.message === "User Correct") {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await axios.post('http://13.214.122.184:8000/api/users/otp', { username, otp: otpCode });
        setStep(2);
      } else {
        setError("User not found.");
        setShowError(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "User not found.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
  setError("");
  setShowError(false);
  setShowErrorPopup(false); // Reset popup
  
  try {
    await axios.post('http://13.214.122.184:8000/api/users/verify', { username, otp });
    setStep(3);
  } catch (error) {
    setError("Invalid OTP.");
    setShowErrorPopup(true); // Show popup instead of inline
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowErrorPopup(false);
    }, 3000);
  }
};

const handleResetPassword = async () => {
  setError("");
  setShowError(false);
  setShowErrorPopup(false); // Reset popup
  
  try {
    await axios.post('http://13.214.122.184:8000/api/users/reset-password', { username, newPassword });
    setShowForgotPassword(false);
    setStep(1);
    setUsername("");
    setPassword("");
    setOtp("");
    setNewPassword("");
    
    // Show success message
    setError("Password reset successfully! You can now login with your new password.");
    setShowErrorPopup(true);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowErrorPopup(false);
    }, 3000);
    
  } catch (error) {
    setError("Password reset failed.");
    setShowErrorPopup(true); // Show popup instead of inline
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowErrorPopup(false);
    }, 3000);
  }
};

  return (
    <div className="main">
      <div className="login-container logmain">
        {!showForgotPassword ? (
          <>
            <div className="panel sign-in-panel">
              <h1 className="titleleft">Welcome to Vehicle Booking System</h1>
            </div>
            <div className="panel sign-up-panel">
              <h1 className="titleright">Log In to Your Account</h1>
              <form className="signup-form" onSubmit={handleSubmit}>
                {/* Removed inline error message */}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p
                  className="forgot-password"
                  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </p>
                <button type="submit" className="sign-up-button">
                  LOGIN
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="panel1 resetpanel">
  <h2 className='resethead'>Reset Your Password</h2><hr />
  
  
  {step === 1 && (
    <>
      <input 
        className='userinput'
        type="text"
        placeholder="Enter Your Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <button 
        className="btnrequest" 
        onClick={handleForgotPassword}
        disabled={loading}
      >
        {loading ? "Sending OTP..." : "Request OTP"}
      </button>
      {loading && (
        <div className="loading-message">
          <p>📧 Sending OTP to your Admin Team...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </>
  )}
  
  
            {step === 2 && (
              <>
                <input
                  className='userinput'
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button className="btnrequest" onClick={handleVerifyOtp}>Verify OTP</button>
              </>
            )}
            {step === 3 && (
              <>
                <input
                  className='userinput'
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="btnrequest" onClick={handleResetPassword}>Reset Password</button>
              </>
            )}
            <button 
              className="btnrequest" 
              onClick={() => {
                setShowForgotPassword(false);
                setStep(1);
                setError("");
                setShowError(false);
                setLoading(false);
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
      
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="error-popup-overlay">
          <div className="error-popup">
            <div className="error-popup-header">
              <h3>{error.includes("successfully") ? "✅ Success" : "⚠️ Login Failed"}</h3>
            </div>
            <div className="error-popup-body">
              <p>{error}</p>
            </div>
            <div className="error-popup-footer">
              <button 
                className="error-popup-btn"
                onClick={() => setShowErrorPopup(false)}
              >
                {error.includes("successfully") ? "OK" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
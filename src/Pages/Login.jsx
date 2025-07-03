import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../dist/login.css";

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

  const handleSubmit = async (e) => {
  e.preventDefault();
  setShowError(false);
  setError("");

  if (!username || !password) {
    setError("All fields are required.");
    setShowError(true);
    return;
  }

  try {
    // Call your backend login API
    const response = await axios.post('http://localhost:8000/api/users/login', {
      username,
      password,
    });

    const user = response.data;

    // Only allow admin login
    if (user.role === "admin") {
      localStorage.setItem('currentUser', JSON.stringify({ username: user.username, role: user.role }));
      // Redirect to admin dashboard
      navigate('/AdminDashboardPage');
    } else {
      setError("Only admin accounts can log in.");
      setShowError(true);
    }
  } catch (error) {
    setError(error.response?.data?.message || "Invalid username or password.");
    setShowError(true);
  }
};
  
  const handleForgotPassword = async () => {
    setError(""); // Clear any previous errors when moving to the next step
    setShowError(false);
    try {
        const response = await axios.post('http://localhost:5000/api/users/request', { username });

        if (response.data.message === "User Correct") {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP

            // Send OTP to backend for saving
            await axios.post('http://localhost:5000/api/users/otp', { username, otp: otpCode });

            //setUsername(""); // Clear username after request
            setStep(2);
        } else {
            setError("User not found.");
            setShowError(true);
        }
    } catch (error) {
        setError(error.response?.data?.message || "User not found.");
        setShowError(true);
    }
};

  

  const handleVerifyOtp = async () => {
    setError(""); // Clear any previous errors when moving to the next step
    setShowError(false);
    try {
      await axios.post('http://localhost:5000/api/users/verify', { username, otp });
      setStep(3);
    } catch (error) {
      setError("Invalid OTP.");
      setShowError(true);
    }
  };

  const handleResetPassword = async () => {
    setError(""); // Clear any previous errors when moving to the next step
    setShowError(false);
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', { username, newPassword });
      setShowForgotPassword(false);
      setStep(1);
    } catch (error) {
      setError("Password reset failed.");
      setShowError(true);
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
                {showError && <p className="error-message">{error}</p>}
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
            <h2 className='resethead'>Reset Your Password</h2><hr></hr>
            {showError && <p className="error-message">{error}</p>}
            {step === 1 && (
              <>
                <input className='userinput'
                  type="text"
                  placeholder="Enter Your Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button  className="btnrequest" onClick={handleForgotPassword}>Request OTP</button>
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
            {/*<button onClick={() => setShowForgotPassword(false)}>Back to Login</button>*/}
          </div>
        )}
      </div>
    </div>
  );
};


export default Login;


import Settings from "./Settings";
import { useState } from "react";
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import MyApplications from "./MyApplications";
import Dashboard from "./Dashboard";
import FindProjects from "./FindProjects";
import Skills from "./Skills";
import Profile from "./Profile";
import Projects from "./Projects";
import ManageApplications from "./ManageApplications";
import ApplyProject from "./ApplyProject";

// ==========================================
// LOGIN + REGISTER PAGE
// ==========================================

function Home() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="container">
      <h1>Student Skill & Project Collaboration</h1>

      <div className="form-box">
        <div className="tab-buttons">
          <button
            onClick={() => setShowLogin(true)}
            className={showLogin ? "active-tab" : ""}
          >
            Login
          </button>

          <button
            onClick={() => setShowLogin(false)}
            className={!showLogin ? "active-tab" : ""}
          >
            Register
          </button>
        </div>

        {showLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

// ==========================================
// LOGIN FORM
// ==========================================

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password screen
  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/students/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ==========================================
      // SAVE JWT TOKEN
      // ==========================================

      if (data.token) {
        localStorage.setItem(
          "studentToken",
          data.token
        );
      }

      // Save the logged-in student's email
      localStorage.setItem(
        "studentEmail",
        data.student?.email || email
      );

      // Save the student's name returned by backend
      if (data.student?.name) {
        localStorage.setItem(
          "studentName",
          data.student.name
        );
      } else {
        // If backend does not return the name,
        // fetch it from the student's profile.
        const profileResponse = await fetch(
          `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`
        );

        if (profileResponse.ok) {
          const profileData =
            await profileResponse.json();

          const student =
            profileData.student || profileData;

          if (student.name) {
            localStorage.setItem(
              "studentName",
              student.name
            );
          }
        }
      }

      alert(
        data.message ||
        "Login successful"
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div>
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <label>Password</label>

        {/* ==========================================
            PROFESSIONAL PASSWORD FIELD
        ========================================== */}

        <div
          style={{
            position: "relative",
            width: "100%",
            margin: 0,
            padding: 0
          }}
        >
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingRight: "48px"
            }}
          />

          {/* PROFESSIONAL EYE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            title={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            style={{
              position: "absolute",
              right: "0",
              top: "0",
              width: "44px",
              height: "100%",
              margin: "0",
              padding: "0",
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none"
            }}
          >
            {showPassword ? (
              // EYE OFF ICON
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M9.88 5.09C10.56 4.9 11.27 4.8 12 4.8C17.33 4.8 20.67 9.6 21.5 11.1C21.63 11.33 21.63 11.67 21.5 11.9C21.15 12.53 20.29 13.85 18.94 15.12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M6.61 6.61C4.74 7.75 3.4 9.5 2.5 11.1C2.37 11.33 2.37 11.67 2.5 11.9C3.33 13.4 6.67 18.2 12 18.2C13.48 18.2 14.83 17.84 16.03 17.27"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // NORMAL EYE ICON
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.5 12C3.33 10.5 6.67 5.8 12 5.8C17.33 5.8 20.67 10.5 21.5 12C20.67 13.5 17.33 18.2 12 18.2C6.67 18.2 3.33 13.5 2.5 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>
        </div>

        {/* ==========================================
            FORGOT PASSWORD
        ========================================== */}

        <div
          style={{
            width: "100%",
            textAlign: "right",
            marginTop: "8px",
            marginBottom: "15px"
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowForgotPassword(true)
            }
            style={{
              margin: "0",
              padding: "0",
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "none"
            }}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

function ForgotPassword({ onBack }) {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:5000/api/students/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to send OTP"
        );

        return;
      }

      alert(
        data.message ||
        "OTP sent successfully"
      );

      setStep(2);

    } catch (error) {

      console.error(
        "Send OTP error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:5000/api/students/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            otp
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "OTP verification failed"
        );

        return;
      }

      alert(
        data.message ||
        "OTP verified successfully"
      );

      setStep(3);

    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {

    e.preventDefault();

    if (
      newPassword !==
      confirmPassword
    ) {

      alert(
        "Passwords do not match"
      );

      return;
    }

    if (
      newPassword.length < 6
    ) {

      alert(
        "Password must be at least 6 characters"
      );

      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "http://localhost:5000/api/students/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            otp,
            newPassword
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to reset password"
        );

        return;
      }

      alert(
        data.message ||
        "Password changed successfully"
      );

      // Return to Login page
      onBack();

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // FORGOT PASSWORD UI
  // ==========================================

  return (
    <div>

      <h2>Forgot Password</h2>

      {/* ==========================================
          STEP 1 - EMAIL
      ========================================== */}

      {step === 1 && (

        <form onSubmit={handleSendOTP}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            style={{
              marginTop: "10px"
            }}
          >
            Back to Login
          </button>

        </form>

      )}

      {/* ==========================================
          STEP 2 - OTP
      ========================================== */}

      {step === 2 && (

        <form onSubmit={handleVerifyOTP}>

          <label>OTP</label>

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            maxLength="6"
            inputMode="numeric"
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            style={{
              marginTop: "10px"
            }}
          >
            Change Email
          </button>

        </form>

      )}

      {/* ==========================================
          STEP 3 - NEW PASSWORD
      ========================================== */}

      {step === 3 && (

        <form onSubmit={handleResetPassword}>

          <label>New Password</label>

          <div
            style={{
              position: "relative",
              width: "100%"
            }}
          >

            <input
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "48px"
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  !showNewPassword
                )
              }
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                width: "44px",
                height: "100%",
                margin: "0",
                padding: "0",
                border: "none",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none"
              }}
              aria-label={
                showNewPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showNewPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9.88 5.09C10.56 4.9 11.27 4.8 12 4.8C17.33 4.8 20.67 9.6 21.5 11.1C21.63 11.33 21.63 11.67 21.5 11.9C21.15 12.53 20.29 13.85 18.94 15.12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M6.61 6.61C4.74 7.75 3.4 9.5 2.5 11.1C2.37 11.33 2.37 11.67 2.5 11.9C3.33 13.4 6.67 18.2 12 18.2C13.48 18.2 14.83 17.84 16.03 17.27"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 12C3.33 10.5 6.67 5.8 12 5.8C17.33 5.8 20.67 10.5 21.5 12C20.67 13.5 17.33 18.2 12 18.2C6.67 18.2 3.33 13.5 2.5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>

          </div>

          <label>Confirm Password</label>

          <div
            style={{
              position: "relative",
              width: "100%"
            }}
          >

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "48px"
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                width: "44px",
                height: "100%",
                margin: "0",
                padding: "0",
                border: "none",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none"
              }}
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showConfirmPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9.88 5.09C10.56 4.9 11.27 4.8 12 4.8C17.33 4.8 20.67 9.6 21.5 11.1C21.63 11.33 21.63 11.67 21.5 11.9C21.15 12.53 20.29 13.85 18.94 15.12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M6.61 6.61C4.74 7.75 3.4 9.5 2.5 11.1C2.37 11.33 2.37 11.67 2.5 11.9C3.33 13.4 6.67 18.2 12 18.2C13.48 18.2 14.83 17.84 16.03 17.27"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 12C3.33 10.5 6.67 5.8 12 5.8C17.33 5.8 20.67 10.5 21.5 12C20.67 13.5 17.33 18.2 12 18.2C6.67 18.2 3.33 13.5 2.5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Changing Password..."
              : "Change Password"}
          </button>

        </form>

      )}

    </div>
  );
}

// ==========================================
// REGISTER FORM
// ==========================================

function RegisterForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] =
    useState("");
  const [year, setYear] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/students/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password,
            department,
            year
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Registration failed"
        );
        return;
      }

      // Save the details entered during registration
      localStorage.setItem(
        "studentEmail",
        email
      );

      localStorage.setItem(
        "studentName",
        name
      );

      alert(
        data.message ||
        "Registration successful"
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  return (
    <div>
      <h2>Student Registration</h2>

      <form onSubmit={handleRegister}>
        <label>Name</label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
        />

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <label>Department</label>

        <input
          type="text"
          placeholder="Example: CSE"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          required
        />

        <label>Year</label>

        <select
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
          required
        >
          <option value="">
            Select Year
          </option>

          <option value="1st Year">
            1st Year
          </option>

          <option value="2nd Year">
            2nd Year
          </option>

          <option value="3rd Year">
            3rd Year
          </option>

          <option value="4th Year">
            4th Year
          </option>
        </select>

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

// ==========================================
// APP ROUTES
// ==========================================

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/projects"
        element={<Projects />}
      />

      <Route
        path="/skills"
        element={<Skills />}
      />

      <Route
        path="/find-projects"
        element={<FindProjects />}
      />

      <Route
        path="/apply/:projectId"
        element={<ApplyProject />}
      />

      <Route
        path="/applications"
        element={<MyApplications />}
      />

      <Route
        path="/manage-applications"
        element={<ManageApplications />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />
    </Routes>
  );
}

export default App;

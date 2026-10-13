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

      // Save the logged-in student's email
      localStorage.setItem(
        "studentEmail",
        data.student?.email || email
      );

      // Save the student's name returned by the backend
      if (data.student?.name) {
        localStorage.setItem(
          "studentName",
          data.student.name
        );
      } else {
        // If the backend does not return the name,
        // fetch it from the student's profile.
        const profileResponse = await fetch(
          `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          // Supports either { student: {...} } or a direct student object
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

      alert(data.message || "Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server. Please try again.");
    }
  };

  return (
    <div>
      <h2>Student Login</h2>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
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
  const [department, setDepartment] = useState("");
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

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      // Save the details entered during registration
      localStorage.setItem("studentEmail", email);
      localStorage.setItem("studentName", name);

      alert(data.message || "Registration successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to the server. Please try again.");
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
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Department</label>
        <input
          type="text"
          placeholder="Example: CSE"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        <label>Year</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        >
          <option value="">Select Year</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        <button type="submit">Register</button>
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
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/skills" element={<Skills />} />
      <Route path="/find-projects" element={<FindProjects />} />
      <Route path="/applications" element={<MyApplications />} />
      <Route
        path="/manage-applications"
        element={<ManageApplications />}
      />
    </Routes>
  );
}

export default App;
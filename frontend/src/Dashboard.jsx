import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // Get the logged-in student's name
  const studentName = localStorage.getItem("studentName");

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentName");
    navigate("/");
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Student Skill & Project Collaboration</h1>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>
          Welcome, {studentName || "Student"} 👋
        </h2>

        <p>
          Manage your profile, skills, projects and
          collaborations from here.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-grid">
        {/* My Profile */}
        <div className="dashboard-card">
          <div className="card-icon">👤</div>

          <h3>My Profile</h3>

          <p>
            View and update your student profile.
          </p>

          <button onClick={() => navigate("/profile")}>
            Open Profile
          </button>
        </div>

        {/* My Skills */}
        <div className="dashboard-card">
          <div className="card-icon">🛠️</div>

          <h3>My Skills</h3>

          <p>
            Add and manage your technical skills.
          </p>

          <button onClick={() => navigate("/skills")}>
            Manage Skills
          </button>
        </div>

        {/* My Projects */}
        <div className="dashboard-card">
          <div className="card-icon">📁</div>

          <h3>My Projects</h3>

          <p>
            Create and manage your projects.
          </p>

          <button onClick={() => navigate("/projects")}>
            View Projects
          </button>
        </div>

        {/* Find Projects */}
        <div className="dashboard-card">
          <div className="card-icon">🔎</div>

          <h3>Find Projects</h3>

          <p>
            Find projects and opportunities to join.
          </p>

          <button
            onClick={() => navigate("/find-projects")}
          >
            Find Projects
          </button>
        </div>

        {/* Manage Applications */}
        <div className="dashboard-card">
          <div className="card-icon">📋</div>

          <h3>Manage Applications</h3>

          <p>
            Review students who have applied to your projects.
          </p>

          <button
            onClick={() => navigate("/manage-applications")}
          >
            Review Applications
          </button>
        </div>

        {/* My Applications */}
        <div className="dashboard-card">
          <div className="card-icon">📩</div>

          <h3>My Applications</h3>

          <p>
            View your project applications and their status.
          </p>

          <button
            onClick={() => navigate("/applications")}
          >
            View Applications
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
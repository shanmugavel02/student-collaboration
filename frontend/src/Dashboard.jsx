
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // ==========================================
  // CLOSE PROFILE MENU WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const [student, setStudent] = useState({
    name: localStorage.getItem("studentName") || "Student"
  });

  const [stats, setStats] = useState({
    projects: 0,
    applicationsSent: 0,
    applicationsReceived: 0,
    skills: 0
  });

  const [activities, setActivities] = useState([]);

  const email = localStorage.getItem("studentEmail");
  const token = localStorage.getItem("studentToken");

  /* =================================
     LOAD DASHBOARD DATA
  ================================= */

  useEffect(() => {
    if (!email || !token) {
      navigate("/");
      return;
    }

    loadDashboardData();
  }, [email, token, navigate]);

  const loadDashboardData = async () => {
    try {
      const [
        projectsResponse,
        sentApplicationsResponse,
        receivedApplicationsResponse,
        profileResponse
      ] = await Promise.all([
        fetch(
          `/api/projects/my/${encodeURIComponent(email)}`
        ),

        fetch(
          `/api/applications/my/${encodeURIComponent(email)}`
        ),

        fetch(
          `/api/applications/received/${encodeURIComponent(email)}`
        ),

        fetch(
          `/api/students/profile/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      ]);

      const projectsData =
        await projectsResponse.json();

      const sentApplicationsData =
        await sentApplicationsResponse.json();

      const receivedApplicationsData =
        await receivedApplicationsResponse.json();

      const profileData =
        await profileResponse.json();

      /* =================================
         STUDENT PROFILE
      ================================= */

      if (
        profileResponse.ok &&
        profileData &&
        profileData.name
      ) {
        setStudent(profileData);

        // Keep the latest name in localStorage
        localStorage.setItem(
          "studentName",
          profileData.name
        );
      }

      /* =================================
         CALCULATE STATISTICS
      ================================= */

      const projects = Array.isArray(projectsData)
        ? projectsData
        : [];

      const sentApplications =
        Array.isArray(sentApplicationsData)
          ? sentApplicationsData
          : [];

      const receivedApplications =
        Array.isArray(receivedApplicationsData)
          ? receivedApplicationsData
          : [];

      const skills = Array.isArray(profileData?.skills)
        ? profileData.skills.length
        : 0;

      setStats({
        projects: projects.length,
        applicationsSent: sentApplications.length,
        applicationsReceived:
          receivedApplications.length,
        skills
      });

      /* =================================
         RECENT ACTIVITY
      ================================= */

      const activityList = [];

      /* PROJECT ACTIVITIES */

      projects.forEach((project) => {
        activityList.push({
          id: `project-${project._id}`,
          type: "project",
          icon: "📁",
          text: "You created a project",
          name:
            project.projectName ||
            project.projectCode ||
            "a project",
          date:
            project.createdAt ||
            project.updatedAt ||
            new Date()
        });
      });

      /* SENT APPLICATION ACTIVITIES */

      sentApplications.forEach((application) => {
        let text = "You applied for a project";
        let icon = "📤";

        if (application.status === "Accepted") {
          text = "Your application was accepted";
          icon = "✅";
        }

        if (application.status === "Rejected") {
          text = "Your application was rejected";
          icon = "❌";
        }

        activityList.push({
          id: `sent-${application._id}`,
          type: "application",
          icon,
          text,
          name:
            application.projectName ||
            application.projectCode ||
            "a project",
          date:
            application.updatedAt ||
            application.createdAt ||
            new Date()
        });
      });

      /* RECEIVED APPLICATION ACTIVITIES */

      receivedApplications.forEach((application) => {
        activityList.push({
          id: `received-${application._id}`,
          type: "received",
          icon: "📥",
          text: "You received an application",
          name:
            application.projectName ||
            application.projectCode ||
            "your project",
          date:
            application.createdAt ||
            new Date()
        });
      });

      /* SORT BY DATE */

      activityList.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

      /* SHOW ONLY LATEST 5 */

      setActivities(
        activityList.slice(0, 5)
      );

    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );
    }
  };

  /* =================================
     GET DISPLAY NAME
  ================================= */

  const displayName =
    student?.name ||
    localStorage.getItem("studentName") ||
    "Student";

  /* =================================
     GET AVATAR LETTER
  ================================= */

  const avatarLetter =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase();

  /* =================================
     FORMAT ACTIVITY DATE
  ================================= */

  const formatActivityDate = (date) => {
    if (!date) {
      return "";
    }

    const activityDate =
      new Date(date);

    if (Number.isNaN(activityDate.getTime())) {
      return "";
    }

    return activityDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  };

  /* =================================
     LOGOUT
  ================================= */

  const handleLogout = () => {
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentToken");

    setShowMenu(false);

    navigate("/");
  };

  /* =================================
     NAVIGATION
  ================================= */

  const goTo = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  return (
    <div className="dashboard-page">

      {/* =================================
          HEADER
      ================================= */}

      <header className="dashboard-header">

        <div
          className="dashboard-logo"
          onClick={() => navigate("/dashboard")}
        >
          <div className="logo-box">
            SC
          </div>

          <span>
            Student Collaboration
          </span>
        </div>

        {/* PROFILE */}

        <div
          className="dashboard-profile"
          ref={menuRef}
        >

          <button
            className="profile-button"
            onClick={() =>
              setShowMenu(!showMenu)
            }
          >
            <div className="profile-avatar">
              {avatarLetter}
            </div>

            <span>
              {displayName}
            </span>

            <span className="profile-arrow">
              {showMenu ? "▲" : "▼"}
            </span>
          </button>

          {showMenu && (

            <div className="profile-menu">

              <button
                onClick={() =>
                  goTo("/profile")
                }
              >
                👤 My Profile
              </button>

              <button
                onClick={() =>
                  goTo("/skills")
                }
              >
                🛠️ My Skills
              </button>

              <button
                onClick={() =>
                  goTo("/settings")
                }
              >
                ⚙️ Settings
              </button>

              <div className="profile-menu-divider" />

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>

            </div>

          )}

        </div>

      </header>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="dashboard-content">

        {/* =================================
            WELCOME
        ================================= */}

        <section className="welcome-section">

          <h1>
            Welcome, {displayName} 👋
          </h1>

          <p>
            Manage your projects, skills and
            collaboration activities.
          </p>

        </section>

        {/* =================================
            TOP NAVIGATION
        ================================= */}

        <nav className="dashboard-navigation">

          <button
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </button>

          <button
            onClick={() => navigate("/skills")}
          >
            🛠️ Skills
          </button>

          <button
            onClick={() => navigate("/projects")}
          >
            📁 My Projects
          </button>

          <button
            onClick={() =>
              navigate("/find-projects")
            }
          >
            🔍 Find Projects
          </button>

          <button
            onClick={() =>
              navigate("/applications")
            }
          >
            📤 Applications
          </button>

          <button
            onClick={() =>
              navigate("/manage-applications")
            }
          >
            📥 Manage Applications
          </button>

          <button
            onClick={() =>
              navigate("/settings")
            }
          >
            ⚙️ Settings
          </button>

        </nav>

        {/* =================================
            DASHBOARD OVERVIEW
        ================================= */}

        <section className="overview-section">

          <div className="section-heading">

            <h2>
              Dashboard Overview
            </h2>

            <p>
              Your current activity on the platform
            </p>

          </div>

          <div className="stats-grid">

            {/* PROJECTS */}

            <div className="stat-card">

              <div className="stat-icon">
                📁
              </div>

              <div className="stat-info">

                <span>
                  My Projects
                </span>

                <strong>
                  {stats.projects}
                </strong>

              </div>

            </div>

            {/* APPLICATIONS SENT */}

            <div className="stat-card">

              <div className="stat-icon">
                📤
              </div>

              <div className="stat-info">

                <span>
                  Applications Sent
                </span>

                <strong>
                  {stats.applicationsSent}
                </strong>

              </div>

            </div>

            {/* APPLICATIONS RECEIVED */}

            <div className="stat-card">

              <div className="stat-icon">
                📥
              </div>

              <div className="stat-info">

                <span>
                  Applications Received
                </span>

                <strong>
                  {stats.applicationsReceived}
                </strong>

              </div>

            </div>

            {/* SKILLS */}

            <div className="stat-card">

              <div className="stat-icon">
                🛠️
              </div>

              <div className="stat-info">

                <span>
                  My Skills
                </span>

                <strong>
                  {stats.skills}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* =================================
            RECENT ACTIVITY
        ================================= */}

        <section className="activity-section">

          <div className="section-heading">

            <h2>
              Recent Activity
            </h2>

            <p>
              Your latest activities
            </p>

          </div>

          {activities.length > 0 ? (

            <div className="activity-list">

              {activities.map(
                (activity) => (

                  <div
                    className="activity-item"
                    key={activity.id}
                  >

                    <div className="activity-icon">
                      {activity.icon}
                    </div>

                    <div className="activity-content">

                      <p>
                        {activity.text}
                      </p>

                      <strong>
                        {activity.name}
                      </strong>

                    </div>

                    <span className="activity-date">
                      {formatActivityDate(
                        activity.date
                      )}
                    </span>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="activity-empty">

              <div>
                📋
              </div>

              <p>
                No recent activity yet.
              </p>

              <span>
                Your project and application
                activities will appear here.
              </span>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;


import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const studentName =
    localStorage.getItem("studentName") || "Student";

  const studentEmail =
    localStorage.getItem("studentEmail") || "";

  const handleLogout = () => {
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentName");

    navigate("/");
  };

  return (
    <div className="settings-page">

      {/* ================= HEADER ================= */}

      <header className="settings-header">

        <div className="settings-brand">
          <div className="settings-logo">
            SC
          </div>

          <div>
            <h1>Student Collaboration</h1>
            <p>Settings</p>
          </div>
        </div>

        <button
          className="settings-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* ================= MAIN ================= */}

      <main className="settings-container">

        <div className="settings-title">

          <span>ACCOUNT</span>

          <h2>Settings</h2>

          <p>
            Manage your account and platform preferences.
          </p>

        </div>


        {/* ================= PROFILE ================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              👤
            </div>

            <div>
              <h3>Profile</h3>

              <p>
                Manage your personal information.
              </p>
            </div>

          </div>


          <div className="settings-profile">

            <div className="settings-avatar">
              {studentName.charAt(0).toUpperCase()}
            </div>

            <div className="settings-profile-info">

              <h3>{studentName}</h3>

              <p>{studentEmail}</p>

            </div>

            <button
              className="settings-action-btn"
              onClick={() => navigate("/profile")}
            >
              Edit Profile
            </button>

          </div>

        </section>


        {/* ================= SKILLS ================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🛠️
            </div>

            <div>
              <h3>Skills</h3>

              <p>
                Manage the skills you can contribute to projects.
              </p>
            </div>

          </div>


          <div className="settings-row">

            <div>
              <strong>My Skills</strong>

              <p>
                Add, edit or remove your technical skills.
              </p>
            </div>

            <button
              className="settings-action-btn"
              onClick={() => navigate("/skills")}
            >
              Manage Skills
            </button>

          </div>

        </section>


        {/* ================= NOTIFICATIONS ================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🔔
            </div>

            <div>
              <h3>Notifications</h3>

              <p>
                Control how you receive platform updates.
              </p>
            </div>

          </div>


          <div className="settings-row">

            <div>
              <strong>Application Updates</strong>

              <p>
                Receive updates when your project applications change.
              </p>
            </div>

            <label className="toggle">

              <input
                type="checkbox"
                defaultChecked
              />

              <span className="toggle-slider"></span>

            </label>

          </div>


          <div className="settings-row">

            <div>
              <strong>Project Updates</strong>

              <p>
                Receive updates about projects and collaboration.
              </p>
            </div>

            <label className="toggle">

              <input
                type="checkbox"
                defaultChecked
              />

              <span className="toggle-slider"></span>

            </label>

          </div>

        </section>


        {/* ================= ACCOUNT ================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🔐
            </div>

            <div>
              <h3>Account</h3>

              <p>
                Manage your account session.
              </p>
            </div>

          </div>


          <div className="settings-row">

            <div>
              <strong>Logout</strong>

              <p>
                Sign out from your Student Collaboration account.
              </p>
            </div>

            <button
              className="settings-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </section>


      </main>

    </div>
  );
}

export default Settings;
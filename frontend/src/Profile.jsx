
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const email = localStorage.getItem("studentEmail");
  const token = localStorage.getItem("studentToken");

  /* =================================
     LOAD PROFILE
  ================================= */

  useEffect(() => {
    if (!email) {
      setMessage("Student email not found");
      return;
    }

    if (!token) {
      setMessage("Authentication token not found. Please login again.");
      return;
    }

    fetch(
      `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Profile data:", data);

        if (data.message) {
          setMessage(data.message);
        } else {
          setStudent(data);

          setName(data.name || "");
          setDepartment(data.department || "");
          setYear(data.year || "");

          setSkills(
            Array.isArray(data.skills)
              ? data.skills.join(", ")
              : ""
          );

          setBio(data.bio || "");
        }
      })
      .catch((error) => {
        console.log(error);
        setMessage("Failed to load profile");
      });
  }, [email, token]);


  /* =================================
     SAVE PROFILE
  ================================= */

  const handleUpdate = async (e) => {
    e.preventDefault();

    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    try {
      setSaving(true);
      setMessage("");

      if (!token) {
        setMessage("Authentication token not found. Please login again.");
        setSaving(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            department,
            year,
            skills: skillsArray,
            bio
          })
        }
      );

      const data = await response.json();

      console.log("Update response:", data);

      if (response.ok) {
        setStudent(data.student);

        setName(data.student.name);
        setDepartment(data.student.department);
        setYear(data.student.year);

        setSkills(
          Array.isArray(data.student.skills)
            ? data.student.skills.join(", ")
            : ""
        );

        setBio(data.student.bio || "");

        setEditMode(false);

        setMessage("Profile updated successfully");

        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setMessage(
          data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.log(error);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };


  /* =================================
     LOADING
  ================================= */

  if (!student) {
    return (
      <div className="profile-container">

        <div className="profile-loading">

          <div className="profile-spinner"></div>

          <h2>
            {message || "Loading profile..."}
          </h2>

        </div>

      </div>
    );
  }


  /* =================================
     PROFILE INITIAL
  ================================= */

  const profileInitial = student.name
    ? student.name.charAt(0).toUpperCase()
    : "S";


  return (
    <div className="profile-container">

      {/* =================================
          TOP NAVIGATION
      ================================= */}

      <header className="profile-topbar">

        <button
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <div className="profile-page-title">
          <span>Student Profile</span>
        </div>

      </header>


      <main className="profile-content">

        {/* =================================
            PAGE INTRO
        ================================= */}

        <section className="profile-intro">

          <div>

            <span className="profile-eyebrow">
              ACCOUNT
            </span>

            <h1>
              My Profile
            </h1>

            <p>
              Manage your information and showcase
              your skills to other students.
            </p>

          </div>

        </section>


        {/* =================================
            SUCCESS / ERROR MESSAGE
        ================================= */}

        {message && (

          <div className="profile-message">
            <span>✓</span>
            {message}
          </div>

        )}


        {!editMode ? (

          <>
            {/* =================================
                PROFILE HERO
            ================================= */}

            <section className="profile-hero">

              <div className="profile-hero-left">

                <div className="profile-large-avatar">
                  {profileInitial}
                </div>

                <div className="profile-identity">

                  <h2>
                    {student.name}
                  </h2>

                  <p className="profile-email">
                    {student.email}
                  </p>

                  <div className="profile-active">

                    <span className="active-dot"></span>

                    Active Student

                  </div>

                </div>

              </div>


              <button
                className="profile-edit-button"
                onClick={() => {
                  setMessage("");
                  setEditMode(true);
                }}
              >
                ✏️ Edit Profile
              </button>

            </section>


            {/* =================================
                MAIN PROFILE GRID
            ================================= */}

            <div className="profile-grid">

              {/* =================================
                  ACADEMIC INFORMATION
              ================================= */}

              <section className="profile-card academic-card">

                <div className="card-heading">

                  <div className="card-icon">
                    🎓
                  </div>

                  <div>
                    <h3>
                      Academic Information
                    </h3>

                    <p>
                      Your current academic details.
                    </p>
                  </div>

                </div>


                <div className="academic-details">

                  <div className="academic-item">

                    <span>
                      Department
                    </span>

                    <strong>
                      {student.department ||
                        "Not provided"}
                    </strong>

                  </div>


                  <div className="academic-item">

                    <span>
                      Year
                    </span>

                    <strong>
                      {student.year ||
                        "Not provided"}
                    </strong>

                  </div>


                  <div className="academic-item academic-email">

                    <span>
                      Email
                    </span>

                    <strong>
                      {student.email}
                    </strong>

                  </div>

                </div>

              </section>


              {/* =================================
                  SKILLS
              ================================= */}

              <section className="profile-card skills-card">

                <div className="card-heading">

                  <div className="card-icon">
                    🛠️
                  </div>

                  <div>
                    <h3>
                      Skills
                    </h3>

                    <p>
                      Technologies you can contribute.
                    </p>
                  </div>

                </div>


                {student.skills &&
                student.skills.length > 0 ? (

                  <div className="profile-skill-tags">

                    {student.skills.map(
                      (skill, index) => (

                        <span
                          className="profile-skill-tag"
                          key={`${skill}-${index}`}
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <div className="profile-empty">

                    <div className="empty-icon">
                      🛠️
                    </div>

                    <div>
                      <strong>
                        No skills added yet
                      </strong>

                      <p>
                        Add your technical skills
                        to help others find you.
                      </p>
                    </div>

                  </div>

                )}

              </section>


              {/* =================================
                  ABOUT ME
              ================================= */}

              <section className="profile-card about-card">

                <div className="card-heading">

                  <div className="card-icon">
                    💬
                  </div>

                  <div>
                    <h3>
                      About Me
                    </h3>

                    <p>
                      A short introduction about you.
                    </p>
                  </div>

                </div>


                <div className="profile-bio">

                  {student.bio ? (

                    <p>
                      {student.bio}
                    </p>

                  ) : (

                    <div className="empty-bio">

                      <span>
                        💬
                      </span>

                      <p>
                        No introduction added yet.
                      </p>

                    </div>

                  )}

                </div>

              </section>

            </div>

          </>

        ) : (

          /* =================================
             EDIT PROFILE
          ================================= */

          <section className="edit-profile-card">

            <div className="edit-header">

              <div className="card-icon">
                ✏️
              </div>

              <div>

                <h2>
                  Edit Profile
                </h2>

                <p>
                  Update your information and
                  keep your profile current.
                </p>

              </div>

            </div>


            <form onSubmit={handleUpdate}>

              <div className="form-grid">

                {/* NAME */}

                <div className="form-field">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your name"
                    required
                  />

                </div>


                {/* EMAIL */}

                <div className="form-field">

                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={student.email}
                    disabled
                  />

                  <small>
                    Your registered email cannot
                    be changed.
                  </small>

                </div>


                {/* DEPARTMENT */}

                <div className="form-field">

                  <label>
                    Department
                  </label>

                  <input
                    type="text"
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value)
                    }
                    placeholder="Example: CSE"
                    required
                  />

                </div>


                {/* YEAR */}

                <div className="form-field">

                  <label>
                    Academic Year
                  </label>

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

                </div>

              </div>


              {/* SKILLS */}

              <div className="form-field">

                <label>
                  Skills
                </label>

                <input
                  type="text"
                  placeholder="Java, Python, React, MongoDB"
                  value={skills}
                  onChange={(e) =>
                    setSkills(e.target.value)
                  }
                />

                <small>
                  Separate multiple skills with commas.
                </small>

              </div>


              {/* BIO */}

              <div className="form-field">

                <label>
                  About Me
                </label>

                <textarea
                  placeholder="Tell something about yourself..."
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  rows="6"
                />

              </div>


              {/* BUTTONS */}

              <div className="edit-actions">

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "✓ Save Changes"}
                </button>


                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setEditMode(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}

      </main>

    </div>
  );
}

export default Profile;

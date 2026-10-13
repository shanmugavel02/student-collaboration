import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Skills.css";

function Skills() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const email = localStorage.getItem("studentEmail");

  // Load skills belonging to the logged-in student
  useEffect(() => {
    const fetchSkills = async () => {
      if (!email) {
        setMessage("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile.");
        }

        const student = data.student || data.profile || data;

        setSkills(
          Array.isArray(student.skills) ? student.skills : []
        );
      } catch (error) {
        console.error("Load Skills Error:", error);
        setMessage(error.message || "Unable to load skills.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [email]);

  // Save skills only to the logged-in student's profile
  const saveSkills = async (updatedSkills) => {
    if (!email) {
      setMessage("Please log in again.");
      return false;
    }

    setSaving(true);
    setMessage("");

    try {
      // Fetch this student's existing profile
      const profileResponse = await fetch(
        `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Failed to load student profile."
        );
      }

      const student =
        profileData.student || profileData.profile || profileData;

      // Update only the current student's profile
      const response = await fetch(
        `http://localhost:5000/api/students/profile/${encodeURIComponent(email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: student.name,
            department: student.department,
            year: student.year,
            skills: updatedSkills,
            bio: student.bio || "",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to save skills."
        );
      }

      setSkills(updatedSkills);
      setMessage("Skills saved successfully!");
      return true;
    } catch (error) {
      console.error("Save Skills Error:", error);
      setMessage(error.message || "Unable to save skills.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add a skill
  const handleAddSkill = async (event) => {
    event.preventDefault();

    const skill = newSkill.trim();

    if (!skill) {
      setMessage("Please enter a skill.");
      return;
    }

    const alreadyExists = skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setMessage("This skill already exists.");
      return;
    }

    const success = await saveSkills([...skills, skill]);

    if (success) {
      setNewSkill("");
    }
  };

  // Remove a skill
  const handleDeleteSkill = async (skillToDelete) => {
    const updatedSkills = skills.filter(
      (skill) => skill !== skillToDelete
    );

    await saveSkills(updatedSkills);
  };

  return (
    <div className="skills-page">
      <button
        className="skills-back-button"
        onClick={() => navigate("/dashboard")}
      >
        ← Back to Dashboard
      </button>

      <div className="skills-container">
        <h1>My Skills</h1>

        <p className="skills-subtitle">
          Add and manage your own technical skills.
        </p>

        {message && (
          <p className="skills-message">{message}</p>
        )}

        <form className="skills-form" onSubmit={handleAddSkill}>
          <input
            type="text"
            placeholder="Enter a skill, e.g. Java"
            value={newSkill}
            onChange={(event) => setNewSkill(event.target.value)}
            disabled={loading || saving || !email}
          />

          <button
            type="submit"
            disabled={loading || saving || !email}
          >
            {saving ? "Saving..." : "Add Skill"}
          </button>
        </form>

        <h2>My Technical Skills</h2>

        {loading ? (
          <p>Loading skills...</p>
        ) : skills.length === 0 ? (
          <p className="empty-skills">
            No skills added yet. Add your first skill above!
          </p>
        ) : (
          <div className="skills-list">
            {skills.map((skill) => (
              <div className="skill-item" key={skill}>
                <span>{skill}</span>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleDeleteSkill(skill)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Skills;
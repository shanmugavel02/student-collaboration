
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindProjects.css";

function FindProjects() {
  const navigate = useNavigate();

  const email = (
    localStorage.getItem("studentEmail") || ""
  ).trim().toLowerCase();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState("");
  const [appliedIds, setAppliedIds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/projects/all"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load projects"
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid projects response");
        }

        setProjects(data);
      } catch (err) {
        setError(err.message || "Could not load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const skills = useMemo(() => {
    return [
      ...new Set(
        projects.flatMap((project) =>
          Array.isArray(project.requiredSkills)
            ? project.requiredSkills
            : []
        )
      ),
    ];
  }, [projects]);

  const filteredProjects = projects.filter((project) => {
    const ownerEmail = (
      project.ownerEmail || ""
    ).trim().toLowerCase();

    if (ownerEmail === email) return false;

    const text = (
      (project.projectName || "") +
      " " +
      (project.description || "")
    ).toLowerCase();

    const matchesSearch = text.includes(
      search.toLowerCase()
    );

    const projectSkills = Array.isArray(
      project.requiredSkills
    )
      ? project.requiredSkills
      : [];

    const matchesSkill =
      !selectedSkill ||
      projectSkills.includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  const handleApply = async (project) => {
    if (!email) {
      setMessage("Please log in before applying.");
      return;
    }

    const projectId = project._id;

    if (!projectId) {
      setMessage("Project ID is missing.");
      return;
    }

    try {
      setApplyingId(projectId);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/applications/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            applicantEmail: email,
            message: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Application failed"
        );
      }

      setAppliedIds((previous) => [
        ...previous,
        projectId,
      ]);

      setMessage(
        `Application submitted for "${project.projectName}"!`
      );
    } catch (err) {
      setMessage(
        err.message || "Could not submit application"
      );
    } finally {
      setApplyingId("");
    }
  };

  return (
    <div className="find-projects-page">
      <header className="find-projects-header">
        <button
          className="find-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>Find Projects</h1>
        <p>Discover projects and join a team.</p>
      </header>

      <main className="find-projects-content">
        <div className="find-projects-tools">
          <input
            type="text"
            placeholder="Search project name or description..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={selectedSkill}
            onChange={(event) =>
              setSelectedSkill(event.target.value)
            }
          >
            <option value="">All Skills</option>

            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p role="status" className="find-status">
            {message}
          </p>
        )}

        {loading && (
          <p className="find-status">
            Loading projects...
          </p>
        )}

        {error && (
          <div className="find-error">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="find-count">
              {filteredProjects.length} project(s) found
            </p>

            {filteredProjects.length === 0 ? (
              <div className="find-empty">
                No projects found. Try another search.
              </div>
            ) : (
              <div className="find-projects-grid">
                {filteredProjects.map((project) => {
                  const isApplying =
                    applyingId === project._id;

                  const isApplied =
                    appliedIds.includes(project._id);

                  return (
                    <article
                      className="find-project-card"
                      key={project._id}
                    >
                      <h2>{project.projectName}</h2>

                      <p className="find-description">
                        {project.description}
                      </p>

                      <div className="find-project-meta">
                        <p>
                          <strong>Project Owner:</strong>{" "}
                          {project.ownerEmail}
                        </p>

                        <p>
                          <strong>Team Size:</strong>{" "}
                          {project.teamSize}
                        </p>
                      </div>

                      <h3>Required Skills</h3>

                      <div className="find-skill-tags">
                        {Array.isArray(
                          project.requiredSkills
                        ) &&
                        project.requiredSkills.length > 0 ? (
                          project.requiredSkills.map(
                            (skill) => (
                              <span
                                className="find-skill-tag"
                                key={skill}
                              >
                                {skill}
                              </span>
                            )
                          )
                        ) : (
                          <span className="find-no-skills">
                            No specific skills
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isApplying || isApplied}
                        onClick={() => handleApply(project)}
                      >
                        {isApplying
                          ? "Applying..."
                          : isApplied
                          ? "Applied"
                          : "Apply to Project"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default FindProjects;

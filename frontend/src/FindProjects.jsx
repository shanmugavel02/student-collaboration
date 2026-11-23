
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindProjects.css";

function FindProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =================================
     LOAD PROJECTS
  ================================= */

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("studentToken");

      const response = await fetch(
        "/api/projects/opportunities",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load projects"
        );
      }

      setProjects(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "Error loading projects:",
        error
      );

      setError(
        "Unable to load projects. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =================================
     LOAD PROJECTS WHEN PAGE OPENS
  ================================= */

  useEffect(() => {
    loadProjects();
  }, []);

  /* =================================
     SEARCH PROJECTS
  ================================= */

  const filteredProjects = projects.filter(
    (project) => {
      const search = searchText
        .toLowerCase()
        .trim();

      /* Show all projects when search is empty */

      if (!search) {
        return true;
      }

      /* Project name */

      const projectName =
        project.projectName || "";

      /* Description */

      const description =
        project.description || "";

      /* Project code */

      const projectCode =
        project.projectCode || "";

      /* Domain */

      const domain =
        project.domain || "";

      /* Programming language */

      const programmingLanguage =
        project.programmingLanguage || "";

      /* AI tools */

      const aiTools =
        Array.isArray(project.aiTools)
          ? project.aiTools.join(" ")
          : project.aiTools || "";

      /* Required skills */

      const requiredSkills =
        Array.isArray(project.requiredSkills)
          ? project.requiredSkills.join(" ")
          : project.requiredSkills || "";

      /*
        Combine all searchable information
        into one string
      */

      const searchableText = `
        ${projectName}
        ${description}
        ${projectCode}
        ${domain}
        ${programmingLanguage}
        ${aiTools}
        ${requiredSkills}
      `.toLowerCase();

      /*
        Check whether the search text
        exists anywhere in the project
      */

      return searchableText.includes(search);
    }
  );

  return (
    <div className="find-projects-page">

      {/* =================================
          HEADER
      ================================= */}

      <header className="find-projects-header">

        <div>

          <h1>
            Find Projects
          </h1>

          <p>
            Discover projects related to your
            interests and skills.
          </p>

        </div>

        <button
          className="back-dashboard-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>

      {/* =================================
          SEARCH SECTION
      ================================= */}

      <section className="project-search-section">

        <div className="search-title">

          <h2>
            Search Projects
          </h2>

          <p>
            Search by domain, skill, programming
            language, AI tool or project name.
          </p>

        </div>

        {/* SEARCH BOX */}

        <div className="search-box-container">

          <span className="search-icon">
            🔎
          </span>

          <input
            type="text"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search domain, skill, language or project..."
            className="project-search-input"
          />

          {searchText && (

            <button
              type="button"
              className="clear-search-btn"
              onClick={() =>
                setSearchText("")
              }
            >
              ✕
            </button>

          )}

        </div>

        {/* SEARCH RESULT COUNT */}

        <div className="search-info">

          <span>
            {filteredProjects.length}
          </span>

          {filteredProjects.length === 1
            ? " project found"
            : " projects found"}

        </div>

      </section>

      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="find-projects-container">

        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="project-message">

            <div className="message-icon">
              ⏳
            </div>

            <h3>
              Loading projects...
            </h3>

            <p>
              Please wait while we find
              available projects.
            </p>

          </div>

        )}

        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (

          <div className="project-message error-message">

            <div className="message-icon">
              ⚠️
            </div>

            <h3>
              Something went wrong
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="retry-btn"
              onClick={loadProjects}
            >
              Try Again
            </button>

          </div>

        )}

        {/* =================================
            NO PROJECTS
        ================================= */}

        {!loading &&
          !error &&
          filteredProjects.length === 0 && (

            <div className="project-message">

              <div className="message-icon">
                🔍
              </div>

              <h3>
                No projects found
              </h3>

              <p>
                No projects match your search.
                Try another domain, skill,
                technology or project name.
              </p>

              {searchText && (

                <button
                  type="button"
                  className="retry-btn"
                  onClick={() =>
                    setSearchText("")
                  }
                >
                  Clear Search
                </button>

              )}

            </div>

          )}

        {/* =================================
            PROJECTS
        ================================= */}

        {!loading &&
          !error &&
          filteredProjects.length > 0 && (

            <section className="projects-grid">

              {filteredProjects.map(
                (project) => (

                  <div
                    className="find-project-card"
                    key={project._id}
                  >

                    {/* =========================
                        PROJECT HEADER
                    ========================= */}

                    <div className="project-card-header">

                      <div className="project-card-icon">
                        📁
                      </div>

                      <span className="project-code">
                        {project.projectCode ||
                          "PROJECT"}
                      </span>

                    </div>

                    {/* =========================
                        PROJECT NAME
                    ========================= */}

                    <h2>
                      {project.projectName}
                    </h2>

                    {/* =========================
                        DESCRIPTION
                    ========================= */}

                    <p className="project-description">

                      {project.description ||
                        "No description available."}

                    </p>

                    {/* =========================
                        DOMAIN
                    ========================= */}

                    {project.domain && (

                      <div className="project-domain">

                        <span>
                          🌐
                        </span>

                        <strong>
                          Domain:
                        </strong>

                        <span>
                          {project.domain}
                        </span>

                      </div>

                    )}

                    {/* =========================
                        PROGRAMMING LANGUAGE
                    ========================= */}

                    {project.programmingLanguage && (

                      <div className="project-domain">

                        <span>
                          💻
                        </span>

                        <strong>
                          Language:
                        </strong>

                        <span>
                          {project.programmingLanguage}
                        </span>

                      </div>

                    )}

                    {/* =========================
                        AI TOOLS
                    ========================= */}

                    {Array.isArray(
                      project.aiTools
                    ) &&
                      project.aiTools.length > 0 && (

                        <div className="project-domain">

                          <span>
                            🤖
                          </span>

                          <strong>
                            AI Tools:
                          </strong>

                          <span>
                            {project.aiTools.join(
                              ", "
                            )}
                          </span>

                        </div>

                      )}

                    {/* =========================
                        REQUIRED SKILLS
                    ========================= */}

                    <div className="skills-section">

                      <h4>
                        Required Skills
                      </h4>

                      <div className="skills-list">

                        {Array.isArray(
                          project.requiredSkills
                        ) &&
                          project.requiredSkills.length >
                            0 ? (

                          project.requiredSkills.map(
                            (skill, index) => (

                              <span
                                className="skill-tag"
                                key={index}
                              >
                                {skill}
                              </span>

                            )
                          )

                        ) : (

                          <span className="no-skills">
                            No specific skills mentioned
                          </span>

                        )}

                      </div>

                    </div>

                    {/* =========================
                        TEAM INFORMATION
                    ========================= */}

                    <div className="team-info">

                      {project.teamSize !==
                        undefined && (

                        <span>
                          👥 Team:{" "}
                          {project.teamSize}
                        </span>

                      )}

                      {project.membersNeeded !==
                        undefined && (

                        <span>
                          🧑‍💻 Needed:{" "}
                          {project.membersNeeded}
                        </span>

                      )}

                    </div>

                    {/* =========================
                        PROJECT OWNER
                    ========================= */}

                    <div className="project-owner">

                      <span className="owner-icon">
                        👤
                      </span>

                      <div>

                        <span className="owner-label">
                          Project Owner
                        </span>

                        <span className="owner-email">

                          {project.ownerEmail ||
                            project.email ||
                            "Student"}

                        </span>

                      </div>

                    </div>

                    {/* =========================
                        APPLY BUTTON
                    ========================= */}

                    <button
                      type="button"
                      className="apply-project-btn"
                      onClick={() =>
                        navigate(
                          `/apply/${project._id}`
                        )
                      }
                    >

                      View & Apply

                      <span>
                        →
                      </span>

                    </button>

                  </div>

                )
              )}

            </section>

          )}

      </main>

    </div>
  );
}

export default FindProjects;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Projects.css";

function Projects() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  // Private project information
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  // Public recruitment information
  const [domain, setDomain] = useState("");
  const [programmingLanguage, setProgrammingLanguage] =
    useState("");
  const [aiTools, setAiTools] = useState("");
  const [requiredSkills, setRequiredSkills] =
    useState("");
  const [teamSize, setTeamSize] = useState("");
  const [membersNeeded, setMembersNeeded] =
    useState("");
  const [projectCode, setProjectCode] = useState("");
  const [contactEmail, setContactEmail] =
    useState("");
  const [contactPhone, setContactPhone] =
    useState("");
  const [recruitmentMessage, setRecruitmentMessage] =
    useState("");

  const [message, setMessage] = useState("");

  const email =
    localStorage.getItem("studentEmail");


  // ==========================================
  // GET MY PROJECTS
  // ==========================================

  const fetchProjects = async () => {

    try {

      const response = await fetch(
        `http://localhost:5000/api/projects/my/${email}`
      );

      const data = await response.json();

      setProjects(data);

    } catch (error) {

      console.log(
        "Get Projects Error:",
        error
      );

    }

  };


  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {

    if (email) {
      fetchProjects();
    }

  }, [email]);


  // ==========================================
  // CREATE PROJECT OPPORTUNITY
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const skillsArray =
      requiredSkills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

    const aiToolsArray =
      aiTools
        .split(",")
        .map((tool) => tool.trim())
        .filter((tool) => tool.length > 0);


    try {

      const response = await fetch(
        "http://localhost:5000/api/projects/create",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            // Private information
            projectName: projectName,
            description: description,

            // Recruitment information
            domain: domain,
            programmingLanguage:
              programmingLanguage,
            aiTools: aiToolsArray,
            requiredSkills: skillsArray,

            teamSize: Number(teamSize),
            membersNeeded: Number(membersNeeded),

            projectCode:
              projectCode.trim().toUpperCase(),

            contactEmail:
              contactEmail.trim(),

            contactPhone:
              contactPhone.trim(),

            recruitmentMessage:
              recruitmentMessage,

            ownerEmail: email

          })

        }
      );


      const data = await response.json();


      if (response.ok) {

        setMessage(
          "Project opportunity created successfully!"
        );


        // Clear form

        setProjectName("");
        setDescription("");
        setDomain("");
        setProgrammingLanguage("");
        setAiTools("");
        setRequiredSkills("");
        setTeamSize("");
        setMembersNeeded("");
        setProjectCode("");
        setContactEmail("");
        setContactPhone("");
        setRecruitmentMessage("");


        // Refresh projects

        fetchProjects();

      } else {

        setMessage(
          data.message ||
          "Failed to create project opportunity"
        );

      }

    } catch (error) {

      console.log(
        "Create Project Error:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );

    }

  };


  return (

    <div className="projects-container">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="projects-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <span className="projects-label">
          PROJECT RECRUITMENT
        </span>

        <h1>
          Project Opportunities
        </h1>

        <p>
          Recruit team members without publicly
          revealing your actual project idea.
        </p>

      </div>


      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (

        <div className="project-message">
          ✓ {message}
        </div>

      )}


      {/* =====================================
          CREATE PROJECT OPPORTUNITY
      ===================================== */}

      <div className="project-form-box">

        <div className="form-title">

          <span>🔒</span>

          <div>
            <h2>
              Create Project Opportunity
            </h2>

            <p>
              Your actual project details remain
              private.
            </p>
          </div>

        </div>


        <form onSubmit={handleSubmit}>


          {/* =================================
              PRIVATE PROJECT INFORMATION
          ================================= */}

          <div className="form-section">

            <h3>
              🔐 Private Project Information
            </h3>

            <p className="section-description">
              These details are stored for you and
              are not intended for public recruitment.
            </p>


            <div className="form-field">

              <label>
                Actual Project Name
              </label>

              <input
                type="text"
                placeholder="Enter your actual project name"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
                required
              />

              <small>
                This is your real project name. Do not
                use it as the public project title.
              </small>

            </div>


            <div className="form-field">

              <label>
                Private Project Description
              </label>

              <textarea
                placeholder="Enter your detailed project idea"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="5"
              />

              <small>
                Your detailed idea is kept as private
                project information.
              </small>

            </div>

          </div>


          {/* =================================
              PUBLIC RECRUITMENT INFORMATION
          ================================= */}

          <div className="form-section">

            <h3>
              📢 Recruitment Information
            </h3>

            <p className="section-description">
              Students will see these details when
              looking for project opportunities.
            </p>


            {/* Project Code */}

            <div className="form-field">

              <label>
                Project Code
              </label>

              <input
                type="text"
                placeholder="Example: AI-PRJ-1042"
                value={projectCode}
                onChange={(e) =>
                  setProjectCode(
                    e.target.value.toUpperCase()
                  )
                }
                required
              />

              <small>
                Use a unique code instead of exposing
                your actual project name.
              </small>

            </div>


            {/* Domain */}

            <div className="form-field">

              <label>
                Domain
              </label>

              <input
                type="text"
                placeholder="Example: Artificial Intelligence"
                value={domain}
                onChange={(e) =>
                  setDomain(e.target.value)
                }
                required
              />

            </div>


            {/* Programming Language */}

            <div className="form-field">

              <label>
                Programming Language
              </label>

              <input
                type="text"
                placeholder="Example: Python"
                value={programmingLanguage}
                onChange={(e) =>
                  setProgrammingLanguage(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* AI Tools */}

            <div className="form-field">

              <label>
                AI Tools / Technologies
              </label>

              <input
                type="text"
                placeholder="Example: TensorFlow, OpenCV, Gemini"
                value={aiTools}
                onChange={(e) =>
                  setAiTools(e.target.value)
                }
              />

              <small>
                Separate multiple tools using commas.
              </small>

            </div>


            {/* Required Skills */}

            <div className="form-field">

              <label>
                Required Skills
              </label>

              <input
                type="text"
                placeholder="Example: Python, Machine Learning, React"
                value={requiredSkills}
                onChange={(e) =>
                  setRequiredSkills(
                    e.target.value
                  )
                }
                required
              />

              <small>
                Separate multiple skills using commas.
              </small>

            </div>


            {/* Team Size */}

            <div className="form-row">

              <div className="form-field">

                <label>
                  Total Team Size
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Example: 4"
                  value={teamSize}
                  onChange={(e) =>
                    setTeamSize(e.target.value)
                  }
                  required
                />

              </div>


              {/* Members Needed */}

              <div className="form-field">

                <label>
                  Members Needed
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="Example: 2"
                  value={membersNeeded}
                  onChange={(e) =>
                    setMembersNeeded(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>


            {/* Recruitment Message */}

            <div className="form-field">

              <label>
                Recruitment Message
              </label>

              <textarea
                placeholder="Example: Looking for students interested in joining an AI/ML project."
                value={recruitmentMessage}
                onChange={(e) =>
                  setRecruitmentMessage(
                    e.target.value
                  )
                }
                rows="4"
              />

            </div>

          </div>


          {/* =================================
              CONTACT INFORMATION
          ================================= */}

          <div className="form-section">

            <h3>
              📞 Contact Information
            </h3>

            <p className="section-description">
              Interested students can contact you
              directly to discuss the project privately.
            </p>


            <div className="form-row">

              <div className="form-field">

                <label>
                  Contact Email
                </label>

                <input
                  type="email"
                  placeholder="your@email.com"
                  value={contactEmail}
                  onChange={(e) =>
                    setContactEmail(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              <div className="form-field">

                <label>
                  Contact Phone
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={contactPhone}
                  onChange={(e) =>
                    setContactPhone(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

            </div>

          </div>


          {/* =================================
              CREATE BUTTON
          ================================= */}

          <button
            type="submit"
            className="create-project-button"
          >
            🔒 Create Private Project Opportunity
          </button>

        </form>

      </div>


      {/* =====================================
          MY CREATED PROJECTS
      ===================================== */}

      <div className="my-projects-section">

        <div className="section-heading">

          <div>
            <span className="projects-label">
              OWNER VIEW
            </span>

            <h2>
              My Project Opportunities
            </h2>

            <p>
              Only you can see your actual project
              information here.
            </p>
          </div>

        </div>


        {projects.length === 0 ? (

          <div className="no-projects">

            <span>📁</span>

            <p>
              You have not created any project
              opportunities yet.
            </p>

          </div>

        ) : (

          <div className="projects-grid">

            {projects.map((project) => (

              <div
                className="project-card"
                key={project._id}
              >

                <div className="project-card-header">

                  <span className="project-code">
                    {project.projectCode}
                  </span>

                  <span className="private-badge">
                    🔒 Private
                  </span>

                </div>


                <h3>
                  {project.projectName}
                </h3>


                {project.description && (

                  <p className="private-description">
                    {project.description}
                  </p>

                )}


                <div className="project-info-grid">

                  <div>
                    <span>
                      DOMAIN
                    </span>

                    <strong>
                      {project.domain}
                    </strong>
                  </div>


                  <div>
                    <span>
                      LANGUAGE
                    </span>

                    <strong>
                      {project.programmingLanguage}
                    </strong>
                  </div>


                  <div>
                    <span>
                      TEAM SIZE
                    </span>

                    <strong>
                      {project.teamSize}
                    </strong>
                  </div>


                  <div>
                    <span>
                      MEMBERS NEEDED
                    </span>

                    <strong>
                      {project.membersNeeded}
                    </strong>
                  </div>

                </div>


                {project.aiTools &&
                  project.aiTools.length > 0 && (

                  <div className="project-card-section">

                    <strong>
                      AI Tools
                    </strong>

                    <p>
                      {project.aiTools.join(", ")}
                    </p>

                  </div>

                )}


                <div className="project-card-section">

                  <strong>
                    Required Skills
                  </strong>

                  <div className="skill-tags">

                    {project.requiredSkills.map(
                      (skill, index) => (

                        <span
                          key={`${skill}-${index}`}
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                </div>


                <div className="project-contact">

                  <strong>
                    Contact
                  </strong>

                  <p>
                    📧 {project.contactEmail}
                  </p>

                  <p>
                    📱 {project.contactPhone}
                  </p>

                </div>


              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default Projects;
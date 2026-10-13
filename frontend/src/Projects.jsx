import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Projects.css";

function Projects() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [projectName, setProjectName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [requiredSkills, setRequiredSkills] =
    useState("");

  const [teamSize, setTeamSize] =
    useState("");

  const [message, setMessage] =
    useState("");


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

      const data =
        await response.json();

      setProjects(data);

    }
    catch (error) {

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
  // CREATE PROJECT
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const skillsArray =
      requiredSkills
        .split(",")
        .map((skill) =>
          skill.trim()
        )
        .filter((skill) =>
          skill.length > 0
        );


    try {

      const response = await fetch(
        "http://localhost:5000/api/projects/create",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            projectName:
              projectName,

            description:
              description,

            requiredSkills:
              skillsArray,

            teamSize:
              Number(teamSize),

            ownerEmail:
              email

          })

        }
      );


      const data =
        await response.json();


      if (response.ok) {

        setMessage(
          "Project created successfully"
        );


        // Clear form

        setProjectName("");

        setDescription("");

        setRequiredSkills("");

        setTeamSize("");


        // Refresh projects

        fetchProjects();

      }
      else {

        setMessage(
          data.message ||
          "Failed to create project"
        );

      }

    }
    catch (error) {

      console.log(error);

      setMessage(
        "Unable to connect to server"
      );

    }

  };


  return (

    <div className="projects-container">

      <button
        className="back-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>


      <h1>My Projects</h1>


      {message && (

        <div className="project-message">
          {message}
        </div>

      )}


      {/* =====================================
          CREATE PROJECT
      ===================================== */}

      <div className="project-form-box">

        <h2>
          Create New Project
        </h2>


        <form onSubmit={handleSubmit}>

          <label>
            Project Name
          </label>

          <input
            type="text"
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) =>
              setProjectName(
                e.target.value
              )
            }
            required
          />


          <label>
            Description
          </label>

          <textarea
            placeholder="Describe your project"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows="5"
            required
          />


          <label>
            Required Skills
          </label>

          <input
            type="text"
            placeholder="Example: Java, React, MongoDB"
            value={requiredSkills}
            onChange={(e) =>
              setRequiredSkills(
                e.target.value
              )
            }
            required
          />

          <small>
            Separate skills using commas.
          </small>


          <label>
            Team Size
          </label>

          <input
            type="number"
            min="1"
            placeholder="Example: 4"
            value={teamSize}
            onChange={(e) =>
              setTeamSize(
                e.target.value
              )
            }
            required
          />


          <button
            type="submit"
            className="create-project-button"
          >
            Create Project
          </button>

        </form>

      </div>


      {/* =====================================
          MY PROJECTS
      ===================================== */}

      <div className="my-projects-section">

        <h2>
          My Created Projects
        </h2>


        {projects.length === 0 ? (

          <p className="no-projects">
            You have not created any projects yet.
          </p>

        ) : (

          <div className="projects-grid">

            {projects.map((project) => (

              <div
                className="project-card"
                key={project._id}
              >

                <h3>
                  {project.projectName}
                </h3>


                <p>
                  {project.description}
                </p>


                <strong>
                  Required Skills:
                </strong>

                <p>
                  {project.requiredSkills.join(
                    ", "
                  )}
                </p>


                <strong>
                  Team Size:
                </strong>

                <p>
                  {project.teamSize}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}

export default Projects;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ApplyProject() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("studentEmail");
  const token = localStorage.getItem("studentToken");

  // ==========================================
  // LOAD PROJECT
  // ==========================================

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/projects/${projectId}`,
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
            data.message || "Failed to load project."
          );
        }

        setProject(data);

      } catch (err) {
        console.error(
          "Load Project Error:",
          err
        );

        setError(
          err.message ||
            "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, token]);

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please log in to apply for a project.");
      return;
    }

    if (!token) {
      setError(
        "Your login session has expired. Please log in again."
      );
      return;
    }

    if (!project) {
      setError("Project information is not available.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "/api/applications/apply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            projectId: project._id,
            projectName: project.projectName,
            projectCode: project.projectCode,
            applicantEmail: email,
            ownerEmail: project.ownerEmail,
            message: message.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit application."
        );
      }

      alert(
        data.message ||
          "Application submitted successfully!"
      );

      navigate("/applications");

    } catch (err) {
      console.error(
        "Application Submit Error:",
        err
      );

      setError(
        err.message ||
          "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <p>Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !project) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div
            style={{
              ...cardStyle,
              background: "#fef2f2"
            }}
          >
            <h2 style={{ color: "#991b1b" }}>
              Unable to Load Project
            </h2>

            <p style={{ color: "#991b1b" }}>
              {error}
            </p>

            <button
              style={buttonStyle}
              onClick={() =>
                navigate("/find-projects")
              }
            >
              Back to Find Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "25px"
          }}
        >
          <div>
            <h1
              style={{
                color: "#1e293b",
                margin: "0 0 8px"
              }}
            >
              Apply for Project
            </h1>

            <p
              style={{
                color: "#64748b",
                margin: 0
              }}
            >
              Submit your application to join this project.
            </p>
          </div>

          <button
            style={secondaryButtonStyle}
            onClick={() =>
              navigate("/find-projects")
            }
          >
            Back to Projects
          </button>
        </div>

        {/* PROJECT DETAILS */}

        {project && (
          <div style={cardStyle}>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "15px"
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  PROJECT CODE
                </p>

                <h2
                  style={{
                    color: "#1e293b",
                    margin: "5px 0 0"
                  }}
                >
                  {project.projectCode}
                </h2>
              </div>

              <span
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "7px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                {project.domain}
              </span>
            </div>

            <hr style={dividerStyle} />

            <h2
              style={{
                color: "#1e293b",
                marginBottom: "10px"
              }}
            >
              {project.projectName}
            </h2>

            <p
              style={{
                color: "#64748b",
                lineHeight: 1.6
              }}
            >
              {project.description ||
                "No project description available."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
                marginTop: "20px"
              }}
            >
              <InfoItem
                label="Programming Language"
                value={
                  project.programmingLanguage ||
                  "Not specified"
                }
              />

              <InfoItem
                label="Team Size"
                value={
                  project.teamSize ||
                  "Not specified"
                }
              />

              <InfoItem
                label="Members Needed"
                value={
                  project.membersNeeded ??
                  "Not specified"
                }
              />

              <InfoItem
                label="Project Owner"
                value={
                  project.ownerEmail ||
                  "Not available"
                }
              />
            </div>

            {project.requiredSkills?.length > 0 && (
              <div style={{ marginTop: "22px" }}>
                <strong
                  style={{ color: "#334155" }}
                >
                  Required Skills
                </strong>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "10px"
                  }}
                >
                  {project.requiredSkills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "13px"
                        }}
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {project.aiTools?.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <strong
                  style={{ color: "#334155" }}
                >
                  AI Tools
                </strong>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "10px"
                  }}
                >
                  {project.aiTools.map(
                    (tool, index) => (
                      <span
                        key={index}
                        style={{
                          background: "#ede9fe",
                          color: "#6d28d9",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "13px"
                        }}
                      >
                        {tool}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              ...cardStyle,
              background: "#fef2f2",
              color: "#991b1b"
            }}
          >
            <strong>Notice:</strong> {error}
          </div>
        )}

        {/* APPLICATION FORM */}

        {project && (
          <div style={cardStyle}>
            <h2
              style={{
                color: "#1e293b",
                marginTop: 0
              }}
            >
              Submit Your Application
            </h2>

            <p
              style={{
                color: "#64748b",
                lineHeight: 1.6
              }}
            >
              Tell the project owner why you would
              be a good fit for this project.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                style={labelStyle}
              >
                Your Email
              </label>

              <input
                type="email"
                value={email || ""}
                readOnly
                style={inputStyle}
              />

              <label
                style={labelStyle}
              >
                Application Message
              </label>

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Introduce yourself, mention your skills and explain why you are interested in this project..."
                rows="7"
                style={textareaStyle}
                required
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "20px"
                }}
              >
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...buttonStyle,
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting
                      ? "not-allowed"
                      : "pointer"
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Application"}
                </button>

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() =>
                    navigate("/find-projects")
                  }
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// SMALL INFORMATION COMPONENT
// ==========================================

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "14px",
        borderRadius: "8px"
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "5px"
        }}
      >
        {label}
      </div>

      <strong
        style={{
          color: "#1e293b",
          wordBreak: "break-word"
        }}
      >
        {value}
      </strong>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================

const pageStyle = {
  minHeight: "100vh",
  padding: "30px 20px",
  background: "#f4f7fb",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box"
};

const containerStyle = {
  maxWidth: "1000px",
  margin: "0 auto"
};

const cardStyle = {
  background: "#ffffff",
  padding: "22px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
  marginBottom: "20px",
  overflowWrap: "anywhere"
};

const buttonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

const secondaryButtonStyle = {
  padding: "11px 18px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600"
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  marginTop: "18px",
  color: "#334155",
  fontWeight: "600",
  fontSize: "14px"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "14px"
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "14px",
  fontFamily: "Arial, sans-serif",
  resize: "vertical",
  outline: "none"
};

const dividerStyle = {
  border: 0,
  borderTop: "1px solid #e2e8f0",
  margin: "20px 0"
};

export default ApplyProject;


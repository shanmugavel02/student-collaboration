import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ManageApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const email = localStorage.getItem("studentEmail");

  const fetchApplications = async () => {
    if (!email) {
      setError("Please log in to manage applications.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/applications/received/${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setApplications(data);
    } catch (err) {
      console.error("Manage Applications Error:", err);
      setError(err.message || "Could not load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (applicationId, status) => {
    if (!email) {
      setError("Please log in again.");
      return;
    }

    try {
      setUpdatingId(applicationId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status,
            ownerEmail: email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update application.");
      }

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status: data.application.status }
            : application
        )
      );
    } catch (err) {
      console.error("Update Application Error:", err);
      setError(err.message || "Could not update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = (status) => {
    if (status === "Accepted") {
      return { background: "#dcfce7", color: "#166534" };
    }

    if (status === "Rejected") {
      return { background: "#fee2e2", color: "#991b1b" };
    }

    return { background: "#fef3c7", color: "#92400e" };
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box"
  };

  const cardStyle = {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    marginBottom: "18px",
    overflowWrap: "anywhere"
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "14px"
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Page Header */}
        <header
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
            <h1 style={{ color: "#1e293b", marginBottom: "8px" }}>
              Manage Applications
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              Review students applying to your projects.
            </p>
          </div>

          <button
            style={{
              ...buttonStyle,
              background: "#2563eb"
            }}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </header>

        {/* Error Message */}
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

        {/* Loading */}
        {loading && (
          <div style={cardStyle}>
            Loading applications...
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: "40px" }}>📋</div>
            <h2 style={{ color: "#1e293b" }}>
              No Applications Received
            </h2>
            <p style={{ color: "#64748b" }}>
              Applications submitted to projects you own will appear here.
            </p>
            <button
              style={{
                ...buttonStyle,
                background: "#2563eb"
              }}
              onClick={() => navigate("/projects")}
            >
              View My Projects
            </button>
          </div>
        )}

        {/* Application Cards */}
        {!loading &&
          applications.map((application) => (
            <div key={application._id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <h2 style={{ color: "#1e293b", margin: "0 0 8px" }}>
                    {application.projectName || "Untitled Project"}
                  </h2>

                  <p style={{ color: "#475569", margin: 0 }}>
                    Applicant: {application.applicantEmail}
                  </p>
                </div>

                <span
                  style={{
                    ...statusStyle(application.status),
                    borderRadius: "20px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  {application.status || "Pending"}
                </span>
              </div>

              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid #e2e8f0",
                  margin: "18px 0"
                }}
              />

              <p style={{ color: "#475569" }}>
                <strong>Applied On:</strong>{" "}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString("en-IN")
                  : "Not available"}
              </p>

              <p style={{ color: "#475569" }}>
                <strong>Message:</strong>{" "}
                {application.message?.trim() ||
                  "No message provided."}
              </p>

              {application.status === "Pending" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "20px"
                  }}
                >
                  <button
                    disabled={updatingId === application._id}
                    style={{
                      ...buttonStyle,
                      background: "#16a34a",
                      opacity: updatingId === application._id ? 0.6 : 1
                    }}
                    onClick={() =>
                      updateStatus(application._id, "Accepted")
                    }
                  >
                    {updatingId === application._id
                      ? "Updating..."
                      : "Accept"}
                  </button>

                  <button
                    disabled={updatingId === application._id}
                    style={{
                      ...buttonStyle,
                      background: "#dc2626",
                      opacity: updatingId === application._id ? 0.6 : 1
                    }}
                    onClick={() =>
                      updateStatus(application._id, "Rejected")
                    }
                  >
                    {updatingId === application._id
                      ? "Updating..."
                      : "Reject"}
                  </button>
                </div>
              )}

              {application.status !== "Pending" && (
                <p style={{ color: "#64748b", marginTop: "18px" }}>
                  This application has already been reviewed.
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default ManageApplications;
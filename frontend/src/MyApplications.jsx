
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email = localStorage.getItem("studentEmail");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!email) {
        setError("Please log in to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/applications/my/${encodeURIComponent(
            email
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load applications."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setApplications(data);
      } catch (err) {
        console.error("My Applications Error:", err);
        setError(
          err.message ||
            "Cannot connect to the server. Check that your backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [email]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Accepted":
        return {
          background: "#dcfce7",
          color: "#166534"
        };

      case "Rejected":
        return {
          background: "#fee2e2",
          color: "#991b1b"
        };

      default:
        return {
          background: "#fef3c7",
          color: "#92400e"
        };
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    padding: "30px 20px",
    background: "#f4f7fb",
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
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px"
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        {/* Header */}
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
            <h1 style={{ color: "#1e293b", marginBottom: "8px" }}>
              My Applications
            </h1>

            <p style={{ color: "#64748b", margin: 0 }}>
              Track the status of your project applications.
            </p>
          </div>

          <button
            style={buttonStyle}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={cardStyle}>
            <p>Loading your applications...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              ...cardStyle,
              color: "#991b1b",
              background: "#fef2f2"
            }}
          >
            <h3>Unable to load applications</h3>
            <p>{error}</p>

            {!email && (
              <button
                style={buttonStyle}
                onClick={() => navigate("/")}
              >
                Go to Login
              </button>
            )}

            {email && (
              <button
                style={buttonStyle}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && applications.length === 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: "42px" }}>📩</div>

            <h2 style={{ color: "#1e293b" }}>
              No Applications Yet
            </h2>

            <p style={{ color: "#64748b" }}>
              You have not applied to any projects yet.
              Visit Find Projects to discover opportunities.
            </p>

            <button
              style={buttonStyle}
              onClick={() => navigate("/find-projects")}
            >
              Find Projects
            </button>
          </div>
        )}

        {/* Application List */}
        {!loading &&
          !error &&
          applications.length > 0 && (
            <>
              <p style={{ color: "#475569" }}>
                Total applications: <strong>{applications.length}</strong>
              </p>

              {applications.map((application) => (
                <div
                  key={application._id}
                  style={cardStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <h2
                      style={{
                        color: "#1e293b",
                        margin: 0
                      }}
                    >
                      {application.projectName || "Untitled Project"}
                    </h2>

                    <span
                      style={{
                        ...getStatusStyle(application.status),
                        padding: "6px 12px",
                        borderRadius: "20px",
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
                    <strong>Project Owner:</strong>{" "}
                    {application.ownerEmail || "Not available"}
                  </p>

                  <p style={{ color: "#475569" }}>
                    <strong>Applied On:</strong>{" "}
                    {formatDate(application.createdAt)}
                  </p>

                  <div style={{ marginTop: "16px" }}>
                    <strong style={{ color: "#334155" }}>
                      Application Message
                    </strong>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {application.message?.trim()
                        ? application.message
                        : "No message provided."}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
      </div>
    </div>
  );
}

export default MyApplications;

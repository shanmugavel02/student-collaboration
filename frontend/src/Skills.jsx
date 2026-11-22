
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Skills.css";

function Skills() {
  const navigate = useNavigate();

  const email = localStorage.getItem("studentEmail");

  const [student, setStudent] = useState(null);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [certificates, setCertificates] = useState([]);

  const [certificateSkill, setCertificateSkill] =
    useState("");
  const [certificateName, setCertificateName] =
    useState("");
  const [organization, setOrganization] =
    useState("");
  const [completionDate, setCompletionDate] =
    useState("");
  const [certificateFile, setCertificateFile] =
    useState(null);

  const [showCertificateForm, setShowCertificateForm] =
    useState(false);

  // Certificate popup
  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/");
      return;
    }

    loadProfile();
    loadCertificates();
  }, []);

  // ================================
  // Load Profile
  // ================================

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/profile/${email}`
      );

      const data = await response.json();

      if (response.ok) {
        setStudent(data);
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Profile loading error:", error);
    }
  };

  // ================================
  // Load Certificates
  // ================================

  const loadCertificates = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/${email}`
      );

      const data = await response.json();

      if (response.ok) {
        setCertificates(data);
      }
    } catch (error) {
      console.error(
        "Certificate loading error:",
        error
      );
    }
  };

  // ================================
  // Add Skill
  // ================================

  const handleAddSkill = async () => {
    const trimmedSkill = newSkill.trim();

    if (!trimmedSkill) {
      setError("Please enter a skill.");
      return;
    }

    if (
      skills.some(
        (skill) =>
          skill.toLowerCase() ===
          trimmedSkill.toLowerCase()
      )
    ) {
      setError("This skill is already added.");
      return;
    }

    const updatedSkills = [
      ...skills,
      trimmedSkill
    ];

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/profile/${email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: student?.name || "",
            department:
              student?.department || "",
            year: student?.year || "",
            skills: updatedSkills,
            bio: student?.bio || ""
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSkills(updatedSkills);
        setStudent(data.student || data);
        setNewSkill("");
        setError("");
        setMessage("Skill added successfully.");

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setError(
          data.message || "Failed to add skill."
        );
      }
    } catch (error) {
      console.error("Add skill error:", error);
      setError("Unable to add skill.");
    }
  };

  // ================================
  // Delete Skill
  // ================================

  const handleDeleteSkill = async (skillToDelete) => {
    const updatedSkills = skills.filter(
      (skill) => skill !== skillToDelete
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/profile/${email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: student?.name || "",
            department:
              student?.department || "",
            year: student?.year || "",
            skills: updatedSkills,
            bio: student?.bio || ""
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSkills(updatedSkills);
        setStudent(data.student || data);
        setMessage("Skill removed successfully.");

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setError(
          data.message || "Failed to remove skill."
        );
      }
    } catch (error) {
      console.error(
        "Delete skill error:",
        error
      );

      setError("Unable to remove skill.");
    }
  };

  // ================================
  // Certificate File Selection
  // ================================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setCertificateFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      event.target.value = "";
      setCertificateFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Certificate file must be less than 5 MB."
      );

      event.target.value = "";
      setCertificateFile(null);
      return;
    }

    setError("");
    setCertificateFile(file);
  };

  // ================================
  // Upload Certificate
  // ================================

  const handleUploadCertificate = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !certificateSkill ||
      !certificateName.trim() ||
      !organization.trim() ||
      !completionDate ||
      !certificateFile
    ) {
      setError(
        "Please fill in all certificate details."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "studentEmail",
      email
    );

    formData.append(
      "skill",
      certificateSkill
    );

    formData.append(
      "certificateName",
      certificateName.trim()
    );

    formData.append(
      "organization",
      organization.trim()
    );

    formData.append(
      "completionDate",
      completionDate
    );

    formData.append(
      "certificate",
      certificateFile
    );

    try {
      const response = await fetch(
        "http://localhost:5000/api/certificates/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Certificate uploaded successfully."
        );

        setCertificateSkill("");
        setCertificateName("");
        setOrganization("");
        setCompletionDate("");
        setCertificateFile(null);

        const fileInput =
          document.getElementById(
            "certificateFile"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        setShowCertificateForm(false);

        loadCertificates();

        setTimeout(() => {
          setMessage("");
        }, 2500);
      } else {
        setError(
          data.message ||
            "Failed to upload certificate."
        );
      }
    } catch (error) {
      console.error(
        "Certificate upload error:",
        error
      );

      setError(
        "Unable to upload certificate."
      );
    }
  };

  // ================================
  // Delete Certificate
  // ================================

  const handleDeleteCertificate = async (
    certificateId
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this certificate?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/${certificateId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedCertificate(null);

        setMessage(
          "Certificate deleted successfully."
        );

        loadCertificates();

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setError(
          data.message ||
            "Failed to delete certificate."
        );
      }
    } catch (error) {
      console.error(
        "Delete certificate error:",
        error
      );

      setError(
        "Unable to delete certificate."
      );
    }
  };

  // ================================
  // View Certificate Popup
  // ================================

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  // ================================
  // Close Certificate Popup
  // ================================

  const closeCertificatePopup = () => {
    setSelectedCertificate(null);
  };

  // ================================
  // Close Popup When Clicking Outside
  // ================================

  const handlePopupBackgroundClick = (event) => {
    if (
      event.target === event.currentTarget
    ) {
      closeCertificatePopup();
    }
  };

  // ================================
  // Format Date
  // ================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  return (
    <div className="skills-page">

      {/* ================================
          Header
      ================================= */}

      <header className="skills-header">

        <button
          className="dashboard-link"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Dashboard
        </button>

        <h1>
          Skills & Certifications
        </h1>

      </header>

      {/* ================================
          Main Content
      ================================= */}

      <main className="skills-container">

        {/* Messages */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ================================
            Skills Section
        ================================= */}

        <section className="skills-card">

          <div className="section-heading">

            <div className="section-icon">
              💡
            </div>

            <div>
              <h2>My Skills</h2>

              <p>
                Add the technical skills you
                have learned and developed.
              </p>
            </div>

          </div>

          <div className="add-skill-area">

            <input
              type="text"
              value={newSkill}
              onChange={(event) =>
                setNewSkill(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddSkill();
                }
              }}
              placeholder="Enter a skill"
            />

            <button
              type="button"
              onClick={handleAddSkill}
            >
              + Add Skill
            </button>

          </div>

          <div className="skills-list">

            {skills.length === 0 ? (
              <p className="empty-text">
                No skills added yet.
              </p>
            ) : (
              skills.map((skill, index) => (
                <div
                  className="skill-tag"
                  key={index}
                >
                  <span>{skill}</span>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteSkill(
                        skill
                      )
                    }
                    title="Remove skill"
                  >
                    ×
                  </button>
                </div>
              ))
            )}

          </div>

        </section>

        {/* ================================
            Certificates Section
        ================================= */}

        <section className="certificates-card">

          <div className="certificates-heading">

            <div className="certificate-title-area">

              <div className="certificate-icon">
                🏆
              </div>

              <div>
                <h2>
                  My Certificates
                </h2>

                <p>
                  Upload certificates that prove
                  your skills and achievements.
                </p>
              </div>

            </div>

            <button
              type="button"
              className="add-certificate-button"
              onClick={() =>
                setShowCertificateForm(
                  !showCertificateForm
                )
              }
            >
              + Add Certificate
            </button>

          </div>

          {/* ================================
              Certificate Form
          ================================= */}

          {showCertificateForm && (
            <form
              className="certificate-form"
              onSubmit={
                handleUploadCertificate
              }
            >

              <div className="form-row">

                <div className="form-group">
                  <label>
                    Skill
                  </label>

                  <select
                    value={certificateSkill}
                    onChange={(event) =>
                      setCertificateSkill(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select a skill
                    </option>

                    {skills.map(
                      (skill, index) => (
                        <option
                          key={index}
                          value={skill}
                        >
                          {skill}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Certificate Name
                  </label>

                  <input
                    type="text"
                    value={certificateName}
                    onChange={(event) =>
                      setCertificateName(
                        event.target.value
                      )
                    }
                    placeholder="Example: HTML Course Completion"
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>
                    Issued By
                  </label>

                  <input
                    type="text"
                    value={organization}
                    onChange={(event) =>
                      setOrganization(
                        event.target.value
                      )
                    }
                    placeholder="Example: Infosys"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Completion Date
                  </label>

                  <input
                    type="date"
                    value={completionDate}
                    onChange={(event) =>
                      setCompletionDate(
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>

              <div className="form-group">

                <label>
                  Certificate File
                </label>

                <div className="upload-box">

                  <input
                    id="certificateFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleFileChange
                    }
                  />

                  <p>
                    PDF, JPG, JPEG or PNG
                  </p>

                  <small>
                    Maximum file size: 5 MB
                  </small>

                </div>

              </div>

              <div className="certificate-form-actions">

                <button
                  type="submit"
                  className="upload-certificate-button"
                >
                  Upload Certificate
                </button>

                <button
                  type="button"
                  className="cancel-certificate-button"
                  onClick={() =>
                    setShowCertificateForm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

          {/* ================================
              Certificate List
          ================================= */}

          <div className="certificate-list">

            {certificates.length === 0 ? (
              <div className="empty-certificates">

                <div>
                  🏆
                </div>

                <h3>
                  No certificates yet
                </h3>

                <p>
                  Add certificates to prove
                  your skills and achievements.
                </p>

              </div>
            ) : (
              certificates.map(
                (certificate) => (
                  <div
                    className="certificate-item"
                    key={certificate._id}
                  >

                    <div className="certificate-information">

                      <span className="certificate-skill">
                        {certificate.skill}
                      </span>

                      <h3>
                        {certificate.certificateName}
                      </h3>

                      <p>
                        Issued by:{" "}
                        <strong>
                          {certificate.organization}
                        </strong>
                      </p>

                      <p>
                        Completed:{" "}
                        {formatDate(
                          certificate.completionDate
                        )}
                      </p>

                    </div>

                    {/* ================================
                        Actions
                    ================================= */}

                    <div className="certificate-actions">

                      <button
                        type="button"
                        className="view-certificate-button"
                        onClick={() =>
                          handleViewCertificate(
                            certificate
                          )
                        }
                      >
                        👁 View Certificate
                      </button>

                      <button
                        type="button"
                        className="delete-certificate-button"
                        onClick={() =>
                          handleDeleteCertificate(
                            certificate._id
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </section>

      </main>

      {/* =========================================
          Certificate Popup
      ========================================= */}

      {selectedCertificate && (
        <div
          className="certificate-modal-overlay"
          onClick={
            handlePopupBackgroundClick
          }
        >

          <div className="certificate-modal">

            {/* Modal Header */}

            <div className="certificate-modal-header">

              <div>
                <h2>
                  {selectedCertificate.certificateName}
                </h2>

                <p>
                  Issued by:{" "}
                  <strong>
                    {selectedCertificate.organization}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="certificate-close-button"
                onClick={
                  closeCertificatePopup
                }
                aria-label="Close certificate"
              >
                ×
              </button>

            </div>

            {/* Certificate Content */}

            <div className="certificate-modal-content">

              {selectedCertificate.certificateFile
                .toLowerCase()
                .endsWith(".pdf") ? (
                <iframe
                  className="certificate-pdf"
                  src={`http://localhost:5000${selectedCertificate.certificateFile}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={
                    selectedCertificate.certificateName
                  }
                />
              ) : (
                <img
                  className="certificate-image"
                  src={`http://localhost:5000${selectedCertificate.certificateFile}`}
                  alt={
                    selectedCertificate.certificateName
                  }
                />
              )}

            </div>

            {/* Modal Footer */}

            <div className="certificate-modal-footer">

              <span>
                Completed:{" "}
                {formatDate(
                  selectedCertificate.completionDate
                )}
              </span>

              <button
                type="button"
                className="modal-close-button"
                onClick={
                  closeCertificatePopup
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Skills;

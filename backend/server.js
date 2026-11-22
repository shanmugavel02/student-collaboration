
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Student = require("./models/Student");
const Project = require("./models/Project");
const Application = require("./models/Application");
const Certificate = require("./models/Certificate");

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// UPLOAD FOLDER
// ==========================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Make uploaded files publicly accessible
app.use("/uploads", express.static(uploadFolder));

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      extension;

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: function (req, file, cb) {

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF, JPG, JPEG and PNG files are allowed."
        )
      );
    }
  }
});

// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
  .connect("mongodb://127.0.0.1:27017/studentCollaboration")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("Student Collaboration Backend is Running");
});

// ==========================================
// REGISTER STUDENT
// ==========================================

app.post("/api/students/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      year
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !year
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields"
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingStudent =
      await Student.findOne({
        email: normalizedEmail
      });

    if (existingStudent) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const student = new Student({
      name,
      email: normalizedEmail,
      password,
      department,
      year,
      skills: [],
      bio: ""
    });

    await student.save();

    res.status(201).json({
      message: "Student registered successfully"
    });

  } catch (error) {

    console.error(
      "Registration Error:",
      error
    );

    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// ==========================================
// LOGIN STUDENT
// ==========================================

app.post("/api/students/login", async (req, res) => {
  try {

    const {
      email,
      password
    } = req.body;

    const student = await Student.findOne({
      email: email.trim().toLowerCase()
    });

    if (!student) {
      return res.status(404).json({
        message: "Email not registered"
      });
    }

    if (student.password !== password) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    res.status(200).json({
      message: "Login successful",

      student: {
        name: student.name,
        email: student.email,
        department: student.department,
        year: student.year
      }
    });

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// ==========================================
// GET STUDENT PROFILE
// ==========================================

app.get(
  "/api/students/profile/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const student =
        await Student.findOne({
          email
        }).select("-password");

      if (!student) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      res.status(200).json(student);

    } catch (error) {

      console.error(
        "Profile Error:",
        error
      );

      res.status(500).json({
        message: "Failed to get profile",
        error: error.message
      });
    }
  }
);

// ==========================================
// UPDATE STUDENT PROFILE
// ==========================================

app.put(
  "/api/students/profile/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const {
        name,
        department,
        year,
        skills,
        bio
      } = req.body;

      const student =
        await Student.findOne({
          email
        });

      if (!student) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      student.name = name;
      student.department = department;
      student.year = year;

      student.skills =
        Array.isArray(skills)
          ? skills
          : [];

      student.bio =
        typeof bio === "string"
          ? bio
          : "";

      await student.save();

      const updatedStudent =
        await Student.findOne({
          email
        }).select("-password");

      res.status(200).json({
        message:
          "Profile updated successfully",

        student: updatedStudent
      });

    } catch (error) {

      console.error(
        "Update Profile Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update profile",

        error: error.message
      });
    }
  }
);

// ==========================================
// CREATE PROJECT OPPORTUNITY
// ==========================================

app.post(
  "/api/projects/create",
  async (req, res) => {

    try {

      const {
        projectName,
        description,
        domain,
        programmingLanguage,
        aiTools,
        requiredSkills,
        teamSize,
        membersNeeded,
        projectCode,
        contactEmail,
        contactPhone,
        recruitmentMessage,
        ownerEmail
      } = req.body;

      if (
        !projectName ||
        !domain ||
        !programmingLanguage ||
        !teamSize ||
        !membersNeeded ||
        !projectCode ||
        !contactEmail ||
        !contactPhone ||
        !ownerEmail
      ) {

        return res.status(400).json({
          message:
            "Please fill in all required fields"
        });
      }

      const existingProject =
        await Project.findOne({
          projectCode:
            projectCode
              .trim()
              .toUpperCase()
        });

      if (existingProject) {

        return res.status(400).json({
          message:
            "Project code already exists. Please use another code."
        });
      }

      const project = new Project({

        projectName:
          projectName.trim(),

        description:
          description || "",

        domain:
          domain.trim(),

        programmingLanguage:
          programmingLanguage.trim(),

        aiTools:
          Array.isArray(aiTools)
            ? aiTools
            : [],

        requiredSkills:
          Array.isArray(requiredSkills)
            ? requiredSkills
            : [],

        teamSize:
          Number(teamSize),

        membersNeeded:
          Number(membersNeeded),

        projectCode:
          projectCode
            .trim()
            .toUpperCase(),

        contactEmail:
          contactEmail
            .trim()
            .toLowerCase(),

        contactPhone:
          contactPhone.trim(),

        recruitmentMessage:
          recruitmentMessage || "",

        ownerEmail:
          ownerEmail
            .trim()
            .toLowerCase()
      });

      await project.save();

      res.status(201).json({
        message:
          "Project opportunity created successfully",

        project
      });

    } catch (error) {

      console.error(
        "Create Project Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to create project",

        error: error.message
      });
    }
  }
);

// ==========================================
// GET MY PROJECTS
// ==========================================

app.get(
  "/api/projects/my/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const projects =
        await Project.find({
          ownerEmail: email
        }).sort({
          createdAt: -1
        });

      res.status(200).json(projects);

    } catch (error) {

      console.error(
        "Get My Projects Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get projects",

        error: error.message
      });
    }
  }
);

// ==========================================
// GET ALL PROJECTS
// ==========================================

app.get(
  "/api/projects/all",
  async (req, res) => {

    try {

      const projects =
        await Project.find()
          .sort({
            createdAt: -1
          });

      res.status(200).json(projects);

    } catch (error) {

      console.error(
        "Get All Projects Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get all projects",

        error: error.message
      });
    }
  }
);

// ==========================================
// GET PUBLIC PROJECT OPPORTUNITIES
// ==========================================

app.get(
  "/api/projects/opportunities",
  async (req, res) => {

    try {

      const projects =
        await Project.find(
          {},
          {
            projectCode: 1,
            domain: 1,
            programmingLanguage: 1,
            aiTools: 1,
            requiredSkills: 1,
            teamSize: 1,
            membersNeeded: 1,
            recruitmentMessage: 1,
            contactEmail: 1,
            contactPhone: 1,
            ownerEmail: 1,
            createdAt: 1
          }
        ).sort({
          createdAt: -1
        });

      res.status(200).json(projects);

    } catch (error) {

      console.error(
        "Get Public Opportunities Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to load project opportunities"
      });
    }
  }
);

// ==========================================
// APPLY TO PROJECT
// ==========================================

app.post(
  "/api/applications/apply",
  async (req, res) => {

    try {

      const {
        projectId,
        applicantEmail,
        message
      } = req.body;

      if (
        !projectId ||
        !applicantEmail
      ) {

        return res.status(400).json({
          message:
            "Project ID and applicant email are required"
        });
      }

      const email =
        applicantEmail
          .trim()
          .toLowerCase();

      if (
        !mongoose.isValidObjectId(
          projectId
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid project ID"
        });
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {

        return res.status(404).json({
          message:
            "Project not found"
        });
      }

      if (
        project.ownerEmail
          .trim()
          .toLowerCase() === email
      ) {

        return res.status(400).json({
          message:
            "You cannot apply to your own project"
        });
      }

      const existingApplication =
        await Application.findOne({
          projectId,
          applicantEmail: email
        });

      if (existingApplication) {

        return res.status(400).json({
          message:
            "You have already applied to this project"
        });
      }

      const application =
        new Application({

          projectId:
            project._id,

          projectName:
            project.projectName,

          projectCode:
            project.projectCode,

          applicantEmail:
            email,

          ownerEmail:
            project.ownerEmail
              .trim()
              .toLowerCase(),

          message:
            message || "",

          status:
            "Pending"
        });

      await application.save();

      res.status(201).json({
        message:
          "Application submitted successfully",

        application
      });

    } catch (error) {

      if (error.code === 11000) {

        return res.status(400).json({
          message:
            "You have already applied to this project"
        });
      }

      console.error(
        "Apply to Project Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to submit application",

        error: error.message
      });
    }
  }
);

// ==========================================
// GET MY APPLICATIONS
// ==========================================

app.get(
  "/api/applications/my/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const applications =
        await Application.find({
          applicantEmail: email
        }).sort({
          createdAt: -1
        });

      res.status(200).json(
        applications
      );

    } catch (error) {

      console.error(
        "Get My Applications Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch applications",

        error: error.message
      });
    }
  }
);

// ==========================================
// GET RECEIVED APPLICATIONS
// ==========================================

app.get(
  "/api/applications/received/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const applications =
        await Application.find({
          ownerEmail: email
        }).sort({
          createdAt: -1
        });

      res.status(200).json(
        applications
      );

    } catch (error) {

      console.error(
        "Get Received Applications Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch received applications",

        error: error.message
      });
    }
  }
);

// ==========================================
// ACCEPT OR REJECT APPLICATION
// ==========================================

app.put(
  "/api/applications/:id/status",
  async (req, res) => {

    try {

      const {
        status,
        ownerEmail
      } = req.body;

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid application ID"
        });
      }

      if (!ownerEmail) {

        return res.status(400).json({
          message:
            "Owner email is required"
        });
      }

      if (
        !["Accepted", "Rejected"]
          .includes(status)
      ) {

        return res.status(400).json({
          message:
            "Status must be Accepted or Rejected"
        });
      }

      const email =
        ownerEmail
          .trim()
          .toLowerCase();

      const application =
        await Application.findById(
          req.params.id
        );

      if (!application) {

        return res.status(404).json({
          message:
            "Application not found"
        });
      }

      const project =
        await Project.findById(
          application.projectId
        );

      if (
        !project ||
        project.ownerEmail
          .trim()
          .toLowerCase() !== email ||
        application.ownerEmail
          .trim()
          .toLowerCase() !== email
      ) {

        return res.status(403).json({
          message:
            "You cannot manage applications for this project"
        });
      }

      application.status =
        status;

      await application.save();

      res.status(200).json({
        message:
          `Application ${status.toLowerCase()} successfully`,

        application
      });

    } catch (error) {

      console.error(
        "Update Application Status Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update application status",

        error: error.message
      });
    }
  }
);

// ==========================================
// UPLOAD CERTIFICATE
// ==========================================

app.post(
  "/api/certificates/upload",
  upload.single("certificate"),
  async (req, res) => {

    try {

      const {
        studentEmail,
        skill,
        certificateName,
        organization,
        completionDate
      } = req.body;

      if (
        !studentEmail ||
        !skill ||
        !certificateName ||
        !organization ||
        !completionDate
      ) {

        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "Please fill in all certificate details"
        });
      }

      if (!req.file) {

        return res.status(400).json({
          message:
            "Please upload a certificate"
        });
      }

      const email =
        studentEmail
          .trim()
          .toLowerCase();

      const student =
        await Student.findOne({
          email
        });

      if (!student) {

        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          message:
            "Student not found"
        });
      }

      const certificate =
        new Certificate({

          studentEmail:
            email,

          skill:
            skill.trim(),

          certificateName:
            certificateName.trim(),

          organization:
            organization.trim(),

          completionDate:
            new Date(completionDate),

          certificateFile:
            `/uploads/${req.file.filename}`
        });

      await certificate.save();

      res.status(201).json({
        message:
          "Certificate uploaded successfully",

        certificate
      });

    } catch (error) {

      if (req.file) {

        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch (fileError) {
          console.log(
            "File cleanup error:",
            fileError
          );
        }
      }

      console.error(
        "Certificate Upload Error:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Failed to upload certificate"
      });
    }
  }
);

// ==========================================
// GET STUDENT CERTIFICATES
// ==========================================

app.get(
  "/api/certificates/:email",
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      const certificates =
        await Certificate.find({
          studentEmail: email
        }).sort({
          createdAt: -1
        });

      res.status(200).json(
        certificates
      );

    } catch (error) {

      console.error(
        "Get Certificates Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get certificates",

        error: error.message
      });
    }
  }
);

// ==========================================
// DELETE CERTIFICATE
// ==========================================

app.delete(
  "/api/certificates/:id",
  async (req, res) => {

    try {

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid certificate ID"
        });
      }

      const certificate =
        await Certificate.findById(
          req.params.id
        );

      if (!certificate) {

        return res.status(404).json({
          message:
            "Certificate not found"
        });
      }

      const filePath =
        path.join(
          __dirname,
          certificate.certificateFile
            .replace("/uploads/", "uploads/")
        );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await Certificate.findByIdAndDelete(
        req.params.id
      );

      res.status(200).json({
        message:
          "Certificate deleted successfully"
      });

    } catch (error) {

      console.error(
        "Delete Certificate Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete certificate",

        error: error.message
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Student = require("./models/Student");
const Project = require("./models/Project");
const Application = require("./models/Application");
const Certificate = require("./models/Certificate");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
  .connect(process.env.MONGO_URI)
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

   
const hashedPassword = await bcrypt.hash(password, 10);

const student = new Student({
  name,
  email: normalizedEmail,
  password: hashedPassword,
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

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        studentId: student._id,
        email: student.email
      },
      "student_collaboration_secret_key",
      {
        expiresIn: "1d"
      }
    );

    // Send token to frontend
    res.status(200).json({
      message: "Login successful",

      token: token,

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
// FORGOT PASSWORD - SEND OTP
// ==========================================

app.post(
  "/api/students/forgot-password",
  async (req, res) => {

    try {

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required"
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const student =
        await Student.findOne({
          email: normalizedEmail
        });

      if (!student) {
        return res.status(404).json({
          message: "Email is not registered"
        });
      }

      // Generate 6-digit OTP
      const otp =
        Math.floor(
          100000 +
          Math.random() * 900000
        ).toString();

      // OTP expires after 5 minutes
      const otpExpires =
        new Date(
          Date.now() + 5 * 60 * 1000
        );

      student.resetOTP = otp;
      student.resetOTPExpires = otpExpires;
      student.resetOTPAttempts = 0;

      await student.save();

      // Send OTP email
      await emailTransporter.sendMail({
        from: `"Student Collaboration" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "Student Collaboration - Password Reset OTP",
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 25px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
          ">

            <h2 style="color: #2563eb;">
              Student Collaboration
            </h2>

            <p>
              Hello ${student.name},
            </p>

            <p>
              We received a request to reset your password.
            </p>

            <p>
              Your password reset OTP is:
            </p>

            <div style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 15px;
              text-align: center;
              background: #f1f5f9;
              border-radius: 8px;
              color: #1e293b;
            ">
              ${otp}
            </div>

            <p>
              This OTP will expire in
              <strong>5 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <hr>

            <p style="color: #64748b; font-size: 13px;">
              Student Skill & Project Collaboration Platform
            </p>

          </div>
        `
      });

      res.status(200).json({
        message:
          "OTP sent successfully to your registered email"
      });

    } catch (error) {

      console.error(
        "Forgot Password Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send OTP",
        error: error.message
      });

    }

  }
);

// ==========================================
// VERIFY PASSWORD RESET OTP
// ==========================================

app.post(
  "/api/students/verify-otp",
  async (req, res) => {

    try {

      const {
        email,
        otp
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message:
            "Email and OTP are required"
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const student =
        await Student.findOne({
          email: normalizedEmail
        });

      if (!student) {
        return res.status(404).json({
          message:
            "Email is not registered"
        });
      }

      // Check maximum attempts
      if (
        student.resetOTPAttempts >= 5
      ) {

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new OTP."
        });

      }

      // Check whether OTP exists
      if (!student.resetOTP) {

        return res.status(400).json({
          message:
            "No OTP found. Please request a new OTP."
        });

      }

      // Check OTP expiry
      if (
        !student.resetOTPExpires ||
        new Date() >
          student.resetOTPExpires
      ) {

        student.resetOTP = null;
        student.resetOTPExpires = null;
        student.resetOTPAttempts = 0;

        await student.save();

        return res.status(400).json({
          message:
            "OTP has expired. Please request a new OTP."
        });

      }

      // Check OTP
      if (
        student.resetOTP !==
        otp.trim()
      ) {

        student.resetOTPAttempts += 1;

        await student.save();

        const remainingAttempts =
          5 -
          student.resetOTPAttempts;

        return res.status(400).json({
          message:
            remainingAttempts > 0
              ? `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`
              : "Too many incorrect attempts. Please request a new OTP."
        });

      }

      // OTP is correct
      res.status(200).json({
        message:
          "OTP verified successfully"
      });

    } catch (error) {

      console.error(
        "OTP Verification Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to verify OTP",
        error: error.message
      });

    }

  }
);


// ==========================================
// RESET PASSWORD
// ==========================================

app.post(
  "/api/students/reset-password",
  async (req, res) => {

    try {

      const {
        email,
        otp,
        newPassword
      } = req.body;

      if (
        !email ||
        !otp ||
        !newPassword
      ) {

        return res.status(400).json({
          message:
            "Email, OTP and new password are required"
        });

      }

      if (
        newPassword.length < 6
      ) {

        return res.status(400).json({
          message:
            "Password must be at least 6 characters"
        });

      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const student =
        await Student.findOne({
          email: normalizedEmail
        });

      if (!student) {

        return res.status(404).json({
          message:
            "Email is not registered"
        });

      }

      // Check OTP attempts
      if (
        student.resetOTPAttempts >= 5
      ) {

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new OTP."
        });

      }

      // Check OTP exists
      if (!student.resetOTP) {

        return res.status(400).json({
          message:
            "No OTP found. Please request a new OTP."
        });

      }

      // Check OTP expiry
      if (
        !student.resetOTPExpires ||
        new Date() >
          student.resetOTPExpires
      ) {

        student.resetOTP = null;
        student.resetOTPExpires = null;
        student.resetOTPAttempts = 0;

        await student.save();

        return res.status(400).json({
          message:
            "OTP has expired. Please request a new OTP."
        });

      }

      // Check OTP
      if (
        student.resetOTP !==
        otp.trim()
      ) {

        student.resetOTPAttempts += 1;

        await student.save();

        return res.status(400).json({
          message:
            "Incorrect OTP"
        });

      }

      // Hash the new password
      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      student.password =
        hashedPassword;

      // Clear OTP after successful reset
      student.resetOTP = null;
      student.resetOTPExpires = null;
      student.resetOTPAttempts = 0;

      await student.save();

      res.status(200).json({
        message:
          "Password changed successfully"
      });

    } catch (error) {

      console.error(
        "Reset Password Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to reset password",
        error: error.message
      });

    }

  }
);



// ==========================================
// GET STUDENT PROFILE
// ==========================================

app.get(
  "/api/students/profile/:email",
  authMiddleware,
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // ==========================================
      // SECURITY CHECK
      // Logged-in student can view only
      // their own profile
      // ==========================================

      if (
        !req.student ||
        req.student.email !== email
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this profile"
        });
      }

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
  authMiddleware,
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // ==========================================
      // SECURITY CHECK
      // Logged-in student can update only
      // their own profile
      // ==========================================

      if (
        !req.student ||
        req.student.email !== email
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to update this profile"
        });
      }

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
  authMiddleware,
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
        recruitmentMessage
      } = req.body;

      // Get owner email from JWT
      // instead of trusting the request body
      const ownerEmail =
        req.student.email
          .trim()
          .toLowerCase();

      if (
        !projectName ||
        !domain ||
        !programmingLanguage ||
        !teamSize ||
        !membersNeeded ||
        !projectCode ||
        !contactEmail ||
        !contactPhone
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

        // IMPORTANT:
        // Owner is always the logged-in student
        ownerEmail:
          ownerEmail
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
  authMiddleware,
  async (req, res) => {
    try {
      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // Make sure the requested email belongs
      // to the currently logged-in student
      if (
        !req.student ||
        req.student.email !== email
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view these projects"
        });
      }

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
// GET SINGLE PROJECT BY ID
// ==========================================

app.get(
  "/api/projects/:projectId",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: "Invalid project ID"
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found"
        });
      }

      res.status(200).json(project);

    } catch (error) {
      console.error(
        "Get Project Error:",
        error
      );

      res.status(500).json({
        message: "Failed to get project",
        error: error.message
      });
    }
  }
);


// ==========================================
// APPLY TO PROJECT
// ==========================================

app.post(
  "/api/applications/apply",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        projectId,
        message
      } = req.body;

      // Get applicant email from JWT
      // instead of trusting the frontend
      const applicantEmail =
        req.student.email
          .trim()
          .toLowerCase();

      if (!projectId) {

        return res.status(400).json({
          message:
            "Project ID is required"
        });
      }

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
          .toLowerCase() === applicantEmail
      ) {

        return res.status(400).json({
          message:
            "You cannot apply to your own project"
        });
      }

      const existingApplication =
        await Application.findOne({
          projectId,
          applicantEmail
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

          // Applicant is always the
          // currently logged-in student
          applicantEmail:
            applicantEmail,

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
  authMiddleware,
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // Make sure the logged-in student
      // can view only their own applications
      if (
        !req.student ||
        req.student.email !== email
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view these applications"
        });
      }

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

 id="v3k8np"
// ==========================================
// GET RECEIVED APPLICATIONS
// ==========================================

app.get(
  "/api/applications/received/:email",
  authMiddleware,
  async (req, res) => {

    try {

      // Get the logged-in student's email
      // directly from the JWT
      const loggedInEmail =
        req.student.email
          .trim()
          .toLowerCase();

      const requestedEmail =
        req.params.email
          .trim()
          .toLowerCase();

      // Make sure the requested email
      // belongs to the logged-in student
      if (
        requestedEmail !== loggedInEmail
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view these applications"
        });
      }

      const applications =
        await Application.find({
          ownerEmail: loggedInEmail
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
  authMiddleware,
  async (req, res) => {

    try {

      const {
        status
      } = req.body;

      // Validate application ID
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

      // Validate status
      if (
        !["Accepted", "Rejected"]
          .includes(status)
      ) {

        return res.status(400).json({
          message:
            "Status must be Accepted or Rejected"
        });
      }

      // Get logged-in student's email
      // directly from JWT
      const loggedInEmail =
        req.student.email
          .trim()
          .toLowerCase();

      // Find application
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

      // Find the project associated
      // with this application
      const project =
        await Project.findById(
          application.projectId
        );

      if (!project) {

        return res.status(404).json({
          message:
            "Project associated with this application was not found"
        });
      }

      // Verify that the logged-in student
      // actually owns the project
      const projectOwnerEmail =
        project.ownerEmail
          .trim()
          .toLowerCase();

      // Verify that the application
      // belongs to the same project owner
      const applicationOwnerEmail =
        application.ownerEmail
          .trim()
          .toLowerCase();

      if (
        projectOwnerEmail !== loggedInEmail ||
        applicationOwnerEmail !== loggedInEmail ||
        application.projectId.toString() !==
          project._id.toString()
      ) {

        return res.status(403).json({
          message:
            "You cannot manage applications for this project"
        });
      }

      // Update application status
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
  authMiddleware,
  upload.single("certificate"),
  async (req, res) => {

    try {

      const {
        skill,
        certificateName,
        organization,
        completionDate
      } = req.body;

      if (
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

      // ==========================================
      // USE EMAIL FROM VERIFIED JWT
      // NEVER TRUST EMAIL FROM REQUEST BODY
      // ==========================================

      const email =
        req.student.email
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
  authMiddleware,
  async (req, res) => {

    try {

      const email =
        req.params.email
          .trim()
          .toLowerCase();

      // ==========================================
      // SECURITY CHECK
      // Student can view only their own certificates
      // ==========================================

      if (
        !req.student ||
        req.student.email !== email
      ) {

        return res.status(403).json({
          message:
            "You are not authorized to view these certificates"
        });

      }

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
  authMiddleware,
  async (req, res) => {

    try {

      // ==========================================
      // VALIDATE CERTIFICATE ID
      // ==========================================

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

      // ==========================================
      // OWNERSHIP CHECK
      // Student can delete only their own certificate
      // ==========================================

      const loggedInEmail =
        req.student.email
          .trim()
          .toLowerCase();

      if (
        certificate.studentEmail !==
        loggedInEmail
      ) {

        return res.status(403).json({
          message:
            "You are not authorized to delete this certificate"
        });

      }

      // ==========================================
      // DELETE CERTIFICATE FILE
      // ==========================================

      const filePath =
        path.join(
          __dirname,
          certificate.certificateFile
            .replace(
              "/uploads/",
              "uploads/"
            )
        );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // ==========================================
      // DELETE DATABASE RECORD
      // ==========================================

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

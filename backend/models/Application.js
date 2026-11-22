const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    // Keep internally for the owner/application records
    projectName: {
      type: String,
      required: true
    },

    // Public project identifier
    projectCode: {
      type: String,
      required: true
    },

    applicantEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    message: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications to the same project
applicationSchema.index(
  { projectId: 1, applicantEmail: 1 },
  { unique: true }
);

module.exports =
  mongoose.model("Application", applicationSchema);
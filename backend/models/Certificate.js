
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    skill: {
      type: String,
      required: true,
      trim: true
    },

    certificateName: {
      type: String,
      required: true,
      trim: true
    },

    organization: {
      type: String,
      required: true,
      trim: true
    },

    completionDate: {
      type: Date,
      required: true
    },

    certificateFile: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Certificate = mongoose.model(
  "Certificate",
  certificateSchema
);

module.exports = Certificate;
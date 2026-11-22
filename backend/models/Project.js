const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({

  // Keep these fields for existing project functionality
  // The actual project name can remain private from public users.
  projectName: {
    type: String,
    required: true
  },

description: {
  type: String,
  default: ""
},

  // New recruitment fields
  domain: {
    type: String,
    required: true
  },

  programmingLanguage: {
    type: String,
    required: true
  },

  aiTools: {
    type: [String],
    default: []
  },

  requiredSkills: {
    type: [String],
    default: []
  },

  teamSize: {
    type: Number,
    required: true
  },

  membersNeeded: {
    type: Number,
    required: true
  },

  // Unique code shown publicly instead of the real project name
  projectCode: {
    type: String,
    required: true,
    unique: true
  },

  // Contact details for interested students
  contactEmail: {
    type: String,
    required: true
  },

  contactPhone: {
    type: String,
    required: true
  },

  // Short recruitment message
  recruitmentMessage: {
    type: String,
    default: ""
  },

  ownerEmail: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Project = mongoose.model(
  "Project",
  projectSchema
);

module.exports = Project;
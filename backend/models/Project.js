const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({

  projectName: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  requiredSkills: {
    type: [String],
    default: []
  },

  teamSize: {
    type: Number,
    required: true
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
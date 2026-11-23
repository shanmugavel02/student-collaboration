
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true
  },

  year: {
    type: String,
    required: true
  },

  skills: {
    type: [String],
    default: []
  },

  bio: {
    type: String,
    default: ""
  },

  resetOTP: {
    type: String,
    default: null
  },

  resetOTPExpires: {
    type: Date,
    default: null
  },

  resetOTPAttempts: {
    type: Number,
    default: 0
  }

});

const Student =
  mongoose.model(
    "Student",
    studentSchema
  );

module.exports = Student;

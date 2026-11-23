
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided."
      });
    }

    // Expected format:
    // Authorization: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token format."
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      "student_collaboration_secret_key"
    );

    // Store decoded student information in request
    req.student = decoded;

    // Continue to the API
    next();

  } catch (error) {
    console.error("JWT Authentication Error:", error);

    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
};

module.exports = authMiddleware;

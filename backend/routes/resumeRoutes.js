// Import necessary modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/userModel");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes"); // Directory to save uploaded resumes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf/; // Only allow PDF files
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

// Route to handle resume upload
router.post("/upload-resume", authenticate, upload.single("resume"), async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Save the file path to the user's profile
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.resumePath = req.file.path; // Assuming a `resumePath` field exists in the User model
    await user.save();
    res.status(200).json({ message: "Resume uploaded successfully" });

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while uploading the resume" });
  }
});

module.exports = router;

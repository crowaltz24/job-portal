const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/job-portal");

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", recommendationRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
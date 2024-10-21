const { spawn } = require("child_process");
const Job = require("../models/jobModel");

exports.recommendJobs = async (req, res) => {
  const { keywords } = req.body;
  const jobs = await Job.find();
  const jobDescriptions = jobs.map((job) => job.description);

  const python = spawn("python3", ["../ai_model/recommendation_model.py"]);

  const inputData = JSON.stringify({
    keywords,
    job_descriptions: jobDescriptions,
  });

  python.stdin.write(inputData);
  python.stdin.end();

  let data = "";
  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });
  python.stdout.on("end", () => {
    const rankedJobs = JSON.parse(data);
    const recommendedJobs = rankedJobs.map(([index]) => jobs[index]);
    res.status(200).json(recommendedJobs);
  });

  python.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
    res.status(500).json({ message: "Error in recommendation system" });
  });
};
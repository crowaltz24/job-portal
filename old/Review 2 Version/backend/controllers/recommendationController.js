const { spawn } = require("child_process");
const Job = require("../models/jobModel");

exports.recommendJobs = async (req, res) => {
  const { keywords } = req.body;
  const jobs = await Job.find().populate("employer", "username");
  const jobDescriptions = jobs.map((job) => job.description);

  const python = spawn('python', ['./ai_model/recommendation_model.py']);

  const inputData = JSON.stringify({
    keywords,
    job_descriptions: jobDescriptions,
  });
  python.stdin.write(inputData);
  python.stdin.end();

  let data = "";
  let errorOccurred = false;

  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });
  
  python.stdout.on("end", () => {
    if (!errorOccurred) {
      try {
        const parsedData = JSON.parse(data);
        console.log("Python output:", parsedData);

        const recommendedJobs = parsedData.map(([index]) => {
          const job = jobs[index];
          return {
            title: job.title,
            employer: job.employer.username,
            descriptionLink: `/job/${job._id}`,
          };
        });
        
        res.status(200).json(recommendedJobs);
      } catch (error) {
        console.error("Error parsing Python output:", error);
        res
          .status(500)
          .json({ message: "Error parsing recommendation response" });
      }
    }
  });


// python error handling
  python.stderr.on("data", (error) => {
    console.error(`Python error: ${error}`);
    if (!errorOccurred) {
      errorOccurred = true;
      res
        .status(500)
        .json({
          message: "Error in recommendation system",
          error: error.toString(),
        });
    }
  });
};
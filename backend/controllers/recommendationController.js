const { spawn } = require("child_process");
const mongoose = require("mongoose");
const path = require("path");
const Job = require("../models/jobModel");
const User = require("../models/userModel");

async function runPythonScript(scriptPath, inputData) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [scriptPath]);
    let data = "";
    let error = "";

    pythonProcess.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      error += chunk.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Python script exited with code ${code}: ${error.trim()}`)
        );
      }

      try {
        // Trim the output to remove any unexpected whitespace or newlines
        const trimmedData = data.trim();
        console.log("Raw Python Output:", trimmedData); // Debugging line
        const parsed = JSON.parse(trimmedData);
        resolve(parsed);
      } catch (parseError) {
        reject(
          new Error(
            `Error parsing Python output: ${parseError.message}, Output: ${data}`
          )
        );
      }
    });

    // Send input data to the Python script
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
  });
}


// Recommendation based on keywords (Search)
exports.recommendJobsFromSearch = async (req, res) => {
  try {
    const { keywords } = req.body;
    const jobs = await Job.find().populate("employer", "username");
    const jobDescriptions = jobs.map((job) => job.description.replace(/\n/g, "\\n"));

    const inputData = { keywords, job_descriptions: jobDescriptions };
    const parsedData = await runPythonScript(
      "./ai_model/search_engine.py",
      inputData
    );

    // Handle empty results
    if (!parsedData || parsedData.length === 0) {
      return res.status(200).json({
        message: "No matching jobs found for the provided keywords.",
        recommendedJobs: [],
      });
    }

    // console.log("Parsed Data:", parsedData);
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
    console.error("Error in recommendJobsFromSearch:", error);
    res.status(500).json({ message: error.message });
  }
};

// Recommendation based on Resume
exports.recommendJobsFromResume = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.resumePath) {
      return res
        .status(404)
        .json({ error: "No resume found for the current user" });
    }

    const resumeFullPath = path.join(__dirname, "../", user.resumePath);

    const jobs = await Job.find().populate("employer", "username");
    if (!jobs.length) {
      return res.status(404).json({ error: "No job listings available." });
    }

    const jobDescriptions = jobs.map(
      (job) => job.description || "Description not available"
    );
    const inputData = {
      resume_path: resumeFullPath,
      job_descriptions: jobDescriptions,
    };

    const rawOutput = await runPythonScript(
      "./ai_model/recommendations.py",
      inputData
    );
    console.log("Raw Python Output:", rawOutput);

    if (!rawOutput || typeof rawOutput !== "string") {
      throw new Error("No output received from the Python script");
    }

    let parsedData;
    try {
      // Remove potential leading/trailing quotes and parse the string
      parsedData = JSON.parse(rawOutput.trim());
    } catch (err) {
      throw new Error(
        `Error parsing Python output: ${err.message}, Output: ${rawOutput}`
      );
    }

    // Handle Python error responses
    if (parsedData.error) {
      return res.status(500).json({ error: parsedData.error });
    }


    const recommendedJobs = parsedData.recommendations
      .map(({ job_id, score }) => {
        const job = jobs.find((j) => j._id.toString() === job_id);
        if (!job) {
          console.error(`Job with ID ${job_id} not found`);
          return null;
        }
        return {
          title: job.title,
          employer: job.employer.username,
          description: job.description || "Description not available",
          matchScore: score,
        };
      })
      .filter(Boolean);

    res.status(200).json(recommendedJobs);
  } catch (error) {
    console.error("Error in recommendJobsFromResume:", error);
    res.status(500).json({ message: error.message });
  }
};

//old browse feature (currently in use but need to update)
exports.recommendJobs = async (req, res) => {
  const { keywords } = req.body;
  const jobs = await Job.find().populate("employer", "username");
  const jobDescriptions = jobs.map((job) => job.description);

  const python = spawn("python", ["./ai_model/recommendation_model.py"]);

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
      res.status(500).json({
        message: "Error in recommendation system",
        error: error.toString(),
      });
    }
  });
};

// console.log("Exporting recommendationController:", module.exports);

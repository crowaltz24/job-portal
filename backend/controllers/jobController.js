const Job = require('../models/jobModel');

exports.postJob = async (req, res) => {
    const { title, description } = req.body;
    
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. User not found.' });
    }

    try {
        const job = new Job({
            title,
            description,
            employer: req.user._id
        });
        await job.save();
        res.status(201).json({ message: 'Job posted successfully!', job });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Server error while posting job.' });
    }
};

exports.getJobDescription = async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId).populate("employer", "username");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({
      title: job.title,
      description: job.description,
      employer: job.employer.username, //employer's username
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
};
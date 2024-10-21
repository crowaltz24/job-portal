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
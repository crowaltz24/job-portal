const express = require('express');
const { postJob } = require('../controllers/jobController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/post-job', authenticate, postJob);

module.exports = router;

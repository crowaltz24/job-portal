const express = require("express");
const { recommendJobs } = require("../controllers/recommendationController");
const router = express.Router();

router.post("/recommend-jobs", recommendJobs);

module.exports = router;

const express = require("express");
const { recommendJobs } = require("../controllers/recommendationController");
const router = express.Router();

router.post("/recommend", recommendJobs);

module.exports = router;

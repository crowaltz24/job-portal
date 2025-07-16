const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
// delete require.cache[require.resolve("../controllers/recommendationController")];
const recommendationController = require("../controllers/recommendationController");
// console.log("recommendationController (after cache clear):", recommendationController);


// router.post("/recommend-jobs", recommendJobs);

// Debugging logs
// console.log("recommendationController loaded");
// console.log(recommendationController);

router.post("/search", authenticate, recommendationController.recommendJobsFromSearch);
router.post("/resume", authenticate, recommendationController.recommendJobsFromResume);

router.get("/search", authenticate, recommendationController.recommendJobsFromSearch);
router.get("/resume", authenticate, recommendationController.recommendJobsFromResume);

module.exports = router;
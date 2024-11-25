// routes/ActivityRoute.js
const express = require("express");
const {
    getActivities
} = require ("../controllers/Activity.js");
const router = express.Router();

// Route to get user activities based on transaction status
router.get('/activities', getActivities);
module.exports = router;

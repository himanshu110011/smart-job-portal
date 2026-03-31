const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getJobApplications } = require('../controllers/jobController');
const { protect, recruiterOnly } = require('../middleware/auth');

router.route('/').post(protect, recruiterOnly, createJob);
router.route('/me').get(protect, recruiterOnly, getMyJobs);
router.route('/:id/applications').get(protect, recruiterOnly, getJobApplications);

module.exports = router;

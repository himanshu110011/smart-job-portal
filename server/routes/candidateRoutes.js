const express = require('express');
const router = express.Router();
const { uploadResume, upload, getRecommendations, applyJob, getMyApplications } = require('../controllers/candidateController');
const { protect, candidateOnly } = require('../middleware/auth');

router.post('/upload', protect, candidateOnly, upload.single('resume'), uploadResume);
router.get('/recommendations', protect, candidateOnly, getRecommendations);
router.post('/apply', protect, candidateOnly, applyJob);
router.get('/applications', protect, candidateOnly, getMyApplications);

module.exports = router;

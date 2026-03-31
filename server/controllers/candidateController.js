const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { parseResumeFile, calculateMatchPercentage } = require('../ai/parser');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: function (req, file, cb) {
        if(file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDFs are allowed'));
        }
        cb(null, true);
    }
});

// @desc    Upload & Parse Resume
// @route   POST /api/candidate/upload
// @access  Private/Candidate
const uploadResume = async (req, res) => {
    try {
        const candidate = await Candidate.findOne({ user: req.user._id });
        if(!candidate) return res.status(404).json({ message: 'Candidate not found' });
        if(!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const parsedData = await parseResumeFile(req.file.path);
        
        candidate.resumeUrl = req.file.path;
        candidate.skills = parsedData.skills;
        await candidate.save();

        res.json({
            message: 'Resume analyzed successfully',
            skills: candidate.skills,
            resumeUrl: candidate.resumeUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI Job Recommendations
// @route   GET /api/candidate/recommendations
// @access  Private/Candidate
const getRecommendations = async (req, res) => {
    try {
        const candidate = await Candidate.findOne({ user: req.user._id });
        if(!candidate || candidate.skills.length === 0) {
            return res.json([]);
        }

        const activeJobs = await Job.find({ isActive: true }).populate('recruiter', 'companyName');
        
        let recommendations = activeJobs.map(job => {
            const matchScore = calculateMatchPercentage(candidate.skills, job.requiredSkills);
            return {
                job,
                matchScore
            };
        });

        // Filter and Sort by highest match > 20%
        recommendations = recommendations
            .filter(r => r.matchScore > 20)
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for a Job
// @route   POST /api/candidate/apply
// @access  Private/Candidate
const applyJob = async (req, res) => {
    const { jobId } = req.body;
    try {
        const candidate = await Candidate.findOne({ user: req.user._id });
        const job = await Job.findById(jobId);

        if(!job || !candidate) return res.status(404).json({ message: 'Entity not found' });

        const exists = await Application.findOne({ candidate: candidate._id, job: job._id });
        if(exists) return res.status(400).json({ message: 'Already applied' });

        const matchScore = calculateMatchPercentage(candidate.skills, job.requiredSkills);

        const application = await Application.create({
            candidate: candidate._id,
            job: job._id,
            matchPercentage: matchScore
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const candidate = await Candidate.findOne({ user: req.user._id });
        const applications = await Application.find({ candidate: candidate._id })
            .populate({ path: 'job', populate: { path: 'recruiter', select: 'companyName' } })
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { uploadResume, upload, getRecommendations, applyJob, getMyApplications };

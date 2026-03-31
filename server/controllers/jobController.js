const Job = require('../models/Job');
const Application = require('../models/Application');
const Recruiter = require('../models/Recruiter');

// @desc    Post a new job
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = async (req, res) => {
  const { title, description, requiredSkills } = req.body;

  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter profile not found' });
    }

    const job = await Job.create({
      recruiter: recruiter._id,
      title,
      description,
      requiredSkills
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs for logged in recruiter
// @route   GET /api/jobs/me
// @access  Private/Recruiter
const getMyJobs = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });
    const jobs = await Job.find({ recruiter: recruiter._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/jobs/:id/applications
// @access  Private/Recruiter
const getJobApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });
    const job = await Job.findOne({ _id: req.params.id, recruiter: recruiter._id });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ job: job._id })
      .populate({ path: 'candidate', populate: { path: 'user', select: 'name email' } })
      .sort({ matchPercentage: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getMyJobs, getJobApplications };

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Rejected', 'Hired'],
    default: 'Pending'
  }
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);

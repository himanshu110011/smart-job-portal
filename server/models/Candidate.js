const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  education: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  resumeUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);

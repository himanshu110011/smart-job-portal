const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Recruiter', recruiterSchema);

const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization / Department name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['upsssc', 'ssc', 'railway', 'police', 'teaching', 'banking', 'defence', 'state_gov', 'admit_card', 'result', 'other'],
    default: 'upsssc'
  },
  totalVacancies: {
    type: String,
    default: 'Various Posts'
  },
  qualification: {
    type: String,
    default: '10th / 12th / Graduate'
  },
  ageLimit: {
    type: String,
    default: '18 - 40 Years'
  },
  applicationFee: {
    type: String,
    default: 'As per Notification'
  },
  lastDate: {
    type: String,
    default: 'Check Notification'
  },
  status: {
    type: String,
    enum: ['active', 'closing_soon', 'expired', 'admit_card_out', 'result_declared'],
    default: 'active'
  },
  officialUrl: {
    type: String,
    default: 'https://upsssc.gov.in'
  },
  description: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: true
  },
  applyViaShreeOnline: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobPosting', JobPostingSchema);

const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  amount: { 
    type: Number, 
    required: true,
    min:[1,'amount must be positif']
  },
  donor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    required: true
  },
  selectedRewardId: {
    type: mongoose.Schema.Types.ObjectId 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending'
  },
  donatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', DonationSchema);
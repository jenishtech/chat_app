const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      votes: [{ type: String }] // array of usernames who voted for this option
    }
  ],
  createdBy: { type: String, required: true },
  group: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  allowMultipleVotes: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  totalVotes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Poll', PollSchema); 
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  members: [String],
  creator: { type: String, required: true }, // Group creator
  admins: [String], // Array of admin usernames
  avatarUrl: { type: String, default: "" },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] // array of pinned message IDs in order
});

module.exports = mongoose.model('Group', GroupSchema);

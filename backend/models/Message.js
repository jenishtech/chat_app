const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: String,
  to: String,        // username if private message, else "All" id it's public message (only if it's not a group message)
  group: String,     // group name if group message, else null
  message: String,
  mediaUrl: String, // URL to uploaded image/video
  mediaType: String, // MIME type (e.g., image/png)
  timestamp: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  seenBy: [String], // usernames who have seen the message
  reactions: [
    {
      username: String,
      emoji: String
    }
  ], // array of { username, emoji }
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, // messageId being replied to
  forwardedFrom: { type: String, default: null }, // username of original sender if forwarded
  pinned: { type: Boolean, default: false }, // whether message is pinned
  pinnedAt: { type: Date, default: null }, // when message was pinned
  pinnedBy: { type: String, default: null }, // who pinned the message
  pinOrder: { type: Number, default: null }, // order in which message was pinned (1 = first, 2 = second, etc.)
  mentions: [String], // array of mentioned usernames (including @all)
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', default: null }, // reference to poll if message contains a poll
  isSystemMessage: { type: Boolean, default: false }, // whether this is a system message (user joined/left)
  isTemporary: { type: Boolean, default: false }, // whether this message will auto-delete
  expiresAt: { type: Date, default: null }, // when the temporary message expires
  expired: { type: Boolean, default: false }, // whether this temporary message has expired
  isViewOnce: { type: Boolean, default: false }, // whether this image is view-once
  viewedBy: [String], // usernames who have viewed the image (for view-once messages)
  isScheduled: { type: Boolean, default: false }, // whether this message is scheduled
  scheduledAt: { type: Date, default: null }, // when the message should be sent
  scheduled: { type: Boolean, default: false }, // whether the message has been scheduled and sent
});

module.exports = mongoose.model('Message', MessageSchema);

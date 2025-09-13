const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Group = require('../models/Group');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 10MB limit
  }
});

// Image upload endpoint
const uploadMedia = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${process.env.SERVER_URL || 'http://localhost:' + process.env.PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, type: req.file.mimetype });
};

// Avatar upload endpoint
const uploadAvatar = async (req, res) => {
  const { username, bio } = req.body;
  if (!req.file || !username) return res.status(400).json({ error: 'No file or username' });
  
  try {
    const fileUrl = `${process.env.SERVER_URL || 'http://localhost:' + process.env.PORT}/uploads/${req.file.filename}`;
    
    // Update user avatarUrl and bio in DB
    const update = { avatarUrl: fileUrl };
    if (bio !== undefined) update.bio = bio;
    await User.updateOne({ username }, update);
    
    // Get updated user
    const user = await User.findOne({ username });
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("user_avatar_updated", { username, avatarUrl: user.avatarUrl, bio: user.bio });
    
    // Emit updated user list to all clients (with bio)
    const userList = await User.find({}, 'username avatarUrl bio');
    io.emit("users_list", userList.map(u => ({ username: u.username, avatarUrl: u.avatarUrl, bio: u.bio })));
    
    res.json({ url: fileUrl, bio: user.bio, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};

// Group avatar upload endpoint
const uploadGroupAvatar = async (req, res) => {
  const { groupName } = req.body;
  if (!req.file || !groupName) return res.status(400).json({ error: 'No file or group name' });
  
  try {
    const fileUrl = `${process.env.SERVER_URL || 'http://localhost:' + process.env.PORT}/uploads/${req.file.filename}`;
    
    // Update group avatarUrl in DB
    await Group.updateOne({ name: groupName }, { avatarUrl: fileUrl });
    
    // Emit update to all clients
    const io = req.app.get('io');
    const groups = await Group.find({});
    io.emit("groups_list", groups);
    
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group avatar' });
  }
};

module.exports = {
  upload,
  uploadMedia,
  uploadAvatar,
  uploadGroupAvatar
}; 
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ msg: 'All fields required' });

    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ msg: 'Username should be unique' });

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'Email already used' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hash });
    res.json({ msg: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Wrong password' });

    res.json({ username: user.username }); // return username for chat
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH: Update user profile (bio, avatarUrl)
router.patch('/update-profile', async (req, res) => {
  try {
    const { username, bio, avatarUrl } = req.body;
    if (!username) return res.status(400).json({ msg: 'Username required' });
    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    const user = await User.findOneAndUpdate({ username }, update, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ username: user.username, bio: user.bio, avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;

const express = require('express');
const router = express.Router();
const { upload, uploadGroupAvatar } = require('../controllers/uploadController');

// Group avatar upload endpoint
router.post('/', upload.single('avatar'), uploadGroupAvatar);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { upload, uploadAvatar } = require('../controllers/uploadController');

// User avatar upload endpoint
router.post('/', upload.single('avatar'), uploadAvatar);

module.exports = router; 
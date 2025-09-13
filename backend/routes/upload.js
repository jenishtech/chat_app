const express = require('express');
const router = express.Router();
const { upload, uploadMedia } = require('../controllers/uploadController');

// General media upload endpoint (matches frontend expectation)
router.post('/', upload.single('media'), uploadMedia);

module.exports = router; 
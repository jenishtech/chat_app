const express = require('express');
const router = express.Router();
const { updateGroupDescription } = require('../controllers/groupController');

// Group description update endpoint
router.patch('/', updateGroupDescription);

module.exports = router; 
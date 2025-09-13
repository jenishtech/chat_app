const express = require('express');
const router = express.Router();
const { updateGroupMembers } = require('../controllers/groupController');

// Group members update endpoint
router.patch('/', updateGroupMembers);

module.exports = router; 
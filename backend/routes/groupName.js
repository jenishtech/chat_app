const express = require('express');
const router = express.Router();
const { updateGroupName } = require('../controllers/groupController');

// Group name update endpoint
router.patch('/', updateGroupName);

module.exports = router; 
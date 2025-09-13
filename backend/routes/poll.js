const express = require('express');
const router = express.Router();
const { getPollsByGroup } = require('../controllers/pollController');

// Get polls for a group
router.get('/:groupName', getPollsByGroup);

module.exports = router; 
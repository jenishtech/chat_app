const express = require('express');
const router = express.Router();
const { leaveGroup } = require('../controllers/groupController');

// Leave group endpoint
router.post('/', leaveGroup);

module.exports = router; 
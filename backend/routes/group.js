const express = require('express');
const router = express.Router();
const {
  deleteGroup,
  addAdmin,
  removeAdmin
} = require('../controllers/groupController');

// Delete group endpoint
router.delete('/', deleteGroup);

// Admin management endpoints
router.post('/admin/add', addAdmin);
router.post('/admin/remove', removeAdmin);

module.exports = router; 
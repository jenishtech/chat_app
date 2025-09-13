const Poll = require('../models/Poll');

// Get polls for a group
const getPollsByGroup = async (req, res) => {
  const { groupName } = req.params;
  
  try {
    const polls = await Poll.find({ group: groupName }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
};

module.exports = {
  getPollsByGroup
}; 
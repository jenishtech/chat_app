const Group = require('../models/Group');
const Message = require('../models/Message');
const Poll = require('../models/Poll');

// Update group description
const updateGroupDescription = async (req, res) => {
  const { groupName, description } = req.body;
  if (!groupName) return res.status(400).json({ error: 'Group name is required' });
  
  try {
    await Group.updateOne({ name: groupName }, { description: description || "" });
    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);
    
    res.json({ success: true, description, groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group description' });
  }
};

// Update group name
const updateGroupName = async (req, res) => {
  const { oldGroupName, newGroupName } = req.body;
  if (!oldGroupName || !newGroupName) return res.status(400).json({ error: 'Both old and new group names are required' });
  
  try {
    // Check if new name already exists
    const existingGroup = await Group.findOne({ name: newGroupName });
    if (existingGroup) {
      return res.status(400).json({ error: 'Group name already exists' });
    }
    
    // Update group name
    await Group.updateOne({ name: oldGroupName }, { name: newGroupName });
    
    // Update all messages that reference this group
    await Message.updateMany({ group: oldGroupName }, { group: newGroupName });
    
    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);
    
    // Emit a specific event for group rename to help frontend handle it
    io.emit("group_renamed", { oldName: oldGroupName, newName: newGroupName });
    
    res.json({ success: true, newGroupName, groups, oldName: oldGroupName });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group name' });
  }
};

// Update group members
const updateGroupMembers = async (req, res) => {
  const { groupName, members } = req.body;
  if (!groupName || !Array.isArray(members)) return res.status(400).json({ error: 'Group name and members array are required' });
  
  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Find new members (users who were added)
    const newMembers = members.filter(member => !group.members.includes(member));
    
    // Update group members
    await Group.updateOne({ name: groupName }, { members });
    
    // Create system messages for new members
    const systemMessages = [];
    for (const newMember of newMembers) {
      const systemMessage = await Message.create({
        sender: "System",
        group: groupName,
        message: `${newMember} was added to the group`,
        timestamp: new Date(),
        isSystemMessage: true
      });
      systemMessages.push(systemMessage);
    }
    
    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);
    
    // Broadcast the system messages to all group members
    const socketController = req.app.get('socketController');
    if (socketController) {
      systemMessages.forEach(systemMessage => {
        Object.entries(socketController.users).forEach(([id, uname]) => {
          if (members.includes(uname)) {
            io.to(id).emit("receive_message", systemMessage);
          }
        });
      });
    }
    
    res.json({ success: true, members, groups, systemMessages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update group members' });
  }
};

// Leave group
const leaveGroup = async (req, res) => {
  const { groupName, username } = req.body;
  if (!groupName || !username) return res.status(400).json({ error: 'Group name and username are required' });
  
  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (!group.members.includes(username)) {
      return res.status(400).json({ error: 'User is not a member of this group' });
    }
    
    // Remove user from group members
    const updatedMembers = group.members.filter(member => member !== username);
    await Group.updateOne({ name: groupName }, { members: updatedMembers });
    
    // Create a system message for user leaving
    const systemMessage = await Message.create({
      sender: "System",
      group: groupName,
      message: `${username} left the group`,
      timestamp: new Date(),
      isSystemMessage: true
    });
    
    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);
    
    // Broadcast the system message to remaining group members
    const socketController = req.app.get('socketController');
    if (socketController) {
      Object.entries(socketController.users).forEach(([id, uname]) => {
        if (updatedMembers.includes(uname)) {
          io.to(id).emit("receive_message", systemMessage);
        }
      });
    }
    
    // Emit a specific event for user leaving group
    io.emit("user_left_group", { groupName, username });
    
    res.json({ success: true, message: 'Left group successfully', groups, systemMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave group' });
  }
};

// Delete group
const deleteGroup = async (req, res) => {
  const { groupName, username } = req.body;
  if (!groupName || !username) return res.status(400).json({ error: 'Group name and username are required' });
  
  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is the creator (only creator can delete group)
    if (group.creator !== username) {
      return res.status(403).json({ error: 'Only the group creator can delete the group' });
    }

    // Delete the group
    await Group.deleteOne({ name: groupName });
    
    // Delete all messages associated with this group
    await Message.deleteMany({ group: groupName });
    
    // Delete all polls associated with this group
    await Poll.deleteMany({ group: groupName });
    
    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);
    
    // Emit a specific event for group deletion to help frontend handle it
    io.emit("group_deleted", { groupName });
    
    res.json({ success: true, message: 'Group deleted successfully', groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
};

// Add admin to group
const addAdmin = async (req, res) => {
  const { groupName, username, targetUser } = req.body;
  if (!groupName || !username || !targetUser) {
    return res.status(400).json({ error: 'Group name, username, and target user are required' });
  }
  
  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin or creator
    if (!group.admins.includes(username) && group.creator !== username) {
      return res.status(403).json({ error: 'Only admins can add other admins' });
    }

    // Check if target user is a member of the group
    if (!group.members.includes(targetUser)) {
      return res.status(400).json({ error: 'User must be a member of the group' });
    }

    // Check if target user is already an admin
    if (group.admins.includes(targetUser)) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    // Add user as admin
    await Group.updateOne(
      { name: groupName },
      { $addToSet: { admins: targetUser } }
    );

    // Create system message
    const systemMessage = await Message.create({
      sender: "System",
      group: groupName,
      message: `${targetUser} was promoted to admin by ${username}`,
      timestamp: new Date(),
      isSystemMessage: true
    });

    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);

    // Broadcast the system message to group members
    const socketController = req.app.get('socketController');
    if (socketController) {
      Object.entries(socketController.users).forEach(([id, uname]) => {
        if (group.members.includes(uname)) {
          io.to(id).emit("receive_message", systemMessage);
        }
      });
    }

    res.json({ success: true, message: `${targetUser} is now an admin`, groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add admin' });
  }
};

// Remove admin from group
const removeAdmin = async (req, res) => {
  const { groupName, username, targetUser } = req.body;
  if (!groupName || !username || !targetUser) {
    return res.status(400).json({ error: 'Group name, username, and target user are required' });
  }
  
  try {
    const group = await Group.findOne({ name: groupName });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is creator (only creator can remove admins)
    if (group.creator !== username) {
      return res.status(403).json({ error: 'Only the group creator can remove admins' });
    }

    // Check if target user is an admin
    if (!group.admins.includes(targetUser)) {
      return res.status(400).json({ error: 'User is not an admin' });
    }

    // Don't allow removing the creator from admins
    if (group.creator === targetUser) {
      return res.status(400).json({ error: 'Cannot remove the group creator from admins' });
    }

    // Remove user from admins
    await Group.updateOne(
      { name: groupName },
      { $pull: { admins: targetUser } }
    );

    // Create system message
    const systemMessage = await Message.create({
      sender: "System",
      group: groupName,
      message: `${targetUser} was removed from admin by ${username}`,
      timestamp: new Date(),
      isSystemMessage: true
    });

    const groups = await Group.find({});
    
    // Emit update to all clients
    const io = req.app.get('io');
    io.emit("groups_list", groups);

    // Broadcast the system message to group members
    const socketController = req.app.get('socketController');
    if (socketController) {
      Object.entries(socketController.users).forEach(([id, uname]) => {
        if (group.members.includes(uname)) {
          io.to(id).emit("receive_message", systemMessage);
        }
      });
    }

    res.json({ success: true, message: `${targetUser} is no longer an admin`, groups });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove admin' });
  }
};

module.exports = {
  updateGroupDescription,
  updateGroupName,
  updateGroupMembers,
  leaveGroup,
  deleteGroup,
  addAdmin,
  removeAdmin
}; 
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const Poll = require('../models/Poll');

class SocketController {
  constructor(io) {
    this.io = io;
    this.users = {}; // socket.id → username
    
    // Start auto-delete for temporary messages every 30 seconds
    this.startTemporaryMessageCleanup();
    
    // Start scheduled message processor every 10 seconds
    this.startScheduledMessageProcessor();
  }
  
  // Auto-delete expired temporary messages
  async deleteExpiredTemporaryMessages() {
    try {
      const now = new Date();
      const expiredMessages = await Message.find({
        isTemporary: true,
        expiresAt: { $lt: now },
        deleted: false
      });

      for (const message of expiredMessages) {
        await Message.updateOne({ _id: message._id }, { deleted: true, expired: true });
        
        // Broadcast expiration to relevant clients
        if (message.group) {
          const group = await Group.findOne({ name: message.group });
          if (group) {
            Object.entries(this.users).forEach(([id, uname]) => {
              if (group.members.includes(uname)) {
                this.io.to(id).emit("message_expired", message._id);
              }
            });
          }
        } else if (message.to && message.to !== "All") {
          const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === message.to);
          const senderSocketId = Object.keys(this.users).find(id => this.users[id] === message.sender);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit("message_expired", message._id);
          }
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("message_expired", message._id);
          }
        } else {
          this.io.emit("message_expired", message._id);
        }
      }
    } catch (error) {
      console.error("Error deleting expired temporary messages:", error);
    }
  }
  
  // Start the cleanup interval
  startTemporaryMessageCleanup() {
    setInterval(() => {
      this.deleteExpiredTemporaryMessages();
    }, 5000); // Run every 5 seconds for more responsive cleanup
  }

  // Process scheduled messages
  async processScheduledMessages() {
    try {
      const now = new Date();
      const scheduledMessages = await Message.find({
        isScheduled: true,
        scheduled: false,
        scheduledAt: { $lte: now }
      });

      for (const message of scheduledMessages) {
        // Mark as sent
        await Message.updateOne({ _id: message._id }, { scheduled: true });
        
        // Send the message to recipients
        if (message.group) {
          const group = await Group.findOne({ name: message.group });
          if (group) {
            Object.entries(this.users).forEach(([id, uname]) => {
              if (group.members.includes(uname)) {
                this.io.to(id).emit("receive_message", message);
              }
            });
          }
        } else if (message.to && message.to !== "All") {
          const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === message.to);
          const senderSocketId = Object.keys(this.users).find(id => this.users[id] === message.sender);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit("receive_message", message);
          }
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("receive_message", message);
            this.io.to(senderSocketId).emit("scheduled_message_sent", { 
              messageId: message._id,
              scheduledAt: message.scheduledAt 
            });
          }
        } else {
          this.io.emit("receive_message", message);
          // Notify sender about scheduled message sent
          const senderSocketId = Object.keys(this.users).find(id => this.users[id] === message.sender);
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("scheduled_message_sent", { 
              messageId: message._id,
              scheduledAt: message.scheduledAt 
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing scheduled messages:", error);
    }
  }

  // Start the scheduled message processor
  startScheduledMessageProcessor() {
    setInterval(() => {
      this.processScheduledMessages();
    }, 10000); // Run every 10 seconds
  }

  // Handle user joining
  async handleJoin(socket, username) {
    this.users[socket.id] = username;

    // Save user to DB if new
    await User.updateOne({ username }, { username }, { upsert: true });

    // Send full user list to everyone (with avatarUrl and bio)
    const userList = await User.find({}, 'username avatarUrl bio');
    this.io.emit("users_list", userList.map(u => ({ username: u.username, avatarUrl: u.avatarUrl, bio: u.bio })));

    // Send list of currently online users
    const onlineUsers = Object.values(this.users);
    this.io.emit("online_users", onlineUsers);

    // Send group list
    const groups = await Group.find({});
    this.io.emit("groups_list", groups);

    // Send last 20 public messages
    const publicMessages = await Message.find({ to: "All" }).sort({ timestamp: -1 }).limit(20);
    socket.emit("receive_message_history", publicMessages.reverse());

    // Private messages
    const privateMessages = await Message.find({
      $or: [{ sender: username }, { to: username }]
    }).sort({ timestamp: 1 });
    socket.emit("receive_private_message_history", privateMessages);

    // Group messages for groups user is in
    const userGroups = groups.filter(g => g.members.includes(username));
    for (const group of userGroups) {
      const groupMessages = await Message.find({ group: group.name }).sort({ timestamp: 1 });
      socket.emit("receive_group_message_history", { group: group.name, messages: groupMessages });
    }
  }

  // Handle group creation
  async handleCreateGroup(socket, group) {
    if (group.name && group.members?.length > 0) {
      const exists = await Group.findOne({ name: group.name });
      if (!exists) {
        // Get the creator (first member in the array)
        const creator = group.members[0];
        
        // Create group with creator and admins (creator is automatically an admin)
        await Group.create({ 
          name: group.name, 
          members: group.members,
          creator: creator,
          admins: [creator] // Creator is automatically an admin
        });
        const groups = await Group.find({});
        this.io.emit("groups_list", groups);
      }
    }
  }

  // Handle message sending
  async handleSendMessage(socket, data) {
    // Support reply and forward fields
    const msgData = { ...data };
    if (data.replyTo) msgData.replyTo = data.replyTo;
    if (data.forwardedFrom) msgData.forwardedFrom = data.forwardedFrom;
    
    // Handle temporary message settings
    if (data.isTemporary && data.expiresIn) {
      msgData.isTemporary = true;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (data.expiresIn * 1000));
      msgData.expiresAt = expiresAt;
    }
    
    // Handle view-once settings (only for images)
    if (data.isViewOnce && data.mediaUrl && data.mediaType && data.mediaType.startsWith("image")) {
      msgData.isViewOnce = true;
    }
    
    // Handle scheduled message settings
    if (data.isScheduled && data.scheduledAt) {
      msgData.isScheduled = true;
      msgData.scheduledAt = new Date(data.scheduledAt);
      msgData.scheduled = false;
    }
    
    // Process mentions for group messages
    if (data.group && data.message) {
      const mentions = [];
      const mentionRegex = /@(\w+)/g;
      let match;
      
      while ((match = mentionRegex.exec(data.message)) !== null) {
        const mentionedUser = match[1];
        if (mentionedUser.toLowerCase() === 'all') {
          mentions.push('@all');
        } else {
          // Check if the mentioned user exists and is a member of the group
          const group = await Group.findOne({ name: data.group });
          if (group && group.members.includes(mentionedUser)) {
            mentions.push(mentionedUser);
          }
        }
      }
      
      if (mentions.length > 0) {
        msgData.mentions = mentions;
      }
    }
    
    const savedMsg = await Message.create(msgData);

    // If it's a scheduled message, don't send immediately
    if (savedMsg.isScheduled && !savedMsg.scheduled) {
      // Send confirmation to sender only
      socket.emit("message_scheduled", { 
        messageId: savedMsg._id, 
        scheduledAt: savedMsg.scheduledAt,
        message: "Message scheduled successfully!"
      });
      return;
    }

    if (data.group) {
      const group = await Group.findOne({ name: data.group });
      if (group) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (group.members.includes(uname)) {
            this.io.to(id).emit("receive_message", savedMsg);
            
            // Send mention notification if user is mentioned
            if (savedMsg.mentions && savedMsg.mentions.includes(uname)) {
              this.io.to(id).emit("mention_notification", {
                message: `${savedMsg.sender} mentioned you in ${data.group}`,
                group: data.group,
                messageId: savedMsg._id
              });
            }
          }
        });
      }
    } else if (data.to && data.to !== "All") {
      // Always save to DB (already done above)
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === data.to);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("receive_message", savedMsg);
      }
      // Always emit to sender so their UI updates
      socket.emit("receive_message", savedMsg);
    } else {
      this.io.emit("receive_message", savedMsg);
    }
  }

  // Handle message deletion
  async handleDeleteMessage(socket, msgId) {
    const msg = await Message.findById(msgId);
    if (!msg) return;
    // Only allow sender to delete their own message
    if (this.users[socket.id] !== msg.sender) return;
    await Message.updateOne({ _id: msgId }, { deleted: true });
    // Broadcast deletion to relevant clients
    if (msg.group) {
      const group = await Group.findOne({ name: msg.group });
      if (group) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (group.members.includes(uname)) {
            this.io.to(id).emit("message_deleted", msgId);
          }
        });
      }
    } else if (msg.to && msg.to !== "All") {
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === msg.to);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("message_deleted", msgId);
        socket.emit("message_deleted", msgId);
      }
    } else {
      this.io.emit("message_deleted", msgId);
    }
  }

  // Handle message editing
  async handleEditMessage(socket, { messageId, newMessage }) {
    console.log("Edit message request:", { messageId, newMessage, sender: this.users[socket.id] });
    
    const msg = await Message.findById(messageId);
    if (!msg) {
      console.log("Message not found:", messageId);
      return;
    }
    
    // Only allow sender to edit their own message
    if (this.users[socket.id] !== msg.sender) {
      console.log("Unauthorized edit attempt:", this.users[socket.id], "trying to edit message from", msg.sender);
      return;
    }
    
    // Don't allow editing deleted messages
    if (msg.deleted) {
      console.log("Attempt to edit deleted message:", messageId);
      return;
    }
    
    console.log("Updating message:", messageId, "with new content:", newMessage);
    
    await Message.updateOne({ _id: messageId }, { 
      message: newMessage,
      edited: true,
      editedAt: new Date()
    });
    
    const updatedMsg = await Message.findById(messageId);
    console.log("Message updated successfully:", updatedMsg._id);
    
    // Broadcast edit to relevant clients
    if (msg.group) {
      const group = await Group.findOne({ name: msg.group });
      if (group) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (group.members.includes(uname)) {
            this.io.to(id).emit("message_edited", updatedMsg);
          }
        });
      }
    } else if (msg.to && msg.to !== "All") {
      // For private messages, send to both sender and recipient
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === msg.to);
      const senderSocketId = Object.keys(this.users).find(id => this.users[id] === msg.sender);
      
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("message_edited", updatedMsg);
      }
      if (senderSocketId) {
        this.io.to(senderSocketId).emit("message_edited", updatedMsg);
      }
    } else {
      this.io.emit("message_edited", updatedMsg);
    }
    
    console.log("Edit broadcast completed");
  }

  // Handle message seen receipt
  async handleMessageSeen(socket, { messageId, username }) {
    const msg = await Message.findById(messageId);
    if (!msg) return;
    
    // Check if message hasn't been seen by this user yet
    if (!msg.seenBy.includes(username)) {
      msg.seenBy.push(username);
      await msg.save();
      
      // Notify sender about the seen receipt (private chat only)
      if (msg.to && msg.to !== "All" && msg.sender !== username) {
        const senderSocketId = Object.keys(this.users).find(id => this.users[id] === msg.sender);
        if (senderSocketId) {
          this.io.to(senderSocketId).emit("message_receipt_update", { messageId, seenBy: msg.seenBy });
        }
      }
    }
  }

  // Handle message reactions
  async handleMessageReaction(socket, { messageId, username, emoji }) {
    const msg = await Message.findById(messageId);
    if (!msg) return;
    // Remove previous reaction by this user (if any)
    msg.reactions = msg.reactions.filter(r => r.username !== username);
    // Add new reaction
    msg.reactions.push({ username, emoji });
    await msg.save();
    // Broadcast updated message to relevant clients
    if (msg.group) {
      const group = await Group.findOne({ name: msg.group });
      if (group) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (group.members.includes(uname)) {
            this.io.to(id).emit("message_reaction_update", { messageId, reactions: msg.reactions });
          }
        });
      }
    } else if (msg.to && msg.to !== "All") {
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === msg.to);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("message_reaction_update", { messageId, reactions: msg.reactions });
        socket.emit("message_reaction_update", { messageId, reactions: msg.reactions });
      }
    } else {
      this.io.emit("message_reaction_update", { messageId, reactions: msg.reactions });
    }
  }

  // Handle message pinning
  async handlePinMessage(socket, { messageId, username }) {
    const msg = await Message.findById(messageId);
    if (!msg || !msg.group) return;
    
    // Check if user is member of the group
    const group = await Group.findOne({ name: msg.group });
    if (!group || !group.members.includes(username)) return;
    
    // Get current pinned messages count for this group
    const pinnedMessages = await Message.find({ group: msg.group, pinned: true }).sort({ pinOrder: 1 });
    const nextPinOrder = pinnedMessages.length + 1;
    
    // Pin the message
    msg.pinned = true;
    msg.pinnedAt = new Date();
    msg.pinnedBy = username;
    msg.pinOrder = nextPinOrder;
    await msg.save();
    
    // Add to group's pinned messages if not already there
    if (!group.pinnedMessages.includes(messageId)) {
      group.pinnedMessages.push(messageId);
      await group.save();
    }
    
    // Broadcast pin update to group members
    Object.entries(this.users).forEach(([id, uname]) => {
      if (group.members.includes(uname)) {
        this.io.to(id).emit("message_pinned", { 
          messageId, 
          pinned: true, 
          pinnedBy: username, 
          pinnedAt: msg.pinnedAt,
          pinOrder: nextPinOrder 
        });
      }
    });
  }

  // Handle message unpinning
  async handleUnpinMessage(socket, { messageId, username }) {
    const msg = await Message.findById(messageId);
    if (!msg || !msg.group) return;
    
    // Check if user is member of the group
    const group = await Group.findOne({ name: msg.group });
    if (!group || !group.members.includes(username)) return;
    
    // Unpin the message
    msg.pinned = false;
    msg.pinnedAt = null;
    msg.pinnedBy = null;
    msg.pinOrder = null;
    await msg.save();
    
    // Remove from group's pinned messages
    group.pinnedMessages = group.pinnedMessages.filter(id => id.toString() !== messageId);
    await group.save();
    
    // Reorder remaining pinned messages
    const remainingPinnedMessages = await Message.find({ group: msg.group, pinned: true }).sort({ pinnedAt: 1 });
    for (let i = 0; i < remainingPinnedMessages.length; i++) {
      remainingPinnedMessages[i].pinOrder = i + 1;
      await remainingPinnedMessages[i].save();
    }
    
    // Broadcast unpin update to group members
    Object.entries(this.users).forEach(([id, uname]) => {
      if (group.members.includes(uname)) {
        this.io.to(id).emit("message_pinned", { messageId, pinned: false });
      }
    });
  }

  // Handle poll creation
  async handleCreatePoll(socket, pollData) {
    try {
      const { question, options, group, allowMultipleVotes, expiresAt } = pollData;
      
      // Validate poll data
      if (!question || !options || options.length < 2 || !group) {
        return;
      }
      
      // Create poll
      const poll = await Poll.create({
        question,
        options: options.map(option => ({ text: option })),
        createdBy: this.users[socket.id],
        group,
        allowMultipleVotes: allowMultipleVotes || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });
      
      // Create message with poll
      const messageData = {
        sender: this.users[socket.id],
        group: group,
        message: `📊 Poll: ${question}`,
        pollId: poll._id,
        timestamp: Date.now()
      };
      
      const savedMsg = await Message.create(messageData);
      
      // Broadcast to group members
      const groupObj = await Group.findOne({ name: group });
      if (groupObj) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (groupObj.members.includes(uname)) {
            this.io.to(id).emit("receive_message", savedMsg);
            this.io.to(id).emit("poll_created", { poll, messageId: savedMsg._id });
          }
        });
      }
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  }

  // Handle poll voting
  async handleVotePoll(socket, { pollId, optionIndex, username }) {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll || !poll.isActive) return;
      
      // Check if user is member of the group
      const group = await Group.findOne({ name: poll.group });
      if (!group || !group.members.includes(username)) return;
      
      // Check if poll has expired
      if (poll.expiresAt && new Date() > poll.expiresAt) {
        poll.isActive = false;
        await poll.save();
        return;
      }
      
      const option = poll.options[optionIndex];
      if (!option) return;
      
      // Handle voting logic
      if (poll.allowMultipleVotes) {
        // Allow multiple votes - toggle vote
        const voteIndex = option.votes.indexOf(username);
        if (voteIndex > -1) {
          option.votes.splice(voteIndex, 1);
          poll.totalVotes--;
        } else {
          option.votes.push(username);
          poll.totalVotes++;
        }
      } else {
        // Single vote - remove from all options first
        poll.options.forEach(opt => {
          const voteIndex = opt.votes.indexOf(username);
          if (voteIndex > -1) {
            opt.votes.splice(voteIndex, 1);
            poll.totalVotes--;
          }
        });
        
        // Add vote to selected option
        option.votes.push(username);
        poll.totalVotes++;
      }
      
      await poll.save();
      
      // Broadcast updated poll to group members
      const groupObj = await Group.findOne({ name: poll.group });
      if (groupObj) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (groupObj.members.includes(uname)) {
            this.io.to(id).emit("poll_updated", { pollId, poll });
          }
        });
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  }

  // Handle poll closure
  async handleClosePoll(socket, { pollId, username }) {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll || poll.createdBy !== username) return;
      
      poll.isActive = false;
      await poll.save();
      
      // Broadcast poll closure to group members
      const group = await Group.findOne({ name: poll.group });
      if (group) {
        Object.entries(this.users).forEach(([id, uname]) => {
          if (group.members.includes(uname)) {
            this.io.to(id).emit("poll_closed", { pollId, poll });
          }
        });
      }
    } catch (error) {
      console.error("Error closing poll:", error);
    }
  }

  // Handle view-once image viewing
  async handleViewOnceImage(socket, { messageId, username }) {
    try {
      const message = await Message.findById(messageId);
      if (!message || !message.isViewOnce || !message.mediaUrl || !message.mediaType || !message.mediaType.startsWith("image")) return;
      
      // Check if user has already viewed this image
      if (message.viewedBy && message.viewedBy.includes(username)) return;
      
      // Add user to viewedBy array
      await Message.updateOne(
        { _id: messageId },
        { $addToSet: { viewedBy: username } }
      );
      
      // Broadcast the view update to relevant clients
      if (message.group) {
        const group = await Group.findOne({ name: message.group });
        if (group) {
          Object.entries(this.users).forEach(([id, uname]) => {
            if (group.members.includes(uname)) {
              this.io.to(id).emit("view_once_updated", { messageId, viewedBy: [...(message.viewedBy || []), username] });
            }
          });
        }
      } else if (message.to && message.to !== "All") {
        const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === message.to);
        const senderSocketId = Object.keys(this.users).find(id => this.users[id] === message.sender);
        if (recipientSocketId) {
          this.io.to(recipientSocketId).emit("view_once_updated", { messageId, viewedBy: [...(message.viewedBy || []), username] });
        }
        if (senderSocketId) {
          this.io.to(senderSocketId).emit("view_once_updated", { messageId, viewedBy: [...(message.viewedBy || []), username] });
        }
      } else {
        this.io.emit("view_once_updated", { messageId, viewedBy: [...(message.viewedBy || []), username] });
      }
    } catch (error) {
      console.error("Error handling view-once image:", error);
    }
  }

  // Handle typing indicators
  handleTyping(socket, { to, group, username }) {
    if (group) {
      const groupObj = Object.values(this.users).filter(u => u !== username);
      Object.entries(this.users).forEach(([id, uname]) => {
        if (groupObj.includes(uname)) {
          this.io.to(id).emit("typing", { group, username });
        }
      });
    } else if (to) {
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === to);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("typing", { from: username });
      }
    }
  }

  handleStopTyping(socket, { to, group, username }) {
    if (group) {
      const groupObj = Object.values(this.users).filter(u => u !== username);
      Object.entries(this.users).forEach(([id, uname]) => {
        if (groupObj.includes(uname)) {
          this.io.to(id).emit("stop_typing", { group, username });
        }
      });
    } else if (to) {
      const recipientSocketId = Object.keys(this.users).find(id => this.users[id] === to);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit("stop_typing", { from: username });
      }
    }
  }

  // Handle admin management
  async handleAddAdmin(socket, { groupName, username, targetUser }) {
    try {
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        socket.emit("admin_error", { message: "Group not found" });
        return;
      }

      // Check if user is admin or creator
      if (!group.admins.includes(username) && group.creator !== username) {
        socket.emit("admin_error", { message: "Only admins can add other admins" });
        return;
      }

      // Check if target user is a member of the group
      if (!group.members.includes(targetUser)) {
        socket.emit("admin_error", { message: "User must be a member of the group" });
        return;
      }

      // Check if target user is already an admin
      if (group.admins.includes(targetUser)) {
        socket.emit("admin_error", { message: "User is already an admin" });
        return;
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
      this.io.emit("groups_list", groups);

      // Broadcast to group members
      Object.entries(this.users).forEach(([id, uname]) => {
        if (group.members.includes(uname)) {
          this.io.to(id).emit("receive_message", systemMessage);
        }
      });

      socket.emit("admin_success", { message: `${targetUser} is now an admin` });
    } catch (error) {
      console.error("Error adding admin:", error);
      socket.emit("admin_error", { message: "Failed to add admin" });
    }
  }

  async handleRemoveAdmin(socket, { groupName, username, targetUser }) {
    try {
      const group = await Group.findOne({ name: groupName });
      if (!group) {
        socket.emit("admin_error", { message: "Group not found" });
        return;
      }

      // Check if user is creator (only creator can remove admins)
      if (group.creator !== username) {
        socket.emit("admin_error", { message: "Only the group creator can remove admins" });
        return;
      }

      // Check if target user is an admin
      if (!group.admins.includes(targetUser)) {
        socket.emit("admin_error", { message: "User is not an admin" });
        return;
      }

      // Don't allow removing the creator from admins
      if (group.creator === targetUser) {
        socket.emit("admin_error", { message: "Cannot remove the group creator from admins" });
        return;
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
      this.io.emit("groups_list", groups);

      // Broadcast to group members
      Object.entries(this.users).forEach(([id, uname]) => {
        if (group.members.includes(uname)) {
          this.io.to(id).emit("receive_message", systemMessage);
        }
      });

      socket.emit("admin_success", { message: `${targetUser} is no longer an admin` });
    } catch (error) {
      console.error("Error removing admin:", error);
      socket.emit("admin_error", { message: "Failed to remove admin" });
    }
  }

  // Handle disconnect
  async handleDisconnect(socket) {
    delete this.users[socket.id];

    // Update online users list
    const onlineUsers = Object.values(this.users);
    this.io.emit("online_users", onlineUsers);

    // Update user list (with avatarUrl and bio)
    const userList = await User.find({}, 'username avatarUrl bio');
    this.io.emit("users_list", userList.map(u => ({ username: u.username, avatarUrl: u.avatarUrl, bio: u.bio })));
  }

  // Setup socket event listeners
  setupSocketEvents(socket) {
    socket.on("join", (username) => this.handleJoin(socket, username));
    socket.on("create_group", (group) => this.handleCreateGroup(socket, group));
    socket.on("send_message", (data) => this.handleSendMessage(socket, data));
    socket.on("delete_message", (msgId) => this.handleDeleteMessage(socket, msgId));
    socket.on("edit_message", (data) => this.handleEditMessage(socket, data));
    socket.on("message_seen", (data) => this.handleMessageSeen(socket, data));
    socket.on("react_message", (data) => this.handleMessageReaction(socket, data));
    socket.on("pin_message", (data) => this.handlePinMessage(socket, data));
    socket.on("unpin_message", (data) => this.handleUnpinMessage(socket, data));
    socket.on("create_poll", (pollData) => this.handleCreatePoll(socket, pollData));
    socket.on("vote_poll", (data) => this.handleVotePoll(socket, data));
    socket.on("close_poll", (data) => this.handleClosePoll(socket, data));
    socket.on("view_once_image", (data) => this.handleViewOnceImage(socket, data));
    socket.on("typing", (data) => this.handleTyping(socket, data));
    socket.on("stop_typing", (data) => this.handleStopTyping(socket, data));
    socket.on("add_admin", (data) => this.handleAddAdmin(socket, data));
    socket.on("remove_admin", (data) => this.handleRemoveAdmin(socket, data));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }
}

module.exports = SocketController; 
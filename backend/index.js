const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

//env variables
require('dotenv').config(); // Load environment variables from .env file

//database connection
const { MongoDbConnection } = require('./Db'); // Import the database connection
MongoDbConnection(); // Call the database connection

// Import models
const User = require('./models/User');
const Group = require('./models/Group');
const Message = require('./models/Message');
const Poll = require('./models/Poll');

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ["GET", "POST"] }
});

// Setup socket middleware
const setupSocketMiddleware = require('./middleware/socketMiddleware');
const socketController = setupSocketMiddleware(io);

// Make socket.io and controller available to routes
app.set('io', io);
app.set('socketController', socketController);


// Socket.io events are now handled by the SocketController class


// Routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const avatarRoutes = require('./routes/avatar');
const groupAvatarRoutes = require('./routes/groupAvatar');
const groupNameRoutes = require('./routes/groupName');
const groupDescriptionRoutes = require('./routes/groupDescription');
const groupMembersRoutes = require('./routes/groupMembers');
const leaveGroupRoutes = require('./routes/leaveGroup');
const groupRoutes = require('./routes/group');
const pollRoutes = require('./routes/poll');
const backgroundRoutes = require('./routes/background');

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/group-avatar', groupAvatarRoutes);
app.use('/api/group-name', groupNameRoutes);
app.use('/api/group-description', groupDescriptionRoutes);
app.use('/api/group-members', groupMembersRoutes);
app.use('/api/leave-group', leaveGroupRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/backgrounds', backgroundRoutes);

// Test route to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Test avatar route
app.get('/api/avatar/test', (req, res) => {
  res.json({ message: 'Avatar route is working!' });
});

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);



// app.get("/",async(req,res)=>{
//   res.send("Server is running");
// })

server.listen(process.env.PORT, () => console.log(`server running on port ${process.env.PORT}`));

const SocketController = require('../controllers/socketController');

const setupSocketMiddleware = (io) => {
  const socketController = new SocketController(io);
  
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socketController.setupSocketEvents(socket);
  });
  
  return socketController;
};

module.exports = setupSocketMiddleware; 
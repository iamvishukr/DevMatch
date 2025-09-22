// socketHandler.js
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, "DEV@MATCH$23");
      const user = await User.findById(decoded._id);
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    
    // Join room for user
    socket.join(socket.userId);

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        // Save message to database
        const Message = require("./models/Message");
        const newMessage = new Message({
          from: socket.userId,
          to: data.to,
          text: data.text,
        });
        await newMessage.save();

        // Emit to recipient
        socket.to(data.to).emit("receive_message", {
          _id: newMessage._id,
          from: socket.userId,
          to: data.to,
          text: data.text,
          createdAt: newMessage.createdAt,
        });

        // Also send back to sender for immediate UI update
        socket.emit("receive_message", {
          _id: newMessage._id,
          from: socket.userId,
          to: data.to,
          text: data.text,
          createdAt: newMessage.createdAt,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle message read status
    socket.on("mark_as_read", async (data) => {
      try {
        const Message = require("./models/Message");
        await Message.updateMany(
          { from: data.senderId, to: socket.userId, read: false },
          { $set: { read: true } }
        );

        // Notify sender that messages were read
        socket.to(data.senderId).emit("messages_read", {
          readerId: socket.userId,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
const express = require("express");
const Message = require("../models/Message");
const Chat = require("../models/Chat"); 
const { userAuth } = require("../middlewares/auth"); // ✅ fix here

const router = express.Router();

// Get all chats of current user
router.get("/chats", userAuth, async (req, res) => {
  const chats = await Chat.find({ members: req.user._id }).populate("members");
  res.json(chats);
});

// Get messages of a chat
router.get("/chats/:userId", userAuth, async (req, res) => {
  console.log("GET /chats/:userId called with userId:", req.params.userId);
  console.log("Authenticated user:", req.user._id);
  
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    
    console.log("Found messages:", messages.length);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete single message
router.delete("/messages/:id", userAuth, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Delete whole chat
router.delete("/chats/:userId", userAuth, async (req, res) => {
  const { userId } = req.params;
  await Message.deleteMany({
    $or: [
      { from: req.user._id, to: userId },
      { from: userId, to: req.user._id },
    ],
  });
  res.json({ success: true });
});

// Block a user
router.post("/chats/:userId/block", userAuth, async (req, res) => {
  const { userId } = req.params;
  const chat = await Chat.findOneAndUpdate(
    { members: { $all: [req.user._id, userId] } },
    { $addToSet: { blocked: req.user._id } },
    { upsert: true, new: true }
  );
  res.json(chat);
});

// Unblock a user
router.post("/chats/:userId/unblock", userAuth, async (req, res) => {
  const { userId } = req.params;
  const chat = await Chat.findOneAndUpdate(
    { members: { $all: [req.user._id, userId] } },
    { $pull: { blocked: req.user._id } },
    { new: true }
  );
  res.json(chat);
});

module.exports = router;

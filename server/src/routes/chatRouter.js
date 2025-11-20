const express = require("express");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { userAuth } = require("../middlewares/auth");

const router = express.Router();

// Get all chats of current user
router.get("/chats", userAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id }).populate("members");
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// Send message to user
router.post("/chats/:userId/message", userAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const { userId } = req.params;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Message text required" });
    }

    const newMsg = await Message.create({
      from: req.user._id,
      to: userId,
      text,
    });

    // Populate the message with user data
    const populatedMsg = await Message.findById(newMsg._id)
      .populate('from', 'firstName lastName username photoUrl')
      .populate('to', 'firstName lastName username photoUrl');

    res.status(201).json(populatedMsg);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
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
    })
    .populate('from', 'firstName lastName username photoUrl')
    .populate('to', 'firstName lastName username photoUrl')
    .sort({ createdAt: 1 });

    console.log("Found messages:", messages.length);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete single message
router.delete("/messages/:id", userAuth, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Delete whole chat
router.delete("/chats/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.deleteMany({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id },
      ],
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

// Block a user
router.post("/chats/:userId/block", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOneAndUpdate(
      { members: { $all: [req.user._id, userId] } },
      { $addToSet: { blocked: req.user._id } },
      { upsert: true, new: true }
    );
    res.json(chat);
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
});

// Unblock a user
router.post("/chats/:userId/unblock", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOneAndUpdate(
      { members: { $all: [req.user._id, userId] } },
      { $pull: { blocked: req.user._id } },
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// Get chat list with last messages
router.get("/chats-with-last-message", userAuth, async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user._id })
      .populate("members", "firstName lastName username photoUrl");

    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const otherUser = chat.members.find(
          member => member._id.toString() !== req.user._id.toString()
        );

        if (!otherUser) return null;

        // Get last message for this chat
        const lastMessage = await Message.findOne({
          $or: [
            { from: req.user._id, to: otherUser._id },
            { from: otherUser._id, to: req.user._id },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('from', 'firstName lastName username photoUrl')
        .populate('to', 'firstName lastName username photoUrl');

        // Get unread count
        const unreadCount = await Message.countDocuments({
          from: otherUser._id,
          to: req.user._id,
          read: false,
        });

        return {
          _id: chat._id,
          otherUser,
          lastMessage: lastMessage || null,
          unreadCount,
          updatedAt: lastMessage?.createdAt || chat.updatedAt,
        };
      })
    );

    // Filter out null chats and sort by last activity
    const filteredChats = chatsWithLastMessage
      .filter(chat => chat !== null)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(filteredChats);
  } catch (error) {
    console.error("Error fetching chats with last message:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

module.exports = router;
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiX, FiSlash, FiArrowLeft } from "react-icons/fi";
import { chatAPI } from "../services/api";
import socket from "../services/socket";
import MessageBubble from "../components/Message/MessageBubble";

const ChatModal = ({ user, currentUser, onClose, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    const userId = user._id;
    const currentUserId = currentUser._id;

    if (!socket.connected) socket.connect();
    socket.emit("join", currentUser._id);

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const messagesData = await chatAPI.getMessages(userId);
        
        // Ensure we have an array and sort by createdAt
        const messagesArray = Array.isArray(messagesData) ? messagesData : [];
        const sortedMessages = messagesArray.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setMessages(sortedMessages);
        
        // Scroll to bottom after loading
        setTimeout(() => {
          endRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    const handleReceive = (msg) => {
      if (
        (msg.from._id === userId && msg.to._id === currentUserId) ||
        (msg.from._id === currentUserId && msg.to._id === userId) ||
        (msg.from === userId && msg.to === currentUserId) ||
        (msg.from === currentUserId && msg.to === userId)
      ) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(m => m._id === msg._id);
          if (exists) return prev;
          
          const updated = [...prev, msg];
          // Sort by timestamp to maintain order
          return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        
        setTimeout(() => {
          endRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    socket.on("receiveMessage", handleReceive);
    
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [user._id, currentUser._id]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    try {
      // Use chatAPI for consistent API calls
      const savedMsg = await chatAPI.sendMessage(user._id, newMsg);
      
      // Emit via socket for real-time delivery
      socket.emit("sendMessage", {
        from: currentUser._id,
        to: user._id,
        text: newMsg
      });

      // Update local state with the new message
      setMessages((prev) => {
        const updated = [...prev, savedMsg];
        return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
      
      setNewMsg("");
      setEditingMsg(null);
      
      // Scroll to bottom
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await chatAPI.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleEdit = (msg) => {
    setEditingMsg(msg);
    setNewMsg(msg.text);
  };

  const updateMessage = async () => {
    if (!newMsg.trim() || !editingMsg) return;

    try {
      // Implement your update message API call here
      console.log("Updating message:", editingMsg._id, "with text:", newMsg);
      
      // For now, we'll just clear the editing state
      setEditingMsg(null);
      setNewMsg("");
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const toggleBlock = async () => {
    try {
      if (blocked) {
        await chatAPI.unblock(user._id);
      } else {
        await chatAPI.toggleBlock(user._id);
      }
      setBlocked((prev) => !prev);
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (editingMsg) {
        updateMessage();
      } else {
        sendMessage();
      }
    }
  };

  const getUserImage = (user) => {
    const baseUrl = "http://localhost:3001";
    if (user?.photoUrl) {
      if (user.photoUrl.startsWith("http")) return user.photoUrl;
      return baseUrl + user.photoUrl;
    }
    return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  };

  const getUserName = (user) => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    return "Unknown User";
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-full md:w-96 h-full bg-gray-900 text-white flex flex-col z-50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden text-white hover:text-gray-300 transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <img
            src={getUserImage(user)}
            alt={getUserName(user)}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h3 className="font-semibold">{getUserName(user)}</h3>
            <p className="text-xs text-gray-400">
              {blocked ? "Blocked" : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleBlock}
            className={`p-2 rounded-full transition-colors ${
              blocked ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            title={blocked ? "Unblock user" : "Block user"}
          >
            <FiSlash size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-900">
        <div className="p-4 space-y-3 min-h-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-32 text-gray-500">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={
                  msg.from?._id === currentUser._id || 
                  msg.from === currentUser._id
                }
                onEdit={handleEdit}
                onDelete={deleteMessage}
              />
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        {editingMsg && (
          <div className="mb-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-xs text-yellow-300">Editing message</p>
          </div>
        )}
        <div className="flex space-x-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={blocked}
            placeholder={
              blocked 
                ? "You have blocked this user" 
                : editingMsg 
                  ? "Editing your message..." 
                  : "Type a message..."
            }
            className="flex-1 rounded-lg px-4 py-3 bg-gray-700 text-white outline-none disabled:opacity-50 placeholder-gray-400 border border-gray-600 focus:border-blue-500 transition-colors"
          />
          <button
            onClick={editingMsg ? updateMessage : sendMessage}
            disabled={blocked || !newMsg.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors font-medium"
          >
            {editingMsg ? "Update" : "Send"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatModal;
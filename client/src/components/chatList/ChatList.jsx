import { useState, useEffect } from "react";
import { chatAPI } from "../../services/api";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FiX, FiMessageCircle, FiSearch, FiUser } from "react-icons/fi";

const ChatList = ({ onClose }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { openChat } = useChat();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      console.log("Loading chats...");
      
      // First, try to get all chats
      const allChats = await chatAPI.getChats();
      console.log("Raw chats data:", allChats);

      // If no chats exist, return empty array
      if (!allChats || allChats.length === 0) {
        console.log("No chats found");
        setChats([]);
        return;
      }

      // For each chat, get the last message and the other user
      const chatsWithDetails = await Promise.all(
        allChats.map(async (chat) => {
          try {
            // Get the other user in the chat (not current user)
            const otherUser = chat.members?.find(
              member => member._id !== currentUser._id
            );

            if (!otherUser) {
              console.log("No other user found in chat:", chat._id);
              return null;
            }

            console.log("Processing chat with user:", otherUser.firstName);

            // Get messages for this chat to find last message
            const messages = await chatAPI.getMessages(otherUser._id);
            console.log(`Found ${messages.length} messages with ${otherUser.firstName}`);

            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            // Calculate unread count (messages not read and from other user)
            const unreadCount = messages.filter(msg => {
              const isFromOtherUser = msg.from?._id !== currentUser._id && msg.from !== currentUser._id;
              return isFromOtherUser && !msg.read;
            }).length;

            return {
              _id: chat._id,
              otherUser,
              lastMessage,
              unreadCount,
              updatedAt: lastMessage?.createdAt || chat.updatedAt || new Date(),
              messageCount: messages.length
            };
          } catch (error) {
            console.error("Error processing chat:", error);
            return null;
          }
        })
      );

      // Filter out null chats and sort by last activity
      const validChats = chatsWithDetails
        .filter(chat => chat !== null && chat.otherUser)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      console.log("Final chats list:", validChats);
      setChats(validChats);

    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
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

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";
    
    const messageText = message.text || message.content || "";
    // Truncate long messages
    return messageText.length > 35 
      ? messageText.substring(0, 35) + "..." 
      : messageText;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      // Less than 1 hour - show minutes
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes === 0 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      // Less than 24 hours - show hours
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      // Less than 1 week - show days
      return `${Math.floor(diffInHours / 24)}d`;
    } else {
      // More than 1 week - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const isMessageFromCurrentUser = (message) => {
    if (!message) return false;
    return message.from?._id === currentUser._id || message.from === currentUser._id;
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return "Start a conversation";
    
    const prefix = isMessageFromCurrentUser(chat.lastMessage) ? "You: " : "";
    return prefix + formatLastMessage(chat.lastMessage);
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    if (!searchTerm.trim()) return true;
    
    const userName = getUserName(chat.otherUser).toLowerCase();
    const lastMessage = chat.lastMessage?.text?.toLowerCase() || "";
    
    return userName.includes(searchTerm.toLowerCase()) || 
           lastMessage.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="fixed top-0 right-0 w-full md:w-96 h-full bg-gray-900 text-white z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
            <h2 className="text-xl font-bold">Messages</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Loading State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading conversations...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-full md:w-96 h-full bg-gray-900 text-white flex flex-col z-50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FiMessageCircle size={20} />
          </div>
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
            {searchTerm ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-medium mb-2">No conversations found</p>
                <p className="text-sm">
                  No conversations match "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium mb-2">No messages yet</p>
                <p className="text-sm max-w-xs">
                  Start conversations with your connections to see your messages here
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Find Connections
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => openChat(chat.otherUser)}
                className="p-4 hover:bg-gray-800 cursor-pointer transition-colors active:bg-gray-750"
              >
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getUserImage(chat.otherUser)}
                      alt={getUserName(chat.otherUser)}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-600"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    {/* Fallback avatar */}
                    <div 
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-gray-600 hidden"
                      style={{ display: 'none' }}
                    >
                      <FiUser size={20} className="text-white" />
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium border-2 border-gray-900">
                        {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-white truncate text-lg">
                        {getUserName(chat.otherUser)}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-white font-semibold' : 'text-gray-400'
                    }`}>
                      {getLastMessagePreview(chat)}
                    </p>

                    {/* Message count indicator */}
                    {chat.messageCount > 0 && (
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {chat.messageCount} message{chat.messageCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <p className="text-center text-gray-400 text-sm">
          {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatList;
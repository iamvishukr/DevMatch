import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageCircle } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { chatAPI } from "../../services/api";
import socket from "../../services/socket";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openChat, toggleChatList, showChatList } = useChat();

  useEffect(() => {
    if (showChatList) {
      loadChats();
      
      socket.connect();
      
      socket.on("receiveMessage", (message) => {
        loadChats();
      });
    }

    return () => {
      socket.off("receiveMessage");
    };
  }, [showChatList]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getChats();
      setChats(res.chats || []);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (chat) => {
    const otherUser = chat.members.find(member => member._id !== chat._id);
    if (otherUser) {
      openChat(otherUser);
    }
  };

  return (
    <AnimatePresence>
      {showChatList && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          className="fixed top-0 right-0 w-full md:w-96 h-full bg-gray-900 text-white shadow-xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gray-800">
            <h3 className="font-bold text-lg">Chats</h3>
            <button onClick={toggleChatList}>
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                No chats yet. Start a conversation with your connections!
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = chat.members.find(member => member._id !== chat._id);
                if (!otherUser) return null;
                
                return (
                  <div
                    key={chat._id}
                    className="flex items-center p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors mb-2"
                    onClick={() => handleUserClick(chat)}
                  >
                    <img
                      src={otherUser.avatar || "/default-avatar.png"}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{otherUser.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {otherUser.bio || "No bio available"}
                      </p>
                    </div>
                    <FiMessageCircle className="text-blue-500" />
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatList;
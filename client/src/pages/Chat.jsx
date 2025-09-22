import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiX, FiTrash2, FiSlash } from "react-icons/fi";
import { chatAPI } from "../services/api";
import socket from "../services/socket";

const ChatModal = ({ user, currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [blocked, setBlocked] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    const userId = user._id;
    const currentUserId = currentUser._id;

    const loadMessages = async () => {
      try {
        const res = await chatAPI.getMessages(userId);
        setMessages(res.messages || []);
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();

    const handleReceive = (msg) => {
      if (
        (msg.from === userId && msg.to === currentUserId) ||
        (msg.to === userId && msg.from === currentUserId)
      ) {
        setMessages((prev) => [...prev, msg]);
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [user._id, currentUser._id]);

  const sendMessage = () => {
    if (!newMsg.trim() || blocked) return;

    socket.emit("sendMessage", {
      from: currentUser._id,
      to: user._id,
      text: newMsg.trim(),
    });

    setNewMsg("");
  };

  const deleteMessage = async (id) => {
    await chatAPI.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  const toggleBlock = async () => {
    await chatAPI.toggleBlock(user._id);
    setBlocked((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-full md:w-96 h-full bg-gray-900 text-white flex flex-col z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 bg-gray-800">
        <div className="flex items-center space-x-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
          <h3>{user.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleBlock}>
            <FiSlash size={18} />
          </button>
          <button onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className={msg.from === currentUser._id ? "text-right" : "text-left"}>
            <span>{msg.text}</span>
            {msg.from === currentUser._id && (
              <button onClick={() => deleteMessage(msg._id)}>
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-white/20 bg-gray-800">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={blocked}
          className="flex-1 rounded-lg px-4 py-2 bg-gray-700 text-white outline-none disabled:opacity-50"
        />
        <button onClick={sendMessage} disabled={blocked} className="ml-2 bg-blue-500 px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default ChatModal;

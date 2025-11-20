import { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const MessageBubble = ({ message, isOwn, onEdit, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle different message data structures
  const messageText = message.text || message.content || "";
  const messageId = message._id || message.id;
  
  const messageTime = message.createdAt 
    ? new Date(message.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : 'Now';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
      setShowOptions(false);
    }
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 group`}
      onMouseEnter={() => !isDeleting && setShowOptions(true)}
      onMouseLeave={() => !isDeleting && setShowOptions(false)}
    >
      <div className="flex flex-col max-w-xs lg:max-w-md">
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isOwn
              ? "bg-blue-500 text-white rounded-br-none" // Own messages - blue, bottom-right rounded
              : "bg-gray-700 text-white rounded-bl-none" // Other's messages - gray, bottom-left rounded
          } ${isDeleting ? "opacity-50" : ""}`}
        >
          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
          
          <p className="text-sm break-words pr-6">{messageText}</p>
          
          <div className={`flex justify-end items-center mt-1 ${
            isOwn ? "text-blue-100" : "text-gray-400"
          }`}>
            <span className="text-xs mr-1">{messageTime}</span>
            {isOwn && (
              <FiCheck size={12} className={message.read ? "text-blue-200" : "text-gray-400"} />
            )}
          </div>
        </div>

        {/* Message Options (only for own messages) */}
        {isOwn && showOptions && !isDeleting && (
          <div className="flex justify-end items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(message)}
              className="p-1.5 bg-gray-700 rounded-full text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
              title="Edit message"
            >
              <FiEdit2 size={12} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-gray-700 rounded-full text-gray-300 hover:text-red-400 hover:bg-gray-600 transition-colors"
              title="Delete message"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
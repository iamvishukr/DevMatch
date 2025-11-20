import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ChatModal from "../pages/Chat";
import { useAuth } from "./AuthContext";
import ChatList from "../components/chatList/ChatList";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeUser, setActiveUser] = useState(null);
  const [showChatList, setShowChatList] = useState(false);
  const { user: currentUser } = useAuth();

  const openChat = useCallback((user) => {
    setActiveUser(user);
    setShowChatList(false);
  }, []);

  const closeChat = useCallback(() => setActiveUser(null), []);

  const toggleChatList = useCallback(() => {
    setShowChatList((prev) => !prev);
    setActiveUser(null);
  }, []);

  const closeChatList = useCallback(() => setShowChatList(false), []);

  return (
    <ChatContext.Provider
      value={{
        openChat,
        closeChat,
        toggleChatList,
        closeChatList,
        showChatList,
        activeUser,
      }}
    >
      {children}

      <AnimatePresence>
        {showChatList && <ChatList onClose={closeChatList} />}
      </AnimatePresence>

      <AnimatePresence>
        {activeUser && currentUser && (
          <ChatModal
            key={activeUser._id}
            user={activeUser}
            currentUser={currentUser}
            onClose={closeChat}
            onBack={closeChat}
          />
        )}
      </AnimatePresence>
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
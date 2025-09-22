// Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ChatModal from "../../pages/Chat";
import { useChat } from "../../context/ChatContext"; // Add this import

const Layout = () => {
  const [chatUser, setChatUser] = useState(null);
  const { openChat } = useChat(); // Get openChat from ChatContext

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      {/* Navbar doesn't need onOpenChat prop anymore since we're using ChatContext */}
      <Navbar />
      
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet context={{ onOpenChat: openChat }} />
        </motion.div>
      </main>

      {/* Chat modal (global, sits on top of everything) */}
      <AnimatePresence>
        {chatUser && (
          <ChatModal
            user={chatUser}
            onClose={() => setChatUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
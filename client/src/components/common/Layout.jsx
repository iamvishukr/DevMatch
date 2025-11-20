import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900">
      {/* Navbar uses ChatContext internally */}
      <Navbar />
      
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outlet doesn't need chat context passed - components can use useChat() directly */}
          <Outlet />
        </motion.div>
      </main>

      {/* Chat modal is now handled by ChatContext provider in App.jsx */}
      {/* Remove the local chat modal since ChatContext handles it globally */}
    </div>
  );
};

export default Layout;
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUser,
  FiHeart,
  FiUsers,
  FiMenu,
  FiX,
  FiLogOut,
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const { user, logout } = useAuth();
  const { toggleChatList } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        if (currentScrollY === 0 || currentScrollY < lastScrollY.current) {
          setVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
          setVisible(false);
        }
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const navItems = [
    { path: "/feed", label: "Feed", icon: FiHome },
    { path: "/profile", label: "Profile", icon: FiUser },
    { path: "/requests", label: "Requests", icon: FiHeart },
    { path: "/connections", label: "Connections", icon: FiUsers },
  ];

  if (!user) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-50 glass-card m-4 rounded-2xl"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <Link to="/feed" className="text-2xl font-bold text-white">
              <span className="text-blue-500">Dev</span>
              <span className="text-pink-500">Match</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={toggleChatList}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <FiMessageCircle size={18} />
                <span>Chat</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-white/20 px-6 py-4 space-y-2 overflow-hidden"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    toggleChatList();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                >
                  <FiMessageCircle size={18} />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 w-full text-left"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Navbar;

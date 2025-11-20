import { useState } from 'react';
import { FiHome, FiUser, FiMessageCircle, FiUsers, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext'; // Add this import
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toggleChatList } = useChat(); // Use ChatContext
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChatClick = () => {
    toggleChatList(); // Use ChatContext function
  };

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/feed' },
    { icon: FiUsers, label: 'Connections', path: '/connections' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-800/50 backdrop-blur-md border-b border-white/10 p-4 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiMenu size={20} />
          </button>
          
          <h1 className="text-xl font-bold text-white">DevMatch</h1>
          
          <button
            onClick={handleChatClick}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative"
          >
            <FiMessageCircle size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800/50 backdrop-blur-md border-r border-white/10">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center px-4 mb-8">
              <h1 className="text-2xl font-bold text-white">DevMatch</h1>
            </div>
            
            <nav className="mt-8 flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Chat Button in Sidebar */}
              <button
                onClick={handleChatClick}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <FiMessageCircle size={20} className="mr-3" />
                Messages
              </button>
            </nav>
          </div>
          
          {/* User Section */}
          <div className="flex-shrink-0 flex border-t border-white/10 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                  src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=8b5cf6&color=fff`}
                  alt={user?.firstName}
                />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-400 truncate">
                  @{user?.username}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-800/95 backdrop-blur-md border-r border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  handleChatClick();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <FiMessageCircle size={20} className="mr-3" />
                Messages
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
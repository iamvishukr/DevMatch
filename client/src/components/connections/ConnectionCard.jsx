import { motion } from 'framer-motion';
import { FiMessageCircle, FiMoreHorizontal, FiUser, FiHeart } from 'react-icons/fi';
import { useState } from 'react';

const ConnectionCard = ({ user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const imageUrl = user.photoUrl?.startsWith('http') 
    ? user.photoUrl 
    : `http://localhost:3001${user.photoUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-pink-900/30 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-500 max-w-sm mx-auto overflow-hidden group"
    >
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      <div className="relative z-10 flex items-start space-x-4">
        {/* Avatar with glow effect */}
        <motion.div 
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-white/20">
            {user.photoUrl ? (
              <img
                src={imageUrl}
                alt={user.firstName}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = '/default-avatar.png'}
              />
            ) : (
              <FiUser size={24} className="text-white" />
            )}
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate mb-1">
            {user.firstName} {user.lastName}
          </h3>
          
          {user.age && (
            <p className="text-white/70 text-sm mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {user.age} years old
            </p>
          )}
          
          {user.about && (
            <p className="text-white/60 text-sm mt-2 line-clamp-2 leading-relaxed">
              {user.about}
            </p>
          )}
        </div>
      </div>

      {user.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {user.skills.slice(0, 4).map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10"
            >
              {skill}
            </motion.span>
          ))}
          {user.skills.length > 4 && (
            <span className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs font-medium">
              +{user.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <span className="text-white/60 text-xs">Go ahead, text a "Hey"..</span>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiMessageCircle size={18} />
          </motion.button>
          
          <motion.button
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 relative overflow-hidden ${
              isLiked 
                ? 'bg-gradient-to-tr from-red-500 to-pink-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiHeart 
              size={18} 
              className={isLiked ? 'fill-current' : ''} 
            />
          </motion.button>
          
          <motion.button
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors duration-200 relative overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiMoreHorizontal size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionCard;
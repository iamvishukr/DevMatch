import { forwardRef } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiX } from "react-icons/fi";
import { requestAPI } from "../../services/api";
import toast from "react-hot-toast";

const UserCard = forwardRef(({ user, onAction }, ref) => {
  const handleAction = async (action) => {
    try {
      const status = action === "like" ? "interested" : "ignored";
      await requestAPI.sendRequest(status, user._id);
      toast.success(
        action === "like"
          ? `You liked ${user.firstName}!`
          : `You passed ${user.firstName}`
      );
      onAction(user._id);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
      age--;
    return age;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card max-w-sm mx-auto overflow-hidden shadow-lg border border-white/20"
    >
      <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <img
          src={
            user.photoUrl?.startsWith("http")
              ? user.photoUrl
              : `http://localhost:3001${user.photoUrl}` || "/default-avatar.png"
          }
          alt={user.firstName}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />

        {user.age && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full font-medium">
            {user.age}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-xl font-bold text-white">
          {user.firstName} {user.lastName}
        </h3>
        {user.about && <p className="text-white/80 text-sm">{user.about}</p>}

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {user.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="bg-white/20 text-white px-3 py-1 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs">
                +{user.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-6 mt-4">
          <motion.button
            onClick={() => handleAction("pass")}
            className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-500/30 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={24} />
          </motion.button>
          <motion.button
            onClick={() => handleAction("like")}
            className="w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiHeart size={24} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

export default UserCard;

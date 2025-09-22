import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import { requestAPI } from "../../services/api";
import toast from "react-hot-toast";

const RequestCard = ({ request, onAction }) => {
  const { fromUserId } = request;

  const handleAction = async (action) => {
    try {
      const status = action === "accept" ? "accepted" : "rejected";
      await requestAPI.reviewRequest(status, request._id);

      toast.success(
        action === "accept"
          ? `You accepted ${fromUserId.firstName}'s request!`
          : `Request declined`
      );

      onAction(request._id);
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
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card max-w-sm mx-auto overflow-hidden shadow-lg border border-white/20"
    >
      <div className="relative h-80  overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <img
          src={
            fromUserId.photoUrl?.startsWith("http")
              ? fromUserId.photoUrl
              : `http://localhost:3001${fromUserId.photoUrl}`
          } 
          alt={fromUserId.firstName}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />

        {fromUserId.age && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full font-medium">
            {calculateAge(fromUserId.age)}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2 bg-white">
        <h3 className="text-xl font-bold text-black">
          {fromUserId.firstName} {fromUserId.lastName}
        </h3>
        {fromUserId.about && (
          <p className="text-black text-sm">{fromUserId.about}</p>
        )}

        {fromUserId.skills && fromUserId.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {fromUserId.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="bg-blue-500 border text-white px-3 py-1 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
            {fromUserId.skills.length > 3 && (
              <span className="bg-white/20 border border-black text-black px-3 py-1 rounded-full text-xs">
                +{fromUserId.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex justify-center gap-6 mt-4">
          <motion.button
            onClick={() => handleAction("reject")}
            className="w-14 h-14 bg-red-400 rounded-full flex items-center justify-center text-black hover:bg-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={24} />
          </motion.button>
          <motion.button
            onClick={() => handleAction("accept")}
            className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiCheck size={24} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserCard from "../components/feed/UserCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { userAPI } from "../services/api";
import toast from "react-hot-toast";

const FeedPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await userAPI.getFeed(pageNum, 10);

      if (pageNum === 1) setUsers(response.data);
      else setUsers((prev) => [...prev, ...response.data]);

      setHasMore(response.data.length === 10);
      setPage(pageNum);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId) => {
    setUsers((prev) => prev.filter((user) => user._id !== userId));

    if (users.length <= 3 && hasMore) {
      loadUsers(page + 1);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Discover People
        </h1>
        <p className="text-white/80 text-lg">Find your perfect match</p>
      </motion.div>

      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center text-center py-20"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ yoyo: Infinity, duration: 1.5 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            You're all caught up!
          </h3>
          <p className="text-white/80 mb-6 max-w-sm">
            No more profiles to show. Check back later for new people.
          </p>
          <button
            onClick={() => loadUsers(1)}
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300"
          >
            Refresh Feed
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <AnimatePresence mode="popLayout">
            {users.map((user, i) => (
              <UserCard key={user._id} user={user} onAction={handleUserAction} />
            ))}
          </AnimatePresence>

          {hasMore && (
            <motion.button
              onClick={() => loadUsers(page + 1)}
              className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-md hover:bg-white/20 transition-all duration-300"
            >
              Load More
            </motion.button>
          )}
        </div>
      )}

      {loading && users.length > 0 && (
        <div className="flex justify-center mt-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default FeedPage;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestAPI } from "../services/api";
import toast from "react-hot-toast";
import RequestCard from "../components/requests/RequestCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getReceivedRequests();
      setRequests(response.data.data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = (requestId) => {
    setRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-900 to-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 py-10 px-4 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Connection Requests</h1>
        <p className="text-white/80">People who want to connect with you</p>
      </motion.div>

      {requests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-2xl font-bold text-white mb-4">No requests yet</h3>
          <p className="text-white/80 mb-10">
            When someone sends you a connection request, it will appear here.
          </p>
          <a href="/feed" className="btn-primary bg-white p-4 mt-4 rounded-2xl">
            Discover People
          </a>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center space-y-6 w-full max-w-lg">
          <AnimatePresence mode="popLayout">
            {requests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onAction={handleRequestAction}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;

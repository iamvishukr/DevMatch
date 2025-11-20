import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const LoginPage = () => {
  const { user, loading } = useAuth(); 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-blue-500">Dev</span>
            <span className="text-purple-500">Match</span>
          </h1>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Welcome Back
          </h3>
          <p className="text-white/70 text-sm">
            Sign in to continue your journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <LoginForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-white/80 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-300 hover:text-blue-200 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

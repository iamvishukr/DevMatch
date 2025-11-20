import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

// Enhanced LoginForm component
const LoginForm = () => {
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.user);
      toast.success('Welcome back!');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Email Input */}
      <div className="relative group">
        <FiMail
          className="absolute left-3 top-1/2 transform -translate-y-1/2 
                     text-white/70 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          type="email"
          name="emailId"
          placeholder="Email Address"
          value={formData.emailId}
          onChange={handleChange}
          className="input-glass pl-10 w-full border border-white/30 rounded-xl p-3 
                     text-white placeholder-gray-300 bg-white/5
                     focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Password Input */}
      <div className="relative group">
        <FiLock
          className="absolute left-3 top-1/2 transform -translate-y-1/2 
                     text-white/70 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input-glass pl-10 pr-10 w-full border border-white/30 rounded-xl p-3 
                     text-white placeholder-gray-300 bg-white/5
                     focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-white/70 hover:text-blue-400 transition-colors"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 
                   rounded-xl font-medium flex items-center justify-center space-x-2
                   hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span>Sign In</span>
        )}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;

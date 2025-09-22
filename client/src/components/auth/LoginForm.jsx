import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

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
                     text-white/70 group-focus-within:text-black transition-colors"
        />
        <input
          type="email"
          name="emailId"
          placeholder="Email Address"
          value={formData.emailId}
          onChange={handleChange}
          className="input-glass pl-10 w-full border border-white/70 rounded-2xl p-2 
                     text-white placeholder-gray-300 
                     focus:bg-white focus:text-black focus:placeholder-gray-500"
          required
        />
      </div>

      {/* Password Input */}
      <div className="relative group">
        <FiLock
          className="absolute left-3 top-1/2 transform -translate-y-1/2 
                     text-white/70 group-focus-within:text-black transition-colors"
        />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input-glass pl-10 pr-10 w-full border border-white/70 rounded-2xl p-2 
                     text-white placeholder-gray-300 
                     focus:bg-white focus:text-black focus:placeholder-gray-500"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-white/70 group-focus-within:text-black hover:text-gray-700 transition-colors"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span className="text-white">Sign In</span>
        )}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;

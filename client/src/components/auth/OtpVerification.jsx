import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const OtpVerification = ({ email, onVerificationSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 4) {
      toast.error('Please enter all 4 digits');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyOtp({ emailId: email, otp: otpString });
      toast.success('Account verified successfully!');
      onVerificationSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Verify Your Email</h3>
        <p className="text-white/80">
          We've sent a 4-digit code to <br />
          <span className="font-semibold text-gray-100">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center text-2xl font-bold glass rounded-xl
                         text-white placeholder-gray-400 border border-white
                         focus:bg-white focus:text-pink-500 focus:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          ))}
        </div>

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
            <span className='text-white'>Verify Code</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default OtpVerification;

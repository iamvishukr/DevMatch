import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SignupForm from "../components/auth/SignupForm";
import OtpVerification from "../components/auth/OtpVerification";
import { useAuth } from "../context/AuthContext";

const steps = ["Signup", "Verify", "Success"];

const SignupPage = () => {
  const [step, setStep] = useState("signup"); 
  const [email, setEmail] = useState("");
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  const handleSignupSuccess = (emailId) => {
    setEmail(emailId);
    setStep("verify");
  };

  const handleVerificationSuccess = () => {
    setStep("success");
  };

  const currentStepIndex = steps.indexOf(
    step === "signup" ? "Signup" : step === "verify" ? "Verify" : "Success"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg rounded-2xl shadow-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-8"
      >
        <div className="flex justify-between mb-8">
          {steps.map((label, idx) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`mx-auto w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold 
                ${idx <= currentStepIndex ? "bg-primary-500 text-white" : "bg-white/20 text-white/60"}`}
              >
                {idx + 1}
              </div>
              <p className="mt-2 text-xs font-medium text-white">{label}</p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <h1 className="text-4xl font-boldmb-2"> 
                  <span className="text-blue-500">Dev</span>
                  <span className="text-pink-500">Match</span>
                </h1>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Create an Account
                </h2>
                <p className="text-white/70 text-sm">
                  Start connecting with developers around the world
                </p>
              </div>

              <SignupForm onSignupSuccess={handleSignupSuccess} />

              <div className="text-center mt-6">
                <p className="text-white/80 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary-300 hover:text-primary-200 font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              <OtpVerification
                email={email}
                onVerificationSuccess={handleVerificationSuccess}
              />
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-4xl font-boldmb-2 text-white"> Welcome to 
                  <span className="text-blue-600"> Dev</span>
                  <span className="text-pink-600">Match</span>
                </h3>
              <p className="text-white/80 mb-6 pt-4">
                Your account has been created successfully. <br /> You can now sign in
                and start connecting with people.
              </p>
              <Link
                to="/login"
                className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium transition"
              >
                Sign In Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SignupPage;

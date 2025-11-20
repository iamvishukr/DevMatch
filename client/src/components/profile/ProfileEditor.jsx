import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiUpload,
} from "react-icons/fi";
import { profileAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";

const ProfileEditor = ({ isEditing, onToggleEdit }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    about: "",
    age: "",
    skills: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        about: user.about || "",
        age: user.age || "",
        skills: user.skills ? user.skills.join(", ") : "",
      });
      setImagePreview(user.photoUrl || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!profileImage) return null;
    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append("profileImage", profileImage);
    try {
      const response = await fetch(
        "http://localhost:3001/upload/profile-image",
        {
          method: "POST",
          body: formDataObj,
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to upload image");
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photoUrl = user.photoUrl;
      if (profileImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) photoUrl = uploadedUrl;
      }
      const updateData = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        ...(photoUrl && { photoUrl }),
      };
      const response = await profileAPI.updateProfile(updateData);
      updateUser(response.data.data);
      toast.success("Profile updated successfully!");
      onToggleEdit();
      setProfileImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (!isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card max-w-2xl mx-auto p-6 rounded-2xl"
      >
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          <div className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            {user?.photoUrl ? (
              <img
                src={
                  user?.photoUrl?.startsWith("/uploads")
                    ? `http://localhost:3001${user.photoUrl}`
                    : user?.photoUrl
                }
                alt={user?.firstName || "Profile"}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <FiUser size={48} className="text-white" />
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            {user?.age && <p className="text-white/80 mb-2">Age: {user.age}</p>}
            <motion.button
              onClick={onToggleEdit}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiEdit3 size={16} /> <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>
        {user?.about && <p className="text-white/80 mb-4">{user.about}</p>}
        {user?.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, i) => (
              <span
                key={i}
                className="glass px-3 py-2 rounded-full text-white/90"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card max-w-2xl mx-auto p-6 rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            type="button"
            onClick={onToggleEdit}
            className="text-white/70 hover:text-white p-2"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={48} className="text-white" />
              )}
            </div>
            <button
              type="button"
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-md"
            >
              {uploadingImage ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FiCamera size={18} />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiUpload size={16} color="white" />
            <span className="text-white/70">
              {profileImage ? "Change Photo" : "Upload Photo"}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-white/80 mb-2">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
            min="18"
            max="100"
          />
        </div>
        <div>
          <label className="block text-white/80 mb-2">About</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 h-28 resize-none"
          />
        </div>
        <div>
          <label className="block text-white/80 mb-2">Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="JavaScript, React, Node.js..."
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || uploadingImage}
          className="btn-primary w-full flex items-center justify-center space-x-2 p-3 rounded-lg"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full px-6 py-2 shadow-md hover:from-purple-600 hover:to-blue-500 transition-all duration-300">
              <FiSave size={18} />
              <span>Save Changes</span>
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProfileEditor;

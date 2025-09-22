import { useState, useEffect } from "react";
import { profileAPI } from "../services/api";
import ProfileEditor from "../components/profile/ProfileEditor";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleToggleEdit = () => setIsEditing(!isEditing);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await profileAPI.getProfile();
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isEditing]); // re-fetch after edit

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!isEditing ? (
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto text-center">
          <img
            src={
              user.photoUrl?.startsWith("/uploads")
                ? `http://localhost:3001${user.photoUrl}`
                : user.photoUrl
            }
            alt={user.firstName}
            className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-blue-200 shadow-md"
          />

          <h2 className="mt-4 text-3xl font-bold text-gray-800">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-gray-500">{user.email}</p>

          {user.age && (
            <p className="text-gray-600 mt-2">{user.age} years old</p>
          )}

          {user.about && (
            <p className="text-gray-700 mt-4 italic">“{user.about}”</p>
          )}

          {user.skills?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleToggleEdit}
            className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <ProfileEditor
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
        />
      )}
    </div>
  );
};

export default ProfilePage;

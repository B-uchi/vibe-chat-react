import React, { useEffect, useRef, useState } from "react";
import { MdOutlineSecurity, MdPhotoCamera } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { connect } from "react-redux";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebaseConfig";
import { useAuth } from "../lib/hooks/useAuth";
import { updateCurrentUser } from "../redux/userReducer/userAction";
import { toast, Toaster } from "sonner";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";

const Settings = ({ currentUser, updateCurrentUser }) => {
  const user = useAuth().user;
  const [page, setPage] = useState("profile");
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const fileInputRef = useRef(null);
  const [activeButton, setActiveBtn] = useState("profile");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const maxLength = name === 'bio' ? 100 : 20;
    
    if (value.length <= maxLength) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateImage = (event) => {
    const image = event.target.files[0];
    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!image) return;

    if (image.size > maxSize) {
      toast.error("Image must be 3MB or less");
      return;
    }

    if (!image.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setProfilePhotoUrl(URL.createObjectURL(image));
    setProfilePhoto(image);
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken(true);

      if (!formData.username && !profilePhoto && !formData.bio) {
        toast.error("At least one field is required");
        return;
      }

      let photoUrl = uploadedPhotoUrl;
      if (profilePhoto) {
        const fileExt = profilePhoto.type.split("/")[1];
        const storageRef = ref(storage, `kyc/${currentUser.id}.${fileExt}`);
        await uploadBytes(storageRef, profilePhoto);
        photoUrl = await getDownloadURL(storageRef);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updateProfile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          profilePhotoUrl: photoUrl,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        updateCurrentUser(data.userData);
        setFormData(prev => ({...prev, username: "", bio: ""}));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: "profile", icon: IoPerson, label: "Profile Settings" },
    { id: "security", icon: MdOutlineSecurity, label: "Security" },
    { id: "privacy", icon: RiGitRepositoryPrivateFill, label: "Privacy" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 p-6 border-r border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
            <nav className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    page === item.id 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {page === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                
                {/* Profile Photo */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                      <img 
                        src={profilePhotoUrl || currentUser?.profileData.profilePhoto} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition"
                    >
                      <MdPhotoCamera className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={validateImage}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={currentUser?.profileData.username}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {20 - (formData.username?.length || 0)} characters remaining
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder={currentUser?.profileData.bio}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {100 - (formData.bio?.length || 0)} characters remaining
                    </p>
                  </div>

                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {page === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                <div className="space-y-4">
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition">
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  updateCurrentUser: (user) => dispatch(updateCurrentUser(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);

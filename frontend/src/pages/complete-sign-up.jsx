import Spinner from "../components/Spinner";
import { useAuth } from "../lib/hooks/useAuth.jsx";
import { db, auth, storage } from "../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { CiCamera } from "react-icons/ci";
import { MdErrorOutline } from "react-icons/md";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CompleteSignup = () => {
  const user = useAuth().user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.data()?.profileData?.username) {
            setLoading(false);
            navigate("/");
          } else {
            setUserId(user.uid); // Fix: Use user.uid directly
            setLoading(false);
          }
        } catch (error) {
          console.error(error);
          setLoadingError(true);
          setLoading(false);
          toast.error("An error occurred, please refresh page");
        }
      } else {
        setLoading(false);
        navigate("/sign-in");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const selectProfilePhoto = () => {
    fileInputRef.current.click();
  };

  function validateImage(event) {
    const image = event.target.files[0];
    if (!image) return;

    if (image.size > 3 * 1024 * 1024) {
      toast.error("Image must be 3MB or less");
      fileInputRef.current.value = "";
      return;
    }

    if (!image.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      fileInputRef.current.value = "";
      return;
    }

    setProfilePhotoUrl(URL.createObjectURL(image));
    setProfilePhoto(image);
  }

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;
    return usernameRegex.test(username) && !username.includes(" ");
  };

  const completeSignup = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setError(false);
    
    // Validate username
    if (!username) {
      toast.error("Username is required");
      return;
    }

    if (!validateUsername(username)) {
      setError(true);
      toast.error("Invalid username format");
      return;
    }

    // Validate profile photo
    if (!profilePhoto) {
      toast.error("Please select a profile photo");
      return;
    }

    try {
      setSubmitting(true);

      const idToken = await user.getIdToken(true);

      // Upload photo
      const storageRef = ref(
        storage,
        `profile-photos/${userId}.${profilePhoto.type.split("/")[1]}`
      );

      const uploadResult = await uploadBytes(storageRef, profilePhoto);
      const imgUrl = await getDownloadURL(uploadResult.ref);

      // Complete signup
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/completeSignup`,
        {
          method: "POST",
          body: JSON.stringify({ username, photoId: imgUrl }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/");
      } else if (response.status === 409) {
        toast.error("Username already exists");
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while completing signup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-center p-4">
      <Toaster position="top-right" richColors />
      
      {loading ? (
        <Spinner />
      ) : loadingError ? (
        <div className="text-center bg-white p-6 rounded-lg shadow-md">
          <MdErrorOutline size={50} className="text-red-500 mx-auto mb-4" />
          <p className="mb-4 text-gray-700">An error occurred, please try again</p>
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="font-rowdies text-3xl font-bold text-gray-800 mb-2">
            Welcome to Vibe
          </h1>
          <p className="text-gray-600 mb-6">
            Let's create your profile to get started
          </p>

          <div className="mb-8">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={validateImage}
              className="hidden"
            />
            
            <button 
              onClick={selectProfilePhoto}
              className="w-32 h-32 mx-auto block rounded-full overflow-hidden relative hover:opacity-90 transition-opacity"
            >
              {profilePhotoUrl ? (
                <>
                  <img
                    src={profilePhotoUrl}
                    className="w-full h-full object-cover"
                    alt="Profile preview"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <CiCamera size={30} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <CiCamera size={40} className="text-gray-400" />
                </div>
              )}
            </button>
          </div>

          <form onSubmit={completeSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose your username
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">vibe.com/@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.trim());
                    setError(false);
                  }}
                  placeholder="username"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                Username requirements:
                <ul className="list-disc list-inside mt-1">
                  <li>4-16 characters long</li>
                  <li>Letters and numbers only</li>
                  <li>No spaces or special characters</li>
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-md font-medium text-white transition-colors
                ${submitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompleteSignup;

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.data().profileData.username) {
            setLoading(false);
            navigate("/");
          } else {
            setUserId(userDoc.data()?.id);
            setLoading(false);
          }
        } catch (error) {
          console.log(error);
          setLoadingError(true);
          setLoading(false);
          toast.error("An error occured, please refresh page");
        }
      } else {
        setLoading(false);
        navigate("/sign-in");
      }
      setAuthLoading(false); // Auth state check complete
    });

    return () => unsubscribe();
  }, [navigate]);

  const selectProfilePhoto = () => {
    fileInputRef.current.click();
  };

  function validateImage(event) {
    const image = event.target.files[0];
    if (image && image.size <= 3 * 1024 * 1024) {
      if (!image.type.startsWith("image/")) {
        alert("Please select a valid image file (3MB or less).");
        fileInputRef.current.value = "";
      } else {
        setProfilePhotoUrl(URL.createObjectURL(image));
        setProfilePhoto(image);
      }
    }
  }

  const completeSignup = async (e) => {
    e.preventDefault()
    setUploading(true);

    const usernameRegex = /^[a-zA-Z0-9]{4,16}$/;

    const idToken = await user.getIdToken(true);

    if (!username) {
      setUploading(false)
      return toast.error("Username is required");
    }

    if (!usernameRegex.test(username) || username.includes(" ")) {
      toast.error("Invalid Username");
      setUploading(false)
      return setError(true);
    }

    if (!profilePhoto) {
      setUploading(false);
      return toast.error("Please select a profile photo.");
    }

    const storageRef = ref(
      storage,
      `kyc/${userId}.${profilePhoto.type.split("/")[1]}`
    );

    await uploadBytes(storageRef, profilePhoto).then(async (snapshot) => {
      const imgUrl = await getDownloadURL(storageRef);
      setUploading(false);
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/api/user/completeSignup",
          {
            method: "POST",
            body: JSON.stringify({ username, photoId: imgUrl }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (response.status == 200) {
          navigate("/");
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        toast.error("An error occured while uploading data.");
        console.log(error.message);
      }
    });
  };

  return (
    <div className="relative h-[100vh] bg-[#efefef] flex justify-center items-center">
      <Toaster position="top-right" richColors />
      {loading ? (
        <Spinner />
      ) : loadingError ? (
        <div className="absolute font-poppins flex flex-col items-center">
          <MdErrorOutline size={50} color="red" />
          <p>An error occured, please try again.</p>
          <button
            className="bg-[#313131] p-2 text-white rounded-md mt-2"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-md border-[1px] border-[#3333333a] shadow flex flex-col">
          <h1 className="font-rowdies text-3xl font-bold text-[#333333]">
            Welcome Onboard...
          </h1>
          <p className="font-poppins">
            Great to have you! Now let&apos;s get you set up.
          </p>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={validateImage}
            className="hidden"
          />
          {profilePhotoUrl && (
            <button className="relative mx-auto" onClick={selectProfilePhoto}>
              <img
                src={profilePhotoUrl}
                className="w-[80px] rounded-full h-[80px] "
                alt=""
              />
              <div className="absolute top-[0%] bg-slate-200 w-full h-full rounded-full flex justify-center items-center bg-opacity-30">
                <CiCamera size={25} color="black" />
              </div>
            </button>
          )}
          {!profilePhotoUrl && (
            <button
              onClick={selectProfilePhoto}
              className="bg-[#efefef] w-fit mx-auto rounded-full p-7 mt-3"
            >
              <CiCamera size={45} />
            </button>
          )}
          <form className="" onSubmit={(e) => completeSignup(e)}>
            <div className="flex items-center mt-5 gap-2">
              <p>vibe.com/@</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="border-[1px] border-[#3333333a] p-2 flex-grow rounded-md font-rowdies"
              />
            </div>
            {error && (
              <div className="text-red-600">
                <small>Username should contain:</small>
                <ul className="list-inside list-disc">
                  <li>
                    <small>4-16 characters</small>
                  </li>
                  <li>
                    <small>Alphanumeric characters</small>
                  </li>
                  <li>
                    <small>No symbols or white space</small>
                  </li>
                </ul>
              </div>
            )}
            <button
              type="submit"
              onClick={(e) => {
                completeSignup(e);
              }}
              className="hover:bg-[#3333339f] bg-[#333333] text-white rounded-md font-rowdies w-full p-2 mt-5 flex items-center justify-center gap-3"
            >
              Continue {uploading && <div className="loader"></div>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompleteSignup;

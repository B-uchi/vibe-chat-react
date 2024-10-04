import React, { useEffect, useRef, useState } from "react";
import { MdOutlineSecurity } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { CiCamera } from "react-icons/ci";
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
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef(null);
  const [charactersLeftBio, setCharactersLeftBio] = useState(100);
  const [charactersLeftUname, setCharactersLeftUname] = useState(20);
  const [activeButton, setActiveBtn] = useState("profile");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateImage = (event) => {
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
  };

  const selectImage = () => {
    fileInputRef.current.click();
  };

  const handleBtnClick = (page) => {
    setPage(page);
    setActiveBtn(page);
  };

  const updateProfile = async () => {
    setLoading(true);
    const idToken = await user.getIdToken(true);

    if (!username && !profilePhoto && !bio) {
      toast("At least one field is required");
      setLoading(false);
      return;
    }

    if (profilePhoto) {
      const storageRef = ref(
        storage,
        `kyc/${currentUser.id}.${profilePhoto.type.split("/")[1]}`
      );
      await uploadBytes(storageRef, profilePhoto).then(async (snapshot) => {
        const imgUrl = await getDownloadURL(storageRef);
        setUploadedPhotoUrl(imgUrl);
      });
    }

    const response = await fetch(
      "https://vibe-chat-react.onrender.com/api/user/updateProfile",
      {
        method: "PATCH",
        body: JSON.stringify({
          username,
          bio,
          profilePhotoUrl: uploadedPhotoUrl,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const data = await response.json();
    if (response.status == 200) {
      toast.success("Changes saved successfully");
      console.log(data.userData);
      updateCurrentUser(data.userData);
      setUsername("");
      setBio("");
      setLoading(false);
    } else if (response.status == 409) {
      toast.error(data.message);
      setLoading(false);
    } else {
      toast.error("An error occured when updating profile");
      console.log(data.message);
      setLoading(false);
    }
  };

  // implement offline feature
  // implement typing, delivered and seen notification,
  // implement message queue

  return (
    <div className="bg-[#efefef] h-full flex justify-center items-center lg:p-0 p-2">
      <Toaster richColors position="top-right" />
      <div className="border-[1px] border-[#e1e1e1] lg:w-1/2 rounded-md p-3 bg-white h-[80%] flex">
        <div className="p-3 border-r-[1px] border-[#e1e1e1] lg:w-[30%] h-full flex flex-col items-start gap-2">
          <h1 className="text-2xl hidden lg:block font-bold font-poppins">
            Settings
          </h1>
          <button
            onClick={() => handleBtnClick("profile")}
            className={`flex p-3 items-center gap-3 hover:bg-[#efefef] w-full rounded-md ${
              activeButton == "profile" ? " bg-[#efefef] " : ""
            }`}
          >
            <IoPerson size={22} />{" "}
            <span className="lg:block hidden">Profile Settings</span>
          </button>
          <button
            onClick={() => handleBtnClick("security")}
            className={`flex p-3 items-center gap-3 hover:bg-[#efefef] w-full rounded-md ${
              activeButton == "security" ? " bg-[#efefef] " : ""
            }`}
          >
            <MdOutlineSecurity size={22} />{" "}
            <span className="lg:block hidden">Security</span>{" "}
          </button>
          <button
            className={`flex p-3 items-center gap-3 hover:bg-[#efefef] w-full rounded-md ${
              activeButton == "privacy" ? " bg-[#efefef] " : ""
            }`}
          >
            <RiGitRepositoryPrivateFill size={22} />{" "}
            <span className="lg:block hidden">Privacy</span>{" "}
          </button>
        </div>
        <div className="h-full flex-grow p-3 overflow-scroll">
          {page === "profile" && (
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold font-poppins">
                Profile Settings
              </h1>
              <div className="">
                {currentUser && currentUser.profileData.profilePhoto ? (
                  <div
                    style={{
                      backgroundImage: `url(${
                        profilePhotoUrl
                          ? profilePhotoUrl
                          : currentUser.profileData.profilePhoto
                      })`,
                    }}
                    className="mx-auto bg-cover bg-no-repeat bg-center rounded-full w-[120px] h-[120px] border-[1px] border-[#e1e1e1] bg-[#efefef] flex items-center justify-center cursor-pointer"
                  >
                    <button
                      onClick={() => selectImage()}
                      className="bg-white bg-opacity-50 rounded-full p-2"
                    >
                      <CiCamera size={30} />{" "}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={validateImage}
                        className="hidden"
                      />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => selectImage()}
                    className="mx-auto bg-[#efefef] w-[120px] h-[120px] rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <CiCamera size={30} />
                  </div>
                )}
              </div>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  placeholder={currentUser && currentUser.profileData.username}
                  value={username}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setUsername(e.target.value);
                      setCharactersLeftUname(100 - e.target.value.length);
                    }
                  }}
                  className="w-full p-2 border-[1px] border-[#e1e1e1] rounded-md"
                />
              </div>
              <div className="">
                <div>
                  <label>Bio</label>
                  <textarea
                    placeholder={currentUser && currentUser.profileData.bio}
                    rows={3}
                    value={bio}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        setBio(e.target.value);
                        setCharactersLeftBio(100 - e.target.value.length);
                      }
                    }}
                    className="w-full p-2 border-[1px] border-[#e1e1e1] resize-none rounded-md"
                  />
                </div>
                <small>Characters Left: {charactersLeftBio}/100</small>
              </div>
              <button
                onClick={() => updateProfile()}
                className="bg-[#333] text-white p-2 rounded-md flex items-center justify-center gap-3"
              >
                Save {loading && <div className="loader"></div>}
              </button>
            </div>
          )}
          {page === "security" && (
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold font-poppins">
                Security Settings
              </h1>
              <div>
                <label>Current Password</label>
                <input
                  type="password"
                  className="w-full p-2 border-[1px] border-[#e1e1e1] rounded-md"
                />
              </div>
              <div>
                <label>New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border-[1px] border-[#e1e1e1] rounded-md"
                />
              </div>
              <div>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="w-full p-2 border-[1px] border-[#e1e1e1] rounded-md"
                />
              </div>

              <button className="bg-[#333] text-white p-2 rounded-md">
                Save
              </button>
            </div>
          )}
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

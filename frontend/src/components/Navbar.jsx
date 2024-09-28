import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import { RxCaretDown, RxCaretUp } from "react-icons/rx";
import { IoSettingsOutline } from "react-icons/io5";
import { GoSignOut } from "react-icons/go";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { clearCurrentUser } from "../redux/userReducer/userAction";

const Navbar = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(({ user }) => user.currentUser);
  console.log(currentUser)
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        setShowDropdown(false);
        dispatch(clearCurrentUser());
        navigate("/sign-in");
      })
      .catch((error) => {
        console.log(error);
        toast.error("An error occurred. Please try again.");
      });
  };

  return (
    <nav className="bg-[#313131] w-full relative">
      <div className="container mx-auto text-white flex justify-between items-center p-2">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="cursor-pointer"
        >
          <h1 className="font-bold font-rowdies text-2xl">Vibe Chat</h1>
        </div>
        <div className="font-poppins">
          <button
            className="flex gap-1 items-center"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {currentUser && !currentUser.profileData.profilePhoto ? (
              <FaRegUserCircle size={24} />
            ) : (
              <img
                className="w-[30px] h-[30px] rounded-full"
                src={`${currentUser && currentUser.profileData.profilePhoto}?${new Date().getTime()}`}
              />

            )}
            {showDropdown ? <RxCaretUp size={24} /> : <RxCaretDown size={24} />}
          </button>
        </div>
      </div>
      {showDropdown && (
        <div className="absolute lg:right-5 bottom-0 right-2 translate-y-[120%] bg-white shadow-md p-2 rounded-md w-[200px]">
          <ul className="flex flex-col font-poppins">
            <li
              onClick={() => {
                navigate("/settings");
                setShowDropdown(false);
              }}
              className="border-b-[1px] border-b-slate-300 p-2 flex gap-1 items-center cursor-pointer hover:bg-[#efefef] rounded-t-md"
            >
              <IoSettingsOutline /> Settings
            </li>
            <li
              onClick={signOutUser}
              className="p-2 flex gap-1 items-center cursor-pointer hover:bg-[#efefef] rounded-b-md"
            >
              <GoSignOut />
              Sign Out
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

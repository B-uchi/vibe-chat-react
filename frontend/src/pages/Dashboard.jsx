import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import Chats from "../components/Chats";
import ChatWindow from "../components/ChatWindow";
import { IoSearch } from "react-icons/io5";
import { IoMdArrowBack } from "react-icons/io";
import { useAuth } from "../lib/hooks/useAuth";
import { setActiveChat } from "../redux/chatReducer/chatAction";
import { connect } from "react-redux";
import AddUserLoader from "../components/AddUserLoader";

const Dashboard = ({ currentUser }) => {
  const [addPersonModal, setAddPersonModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatCreated, setChatCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useAuth().user;

  const fetchOtherUsers = async () => {
    const idToken = await user.getIdToken(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/getOtherUsers`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    if (response.status == 200) {
      const data = await response.json();
      setLoading(false);
      setUsers(data.otherUsers);
    } else {
      setLoading(false);
    }
  };

  const createChat = async (id, username, profilePhoto, onlineStatus) => {
    const idToken = await user.getIdToken(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/createChat`, {
      method: "POST",
      body: JSON.stringify({ otherUserId: id }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = await response.json();
    if (response.status == 201) {
      toast.success("Chat created");
      setChatCreated(!chatCreated);
      setActiveChat({
        username,
        profilePhoto,
        onlineStatus,
        chatId: data.chatId,
        participantId: id,
        isFriend: data.chatData.isFriend,
        initiatedBy: data.chatData.initiatedBy,
      });
      setAddPersonModal(false);
    } else {
      if (response.status == 409) {
        return toast("Chat already exists");
      }
      if (response.status == 400) {
        return toast(data.message);
      }
      toast.error("Error creating chat");
      console.log("Error creating chat");
    }
  };

  const unblockUser = async (userId) => {
    toast.loading("Unblocking user...");
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/unblockUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userToUnblockId: userId }),
      });

      if (response.ok) {
        toast.dismiss();
        toast.success("User unblocked successfully");
        fetchOtherUsers(); 
      } else {
        toast.dismiss();
        toast.error("Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
    }
  };

  return (
    <div className="flex-1 flex bg-[#efefef] h-full relative overflow-y-hidden">
      <Toaster richColors position="top-right" />
      <div className="bg-[#ffffff] lg:w-[30%] relative w-full md:w-[50%] border-r-[1px] border-r-[#d3d2d2]">
        <Chats chatCreated={chatCreated} />
        <div className="absolute right-10 bottom-10">
          <div>
            <button
              onClick={() => {
                setAddPersonModal(true);
                fetchOtherUsers();
              }}
              className="shadow-lg p-2 flex justify-center items-center rounded-full bg-[#313131] text-white hover:bg-[#686868] transition-all"
            >
              <FiPlus size={40} />
            </button>
          </div>
        </div>
      </div>
      <div className="md:flex-grow hidden md:block md:w-[50%] lg:w-[70%]">
        {window.innerWidth > 768 && <ChatWindow />}
      </div>
      {addPersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl lg:w-1/3 min-w-[320px] max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAddPersonModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoMdArrowBack size={20} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-semibold">Start a Chat</h1>
              </div>
              
              {/* Search Bar */}
              <div className="mt-4">
                <div className="relative">
                  <IoSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
              {loading ? (
                <AddUserLoader />
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (!currentUser.blocked.includes(user.id)) {
                        createChat(
                          user.id,
                          user.username,
                          user.profilePhoto,
                          user.onlineStatus
                        );
                      }
                    }}
                    className="group flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <img
                          src={user.profilePhoto}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        {user.onlineStatus && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {user.bio || "No bio available"}
                        </p>
                      </div>
                    </div>
                    
                    {currentUser.blocked.includes(user.id) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          unblockUser(user.id);
                        }}
                        className="px-4 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      >
                        Unblock
                      </button>
                    )}
                    {user.blocked.includes(currentUser.id) && (
                      <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                        Blocked
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <p className="text-lg">No users found</p>
                  <p className="text-sm">Try searching for someone else</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setActiveChat: () => dispatch(setActiveChat()),
});

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

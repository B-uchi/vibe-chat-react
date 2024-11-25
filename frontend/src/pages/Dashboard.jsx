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

const Dashboard = ({ currentUser, setActiveChat }) => {
  const [addPersonModal, setAddPersonModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatCreated, setChatCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const user = useAuth().user;

  const fetchOtherUsers = async () => {
    try {
      setLoading(true);
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

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (id, username, profilePhoto, onlineStatus) => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/createChat`,
        {
          method: "POST",
          body: JSON.stringify({ otherUserId: id }),
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("Chat already exists");
          return;
        }
        throw new Error(data.message || "Failed to create chat");
      }

      toast.success("Chat created successfully");
      setChatCreated(prev => !prev);
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
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error(error.message || "Failed to create chat");
    }
  };

  const unblockUser = async (userId) => {
    const toastId = toast.loading("Unblocking user...");
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/unblockUser`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ userToUnblockId: userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unblock user");
      }

      toast.dismiss(toastId);
      toast.success("User unblocked successfully");
      await fetchOtherUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.dismiss(toastId);
      toast.error(error.message || "Failed to unblock user");
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

              <div className="mt-4">
                <div className="relative">
                  <IoSearch
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
              {loading ? (
                <AddUserLoader />
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      const canCreateChat = !user.connections[currentUser.id] || 
                        (user.connections[currentUser.id] !== "friends" && 
                         user.connections[currentUser.id] !== "blocked");
                      
                      if (canCreateChat) {
                        createChat(
                          user.id,
                          user.username,
                          user.profilePhoto,
                          user.onlineStatus
                        );
                      }
                    }}
                    className={`group flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      user.connections[currentUser.id] === "friends" ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <img
                          src={user.profilePhoto}
                          alt={user.username}
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

                    {!currentUser.blockedBy.includes(user.id) && currentUser.connections[user.id] === "blocked" && (
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
                    {currentUser.blockedBy.includes(user.id) && (
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
  setActiveChat: (chatData) => dispatch(setActiveChat(chatData)),
});

const mapStateToProps = ({ user }) => ({
  currentUser: user.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

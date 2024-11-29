import { IoSearch, IoSettingsOutline } from "react-icons/io5";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";
import { MdOutlinePersonAdd } from "react-icons/md";
import Conversation from "./Conversation";
import { connect, useDispatch } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setActiveChat,
  setChatRequests,
  setUserChats,
} from "../redux/chatReducer/chatAction";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { toast } from "sonner";
import { auth, db } from "../lib/firebaseConfig";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ChatSkeletonLoader from "./ChatSkeletonLoader";
import { GoSignOut } from "react-icons/go";
import { signOut } from "firebase/auth";

const Chats = ({
  setActiveChat,
  clearActiveChat,
  setUserChats,
  chatRequests,
  setChatRequests,
  userChats,
  chatCreated,
  clearMessages,
  activeChat,
  rerender,
}) => {
  const [loading, setLoading] = useState(true);
  const [requestTabLoading, setRequestTabLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const navigate = useNavigate();
  const [tab, setTab] = useState("chats");
  const [filteredChats, setFilteredChats] = useState(userChats);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useAuth().user;
  const dispatch = useDispatch();

  const fetchChatRequests = async () => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/getRequests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.status == 200) {
        const data = await response.json();
        setChatRequests(data.chatRequests);
        setRequestTabLoading(false);
        setError(false);
      } else {
        setRequestTabLoading(false);
        setError(true);
      }
    } catch (error) {
      toast.error("A network error occured. Couldn't fetch message requests");
      setRequestTabLoading(false);
      setError(true);
    }
  };

  const fetchUserChats = async () => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/getChats`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.status == 200) {
        const data = await response.json();
        setUserChats(data.chats);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(true);
      }
    } catch (error) {
      toast.error("A network error occured. Couldn't fetch chats");
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    fetchChatRequests();
    fetchUserChats();
  }, [chatCreated, rerender]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      ),
      (doc) => {
        doc.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const modifiedChatId = change.doc.id;
            const modifiedChatData = change.doc.data();

            let matchingChatIndex = -1;
            if (userChats) {
              matchingChatIndex = userChats.findIndex(
                (userChat) => userChat.chatId === modifiedChatId
              );
            }

            let matchingRequestIndex = -1;
            if (chatRequests) {
              matchingRequestIndex = chatRequests.findIndex(
                (chatRequest) => chatRequest.chatId === modifiedChatId
              );
            }

            if (matchingRequestIndex !== -1) {
              chatRequests[matchingRequestIndex] = {
                ...chatRequests[matchingRequestIndex],
                lastMessage: modifiedChatData.lastMessage,
                lastMessageTimeStamp: modifiedChatData.lastMessageTimeStamp,
                lastSender: modifiedChatData.lastSender,
              };
              console.log("chatRequests+: ", chatRequests);
              setChatRequests([...chatRequests]); // Trigger a re-render
            }

            if (matchingChatIndex !== -1) {
              userChats[matchingChatIndex] = {
                ...userChats[matchingChatIndex],
                lastMessage: modifiedChatData.lastMessage,
                lastMessageTimeStamp: modifiedChatData.lastMessageTimeStamp,
                lastSender: modifiedChatData.lastSender,
              };
              setUserChats([...userChats]); // Trigger a re-render
            }
          } else if (change.type === "removed") {
            fetchUserChats();
            fetchChatRequests();
          }
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [userChats, activeChat]);

  const openChatWindow = (chatDetails) => {
    if (activeChat) {
      if (activeChat.chatId != chatDetails.chatId) {
        clearMessages();
        setActiveChat(chatDetails);
      } else if (
        activeChat.chatId == chatDetails.chatId &&
        window.innerWidth < 769
      ) {
        clearActiveChat();
        setActiveChat(chatDetails);
        navigate(`/chat/${chatDetails.chatId}`);
      }
    } else {
      if (window.innerWidth < 769) {
        setActiveChat(chatDetails);
        navigate(`/chat/${chatDetails.chatId}`);
      } else {
        setActiveChat(chatDetails);
      }
    }
  };

  const handleTabClick = (tab) => {
    setTab(tab);
    setActiveTab(tab);
  };

  const searchChat = (e) => {
    e.preventDefault();
    setFilteredChats(
      userChats.filter((chat) =>
        chat.participantsData.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  };

  useEffect(() => {
    const chatListReset = () => {
      if (!searchTerm) {
        setFilteredChats(userChats);
      }
    };
    chatListReset();
  }, [searchTerm]);

  const signOutUser = async () => {
    try {
      const idToken = await user.getIdToken(true);
      await fetch(`${import.meta.env.VITE_API_URL}/api/user/updateStatus`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ status: false }),
      });

      await signOut(auth);
      sessionStorage.clear();
      dispatch(clearCurrentUser());
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <section className="p-3 font-poppins h-full flex flex-col bg-white rounded-lg shadow-sm">
      <div className="h-[90px]">
        <div className="flex items-center gap-2 w-full">
          <form
            onSubmit={searchChat}
            className="flex-1 p-2 bg-[#f5f5f5] rounded-lg flex items-center transition-all hover:bg-[#efefef] focus-within:bg-[#efefef] focus-within:shadow-md"
          >
            <button
              type="submit"
              className="mr-2 text-gray-500"
              onClick={searchChat}
              title="Search"
            >
              <IoSearch size={20} />
            </button>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="bg-transparent flex-grow p-1 outline-none placeholder:text-gray-400"
            />
          </form>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <IoSettingsOutline size={20} />
          </button>
          <button
            type="button"
            onClick={signOutUser}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <GoSignOut size={20} />
          </button>
        </div>
        <div className="flex w-full justify-between mt-3 border-b border-gray-200">
          <button
            onClick={() => handleTabClick("chats")}
            className={`flex items-center justify-center gap-2 text-center w-1/2 p-2 transition-all ${
              activeTab == "chats"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {activeTab === "chats" ? <BsChatDotsFill /> : <BsChatDots />}
            Friends
          </button>
          <button
            onClick={() => handleTabClick("requests")}
            className={`flex items-center justify-center gap-2 text-center w-1/2 p-2 transition-all ${
              activeTab == "requests"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MdOutlinePersonAdd />
            Requests
            {chatRequests && chatRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {chatRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>
      {tab == "chats" ? (
        <div className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h2 className="font-bold text-xl text-gray-800">Recent Chats</h2>
          </div>
          {loading ? (
            <ChatSkeletonLoader />
          ) : error ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              An error occurred
            </div>
          ) : userChats && userChats.length > 0 ? (
            <div className="space-y-2">
              {userChats.map((chat) => (
                <Conversation
                  key={chat.chatId}
                  onClick={openChatWindow}
                  data={{
                    participantId: chat.participantsData.id,
                    chatId: chat.chatId,
                    onlineStatus: chat.participantsData.onlineStatus,
                    lastMessage: chat.lastMessage,
                    lastSender: chat.lastSender,
                    username: chat.participantsData.username,
                    timestamp: chat.lastMessageTimeStamp,
                    profilePhoto: chat.participantsData.profilePhoto,
                    isFriend: chat.isFriend,
                    initiatedBy: chat.initiatedBy,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
              <BsChatDots size={40} className="mb-2" />
              <p>No chats found</p>
            </div>
          )}
        </div>
      ) : null}
      {tab == "requests" ? (
        <div className="overflow-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h2 className="font-bold text-xl text-gray-800">
              Message Requests
            </h2>
          </div>
          {requestTabLoading ? (
            <ChatSkeletonLoader />
          ) : error ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              An error occurred
            </div>
          ) : chatRequests && chatRequests.length > 0 ? (
            <div className="space-y-2">
              {chatRequests.map((chat) => (
                <Conversation
                  key={chat.chatId}
                  onClick={openChatWindow}
                  data={{
                    participantId: chat.participantsData.id,
                    chatId: chat.chatId,
                    onlineStatus: chat.participantsData.onlineStatus,
                    lastMessage: chat.lastMessage,
                    lastSender: chat.lastSender,
                    username: chat.participantsData.username,
                    timestamp: chat.lastMessageTimeStamp,
                    profilePhoto: chat.participantsData.profilePhoto,
                    isFriend: chat.isFriend,
                    initiatedBy: chat.initiatedBy,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
              <MdOutlinePersonAdd size={40} className="mb-2" />
              <p>No requests found</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setActiveChat: (chat) => dispatch(setActiveChat(chat)),
  setUserChats: (chatList) => dispatch(setUserChats(chatList)),
  setChatRequests: (chatRequestList) =>
    dispatch(setChatRequests(chatRequestList)),
  clearActiveChat: () => dispatch(clearActiveChat()),
  clearMessages: () => dispatch(clearMessages()),
});

const mapStateToProps = ({ chat }) => ({
  userChats: chat.userChats,
  chatRequests: chat.chatRequests,
  activeChat: chat.activeChat,
  rerender: chat.rerender,
});

export default connect(mapStateToProps, mapDispatchToProps)(Chats);

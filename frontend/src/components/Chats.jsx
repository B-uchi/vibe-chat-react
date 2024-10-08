import { IoSearch } from "react-icons/io5";
import Conversation from "./Conversation";
import { connect } from "react-redux";
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
import { db } from "../lib/firebaseConfig";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ChatSkeletonLoader from "./ChatSkeletonLoader";

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
}) => {
  const [loading, setLoading] = useState(true);
  const [requestTabLoading, setRequestTabLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const navigate = useNavigate();
  const [tab, setTab] = useState("chats");
  const [filteredChats, setFilteredChats] = useState(userChats);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useAuth().user;

  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const idToken = await user.getIdToken(true);
        const response = await fetch(
          "https://vibe-chat-react.onrender.com/api/user/getChats",
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
          console.log(data)
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

    const fetchChatRequests = async () => {
      try {
        const idToken = await user.getIdToken(true);
        const response = await fetch(
          "https://vibe-chat-react.onrender.com/api/user/getRequests",
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

    fetchChatRequests();
    fetchUserChats();
  }, [chatCreated]);

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

            if (matchingChatIndex !== -1) {
              userChats[matchingChatIndex] = {
                ...userChats[matchingChatIndex],
                lastMessage: modifiedChatData.lastMessage,
                lastMessageTimeStamp: modifiedChatData.lastMessageTimeStamp,
              };
              setUserChats([...userChats]); // Trigger a re-render
            }
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

  return (
    <section className="p-3 font-poppins h-full flex flex-col">
      <div className="h-[90px]">
        <form
          onSubmit={searchChat}
          className="w-full p-1 bg-[#efefef] rounded-md flex items-center"
        >
          <button type="submit" className="mr-2" onClick={searchChat}>
            <IoSearch size={25} />
          </button>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="bg-transparent flex-grow p-1 outline-none"
          />
        </form>
        <div className="flex w-full justify-between mt-3 border-b-[1px]">
          <button
            onClick={() => handleTabClick("chats")}
            className={`text-center w-1/2 p-2 border-r-[1px] rounded-tl-md ${
              activeTab == "chats" ? " bg-[#efefef] " : " hover:bg-[#efefef]"
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => handleTabClick("requests")}
            className={`text-center w-1/2 p-2 font-bold rounded-tr-md ${
              activeTab == "requests" ? " bg-[#efefef] " : " hover:bg-[#efefef]"
            }`}
          >
            Requests {chatRequests && chatRequests.length > 0 ? `(${chatRequests.length})` : "(0)"}
          </button>
        </div>
      </div>
      {tab == "chats" ? (
        <div className="overflow-auto flex-grow">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h2 className="font-bold text-2xl">Chats</h2>
          </div>
          {loading ? (
            // <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
            <ChatSkeletonLoader />
          ) : error ? (
            <div className="absolute right-[50%] bottom-[50%] translate-x-[50%]">
              An error occured
            </div>
          ) : userChats && userChats.length > 0 ? (
            userChats.map((chat) => (
              <Conversation
                key={chat.chatId}
                onClick={openChatWindow}
                data={{
                  participantId: chat.participantsData.id,
                  chatId: chat.chatId,
                  onlineStatus: chat.participantsData.onlineStatus,
                  lastMessage: chat.lastMessage,
                  username: chat.participantsData.username,
                  timestamp: chat.lastMessageTimeStamp,
                  profilePhoto: chat.participantsData.profilePhoto,
                  isFriend: chat.isFriend,
                }}
              />
            ))
          ) : (
            <p className="mt-2">No chats found...</p>
          )}
        </div>
      ) : null}
      {tab == "requests" ? (
        <div className="overflow-auto flex-grow">
          <div className="flex items-center justify-between mt-3 mb-2">
            <h2 className="font-bold text-2xl">Message Requests</h2>
          </div>
          {requestTabLoading ? (
            <ChatSkeletonLoader />
          ) : error ? (
            <div className="absolute right-[50%] bottom-[50%] translate-x-[50%]">
              An error occured
            </div>
          ) : chatRequests && chatRequests.length > 0 ? (
            chatRequests.map((chat) => (
              <Conversation
                key={chat.chatId}
                onClick={openChatWindow}
                data={{
                  participantId: chat.participantsData.id,
                  chatId: chat.chatId,
                  onlineStatus: chat.participantsData.onlineStatus,
                  lastMessage: chat.lastMessage,
                  username: chat.participantsData.username,
                  timestamp: chat.lastMessageTimeStamp,
                  profilePhoto: chat.participantsData.profilePhoto,
                }}
              />
            ))
          ) : (
            <p className="mt-2">No requests found...</p>
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
});
export default connect(mapStateToProps, mapDispatchToProps)(Chats);

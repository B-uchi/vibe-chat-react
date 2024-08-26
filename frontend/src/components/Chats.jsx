import { IoSearch } from "react-icons/io5";
import Conversation from "./Conversation";
import { connect, useSelector } from "react-redux";
import {
  clearMessages,
  setActiveChat,
  setUserChats,
} from "../redux/chatReducer/chatAction";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";

const Chats = ({
  setActiveChat,
  setUserChats,
  userChats,
  chatCreated,
  clearMessages,
  activeChat,
}) => {
  const [loading, setLoading] = useState(true);
  const user = useAuth().user;

  useEffect(() => {
    const fetchUserChats = async () => {
      const idToken = await user.getIdToken(true);
      const response = await fetch("http://localhost:5000/api/user/getChats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.status == 200) {
        const data = await response.json();
        setUserChats(data.chats);
        setLoading(false);
      } else {
        setLoading(false);
      }
      console.log(response.status)
    };
    fetchUserChats();
  }, [chatCreated]);

  const openChatWindow = (chatDetails) => {
    if (activeChat.chatId != chatDetails.chatId) {
      clearMessages();
      setActiveChat(chatDetails);
    }
  };

  return (
    <section className="p-3 font-poppins h-full flex flex-col">
      <div className="h-[130px]">
        <div className="w-full p-1 bg-[#efefef] rounded-md flex items-center">
          <IoSearch size={25} className="mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-grow p-1 outline-none"
          />
        </div>
        <div className="flex w-full justify-between mt-3 border-b-[1px]">
          <button className="text-center w-1/2 p-2 border-r-[1px] bg-[#efefef] rounded-tl-md">
            Friends
          </button>
          <button className="text-center w-1/2 p-2 font-bold hover:bg-[#efefef]">
            Requests (2)
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <h2 className="font-bold text-2xl">Chats</h2>
        </div>
      </div>
      <div className="mt-2 overflow-auto flex-grow">
        {loading ? (
          <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
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
                timestamp: "1:55 pm",
                profilePhoto: chat.participantsData.profilePhoto,
              }}
            />
          ))
        ) : (
          <p className="mt-2">No chats found...</p>
        )}
      </div>
    </section>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setActiveChat: (chat) => dispatch(setActiveChat(chat)),
  setUserChats: (chatList) => dispatch(setUserChats(chatList)),
  clearMessages: () => dispatch(clearMessages()),
});
const mapStateToProps = (state) => ({
  userChats: state.chat.userChats,
  activeChat: state.chat.activeChat,
});
export default connect(mapStateToProps, mapDispatchToProps)(Chats);

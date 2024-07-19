import { IoSearch } from "react-icons/io5";
import Conversation from "./Conversation";
import { connect } from "react-redux";
import { setActiveChat } from "../redux/chatReducer/chatAction";

const Chats = ({ setActiveChat }) => {
  const openChatWindow = (chat) => {
    setActiveChat(chat)
  };

  return (
    <section className="p-3 font-poppins">
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
      <div className="mt-2">
        <Conversation
          onClick={openChatWindow}
          data={{
            lastMessage: "Hey, how are you?",
            name: "John Doe",
            timestamp: "1:55 pm",
            profilePic: "https://randomuser.me/api/portraits/thumb/men/75.jpg",
          }}
        />
        <Conversation
          onClick={openChatWindow}
          data={{
            lastMessage: "Last noght was a blast!!",
            name: "Kevin",
            timestamp: "8:55 am",
            profilePic: "https://randomuser.me/api/portraits/thumb/men/70.jpg",
          }}
        />
        <Conversation
          onClick={openChatWindow}
          data={{
            lastMessage: "Did you get the message?",
            name: "Thomas Kent",
            timestamp: "7:15 am",
            profilePic: "https://randomuser.me/api/portraits/thumb/men/77.jpg",
          }}
        />
      </div>
    </section>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setActiveChat: (chat) => dispatch(setActiveChat(chat)),
});
export default connect(null, mapDispatchToProps)(Chats);

import { connect } from "react-redux";
import { clearActiveChat } from "../redux/chatReducer/chatAction";
import { IoMdArrowBack } from "react-icons/io";

const ChatWindow = ({ activeChat, clearActiveChat }) => {
  console.log(activeChat)
  return (
    <section className="h-full flex flex-col relative">
      {!activeChat ? (
        <p className="font-rowdies absolute right-[50%] bottom-[50%] translate-x-[50%]">
          Click on a chat to catch a vibe
        </p>
      ) : (
          <div className="bg-white p-1 h-[55px] border-b-[#e1e1e1] border-b-[1px] flex items-center font-poppins overflow-hidden">
            <button onClick={() => clearActiveChat()} className="mr-2">
              <IoMdArrowBack size={25}/>
            </button>
            <div className="flex gap-2 ">
              <img src={activeChat.profilePic} alt="" className="rounded-full"/>
              <div className="flex flex-col justify-center">
                <p className="font-bold">{activeChat && activeChat.name}</p>
                <small>Online</small>
              </div>
            </div>
          </div>
      )}
    </section>
  );
};

const mapStateToProps = ({ chat }) => ({
  activeChat: chat.activeChat,
});
const mapDispatchToProps = (dispatch) => ({
  clearActiveChat: () => dispatch(clearActiveChat()),
});
export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow);

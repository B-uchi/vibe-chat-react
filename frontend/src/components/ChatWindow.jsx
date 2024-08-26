import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setMessages,
} from "../redux/chatReducer/chatAction";
import { IoMdArrowBack } from "react-icons/io";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { toast } from "sonner";
import { IoSend } from "react-icons/io5";

const ChatWindow = ({
  activeChat,
  clearActiveChat,
  messages,
  setMessages,
  clearMessages,
}) => {
  const [fetchingMsgs, setFetchingMsgs] = useState(true);
  const [messageBody, setMessageBody] = useState("");
  const user = useAuth().user;

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat) {
        const idToken = await user.getIdToken(true);
        const response = await fetch(
          "http://localhost:5000/api/chat/fetchMessages",
          {
            method: "POST",
            body: JSON.stringify({ chatId: activeChat.chatId }),
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (response.status == 200) {
          const data = await response.json();
          setMessages(data.messages);
          console.log(data.messages);
          setFetchingMsgs(false);
        } else {
          setFetchingMsgs(false);
          toast.error("Error fetching messages");
          console.log("Error fetching messages");
        }
      }
    };

    fetchMessages();
  }, [activeChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const idToken = await user.getIdToken(true);
    const response = await fetch("http://localhost:5000/api/chat/sendMessage", {
      method: "POST",
      body: JSON.stringify({
        messageBody,
        chatId: activeChat.chatId,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (response.status == 201) {
      setMessageBody("");
    } else {
      toast.error("Error sending message.");
    }
  };

  return (
    <section className="h-full flex flex-col relative">
      {!activeChat ? (
        <p className="w-full text-center font-rowdies absolute right-[50%] bottom-[50%] translate-x-[50%]">
          Click on a chat to catch a vibe
        </p>
      ) : (
        <div className="flex flex-col relative h-full">
          <div className="bg-white p-1 h-[55px] border-b-[#e1e1e1] border-b-[1px] flex items-center font-poppins overflow-hidden">
            <button
              onClick={() => {
                clearActiveChat();
                clearMessages();
              }}
              className="mr-2"
            >
              <IoMdArrowBack size={25} />
            </button>
            <div className="flex gap-2 ">
              <img
                src={activeChat.profilePhoto}
                alt=""
                className="rounded-full h-[40px] w-[40px]"
              />
              <div className="flex flex-col justify-center">
                <p className="font-bold">{activeChat && activeChat.username}</p>
                <small>{activeChat.onlineStatus ? "Online" : "Offline"}</small>
              </div>
            </div>
          </div>
          <div className="h-full  p-2 relative flex flex-col">
            {fetchingMsgs ? (
              <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
            ) : (
              <>
                <div className="flex-grow">
                  {messages && messages.length > 0 ? (
                    <div className="bg-red-300 h-full flex items-end">
                      {
                        messages.map((message)=>{
                          if (message.senderId == activeChat.participantId){
                            (<div>{message.message}</div>)
                          }
                        })
                      }
                    </div>
                  ) : (
                    <p className="flex h-full justify-center items-center">
                      No messages found
                    </p>
                  )}
                </div>
                <form
                  onSubmit={(e) => sendMessage(e)}
                  className="p-5 w-full bg-gren-400"
                >
                  <div className="rounded-full lg:w-[80%] mx-auto border-[1px] border-[#bdbdbd] flex items-center">
                    <input
                      type="text"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Enter a message...."
                      className="p-3 pl-5 rounded-l-full bg-transparent w-[92%] outline-none"
                    />
                    <button
                      className="mx-auto flex-grow flex justify-center p-4 rounded-r-full hover:bg-[#e1e1e1]"
                      type="submit"
                      onClick={(e) => sendMessage(e)}
                    >
                      <IoSend />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const mapStateToProps = ({ chat }) => ({
  activeChat: chat.activeChat,
  messages: chat.messages,
});
const mapDispatchToProps = (dispatch) => ({
  clearActiveChat: () => dispatch(clearActiveChat()),
  setMessages: (messages) => dispatch(setMessages(messages)),
  clearMessages: () => dispatch(clearMessages()),
});
export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow);

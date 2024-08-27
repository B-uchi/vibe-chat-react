import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setMessages,
} from "../redux/chatReducer/chatAction";
import { IoMdArrowBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { toast } from "sonner";
import { IoSend } from "react-icons/io5";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { FaArrowDown } from "react-icons/fa6";

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setFetchingMsgs(true);
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
          setFetchingMsgs(false);
          scrollToBottom();
        } else if (response.status == null) {
          console.log(response.statusText);
          setFetchingMsgs(false);
          toast.error("Error fetching messages");
          console.log("Error fetching messages");
        }
      }
    };

    fetchMessages();
  }, [activeChat]);

  // useEffect(() => {
  //   if (activeChat) {
  //     const unsubscribe = onSnapshot(
  //       collection(db, "chats", activeChat.chatId, "messages"),
  //       (querySnapshot) => {
  //         console.log("snapshot", querySnapshot.docs[0]);
  //         const newDocument = querySnapshot
  //           .docChanges()
  //           .find((change) => change.type === "added");

  //         if (newDocument) {
  //           console.log(newDocument.doc.data());
  //         }
  //       }
  //     );
  //     return () => {
  //       unsubscribe();
  //     };
  //   }
  // }, [messages]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 0);

    return () => clearTimeout(timeout);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  function convertTimestampToTime(timestamp) {
    const date = new Date(
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
    );

    if (date.getHours() < 12) {
      return date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      });
    } else {
      return date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      });
    }
  }

  return (
    <section className="h-full flex flex-col relative">
      {!activeChat ? (
        <p className="w-full text-center font-rowdies absolute right-[50%] bottom-[50%] translate-x-[50%]">
          Click on a chat to catch a vibe
        </p>
      ) : (
        <div className="flex flex-col relative h-full">
          <div className="bg-white p-1 h-[8vh] shrink-0 border-b-[#e1e1e1] border-b-[1px] flex items-center font-poppins">
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
          <div className="h-[92vh] max-h-[92vh] p-2 relative flex flex-col overflow-hidden">
            {fetchingMsgs ? (
              <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
            ) : (
              <>
                {messages && messages.length > 0 ? (
                  <div className="overflow-y-auto h-[77vh] flex flex-col gap-5 px-3">
                    {messages.map((message) => {
                      if (message.senderId != activeChat.participantId) {
                        return (
                          <div
                            key={message.id}
                            className="self-end max-w-[70%] relative w-fit"
                          >
                            <div className="shadow-sm bg-white border-[1px] border-[#bdbdbd] rounded-full p-3">
                              {message.message}
                            </div>
                            <small className="absolute right-3 w-[80px] text-right">
                              {convertTimestampToTime(message.timeStamp)}
                            </small>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={message.id}
                            className="self-start max-w-[70%] relative"
                          >
                            <div className="shadow-sm bg-[#313131] text-white border-[1px] border-[#bdbdbd] rounded-full p-3">
                              {message.message}
                            </div>
                            <small className="absolute left-3 w-[80px] text-left">
                              {convertTimestampToTime(message.timeStamp)}
                            </small>
                          </div>
                        );
                      }
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <p className="flex h-full justify-center items-center">
                    No messages found
                  </p>
                )}
                <form
                  onSubmit={(e) => sendMessage(e)}
                  className=" w-full h-[15vh] flex justify-center items-center relative"
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
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute right-1 lg:right-5 p-3 rounded-full bg-[#313131]"
                  >
                    <FaArrowDown color="white" />
                  </button>
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

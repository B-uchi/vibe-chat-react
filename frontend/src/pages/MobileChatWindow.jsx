import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setMessages,
} from "../redux/chatReducer/chatAction";
import { IoMdArrowBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { toast, Toaster } from "sonner";
import { IoEllipsisVertical, IoSend } from "react-icons/io5";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { FaArrowDown } from "react-icons/fa6";
import { Navigate } from "react-router-dom";
import { MdCall } from "react-icons/md";

const MobileChatWindow = ({
  activeChat,
  clearActiveChat,
  messages,
  setMessages,
  clearMessages,
}) => {
  const [fetchingMsgs, setFetchingMsgs] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const user = useAuth().user;
  const messagesEndRef = useRef(null);
  let groupedMessages;

  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     setFetchingMsgs(true);
  //     if (activeChat) {
  //       const idToken = await user.getIdToken(true);
  //       const response = await fetch(
  //         "http://localhost:5000/api/chat/fetchMessages",
  //         {
  //           method: "POST",
  //           body: JSON.stringify({ chatId: activeChat.chatId }),
  //           headers: {
  //             "Content-type": "application/json",
  //             Authorization: `Bearer ${idToken}`,
  //           },
  //         }
  //       );
  //       if (response.status == 200) {
  //         const data = await response.json();
  //         setMessages(data.messages);
  //         setFetchingMsgs(false);
  //         scrollToBottom();
  //       } else if (response.status == null) {
  //         console.log(response.statusText);
  //         setFetchingMsgs(false);
  //         toast.error("Error fetching messages");
  //         console.log("Error fetching messages");
  //       }
  //     }
  //   };

  //   fetchMessages();
  // }, []);

  let firstListen = true;
  useEffect(() => {
    if (activeChat) {
      const unsubscribe = onSnapshot(
        query(
          collection(db, "chats", activeChat.chatId, "messages"),
          orderBy("timeStamp", "desc")
        ),
        (doc) => {
          if (firstListen) {
            firstListen = false;
          } else {
            const newMessage = doc
              .docChanges()
              .find((change) => change.type === "added");
            setMessages([
              ...messages,
              { id: newMessage.doc.id, ...newMessage.doc.data() },
            ]);
          }
        }
      );
      return () => {
        unsubscribe();
      };
    }
  }, [messages]);

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
    if (!messageBody) {
      console.log(true);
      return toast.error("Message can't be empty");
    }
    const idToken = await user.getIdToken(true);
    const response = await fetch(
      "http://localhost:5000/api/chat/sendMessage",
      {
        method: "POST",
        body: JSON.stringify({
          messageBody,
          chatId: activeChat.chatId,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    if (response.status == 201) {
      setMessageBody("");
    } else {
      toast.error("Error sending message.");
    }
  };

  function convertTimestampToTime(timestamp) {
    let seconds, nanoseconds;
    if (timestamp.seconds && timestamp.nanoseconds) {
      seconds = timestamp.seconds;
      nanoseconds = timestamp.nanoseconds;
    }
    seconds = timestamp.seconds || timestamp._seconds;
    nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds;

    const date = new Date(seconds * 1000 + nanoseconds / 1000000);

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

  if (messages) {
    groupedMessages = messages.reduce((acc, message) => {
      let seconds;
      if (message.timeStamp.seconds) {
        seconds = message.timeStamp.seconds;
      } else {
        seconds = message.timeStamp._seconds;
      }

      const messageDate = new Date(seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!acc[messageDate]) {
        acc[messageDate] = [];
      }

      acc[messageDate].push(message);

      return acc;
    }, {});
  }

  return (
    <section className="h-full flex flex-col relative">
      <Toaster position="top-right" richColors />
      {!activeChat ? (
        <Navigate to={"/"} />
      ) : (
        <div className="flex flex-col relative h-screen overflow-hidden">
          <div className="bg-white p-1 h-[8vh] shrink-0 border-b-[#e1e1e1] border-b-[1px] flex items-center font-poppins">
            <div className="w-full p-1 h-[8vh] border-b-[#e1e1e1] border-b-[1px] flex justify-between items-center font-poppins">
              <div className="flex">
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
                    <p className="font-bold">
                      {activeChat && activeChat.username}
                    </p>
                    <small>
                      {activeChat.onlineStatus ? "Online" : "Offline"}
                    </small>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-7 mr-5">
                <button
                  className="hover:bg-[#efefef] p-2 rounded-full"
                  title="Call"
                >
                  <MdCall color="#313131" size={23} />
                </button>
                <button
                  className="hover:bg-[#efefef] p-2 rounded-full"
                  title="More options"
                >
                  <IoEllipsisVertical color="#313131" size={23} />
                </button>
              </div>
            </div>
          </div>
          <div className="h-[92vh] max-h-[92vh] p-2 relative flex flex-col overflow-hidden">
            {fetchingMsgs ? (
              <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
            ) : (
              <>
                {messages && messages.length > 0 ? (
                  <div className="overflow-y-auto h-[83vh] px-3">
                    {Object.keys(groupedMessages).map((date, index) => (
                      <div key={index} className="flex flex-col gap-5">
                        <p className="text-center font-bold text-gray-500 my-4">
                          {date}
                        </p>
                        {groupedMessages[date].map((message) => (
                          <div
                            key={message.id}
                            className={
                              message.senderId !== activeChat.participantId
                                ? "self-end max-w-[70%] relative w-fit"
                                : "self-start max-w-[70%] relative w-fit"
                            }
                          >
                            <div
                              className={`shadow-sm ${message.senderId !== activeChat.participantId
                                  ? "bg-white"
                                  : "bg-[#313131] text-white"
                                } break-words border-[1px] border-[#bdbdbd] rounded-full p-4`}
                            >
                              {message.message}
                            </div>
                            <small
                              className={`absolute w-[80px] ${message.senderId !== activeChat.participantId
                                  ? "right-3 text-right"
                                  : "left-3 text-left"
                                }`}
                            >
                              {convertTimestampToTime(message.timeStamp)}
                            </small>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <p className="flex h-full justify-center items-center">
                    No messages found
                  </p>
                )}
                <form
                  onSubmit={(e) => sendMessage(e)}
                  className=" w-full bottom-0 absolute px-5 h-[9vh] flex justify-center items-center gap-3 md:gap-0"
                >
                  <div className="rounded-full w-full md:w-[80%] lg:w-[80%] mx-auto border-[1px] border-[#bdbdbd] flex items-center">
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
                    className="lg:absolute right-1 lg:right-5 p-3 rounded-full bg-[#313131]"
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
export default connect(mapStateToProps, mapDispatchToProps)(MobileChatWindow);

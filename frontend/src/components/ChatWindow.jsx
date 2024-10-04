// add online indicator to chat window and chatlist
// properly display number of unread messages
// when declining a friend request, remove the chat from the chatlist. but then take note of the blocked user id in the user db, so when searching for a user, the blocked user will show with the option to unblock
// when user is blocked, the user can't send messages to the blocker
// whe
// further implement message deletion
// try to implement voice notes

import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setMessages,
} from "../redux/chatReducer/chatAction";
import { IoMdArrowBack } from "react-icons/io";
import { IoEllipsisVertical } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { toast, Toaster } from "sonner";
import { IoSend } from "react-icons/io5";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";
import { FaArrowDown } from "react-icons/fa6";
import { MdCall } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";

const ChatWindow = ({
  activeChat,
  clearActiveChat,
  messages,
  setMessages,
  clearMessages,
}) => {
  const [fetchingMsgs, setFetchingMsgs] = useState(true);
  const [messageBody, setMessageBody] = useState("");
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  // const [showRequest, setShowRequest] = useState(true);
  const user = useAuth().user;
  const messagesEndRef = useRef(null);
  let groupedMessages;

  const deleteMessage = () => {
    // implement backend logic first
  };

  const showOptions = (id) => {
    setSelectedMessageId((prevId) => {
      // If the same message is clicked again, close the options
      if (prevId === id) {
        setShowMessageOptions(false);
        return null; // Deselect the message
      } else {
        setShowMessageOptions(true);
        return id; // Select the new message
      }
    });
  };

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
      return toast.error("Message can't be empty");
    }
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
        <div className="">
          <p className="w-full text-xl text-center font-rowdies absolute right-[50%] bottom-[50%] translate-x-[50%]">
            Click on a chat to catch a vibe
          </p>
        </div>
      ) : (
        <div className="flex flex-col relative h-screen overflow-hidden">
          <div className="bg-white relative h-[8vh] shrink-0 border-b-[#e1e1e1] border-b-[1px] flex justify-between items-center font-poppins">
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
                onClick={() => toast.error("Not functional")}
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
            {!activeChat.isFriend && (
              <div className="absolute bottom-0 translate-y-[100%] bg-white p-2 w-full z-30 flex justify-between items-center">
                <p>
                  <strong>{activeChat.username}</strong> wants to be your
                  friend.
                </p>
                <div className="flex gap-2">
                  <button className="bg-[#313131] font-bold rounded-md text-white p-2">
                    Accept
                  </button>
                  <button className="bg-[#313131] font-bold rounded-md text-white p-2">
                    Decline
                  </button>
                  <button>
                    <IoMdClose size={25} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="h-[92vh] max-h-[92vh] relative flex flex-col overflow-hidden">
            {fetchingMsgs ? (
              <div className="loader-black absolute right-[50%] bottom-[50%] translate-x-[50%]"></div>
            ) : (
              <>
                {messages && messages.length > 0 ? (
                  <div className="overflow-y-auto h-[77vh] px-3">
                    {Object.keys(groupedMessages).map((date, index) => (
                      <div key={index} className="flex flex-col gap-5 ">
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
                            <div className="flex items-center relative">
                              {showMessageOptions &&
                                selectedMessageId === message.id && (
                                  <button
                                    className={`absolute ${
                                      message.senderId ==
                                      activeChat.participantId
                                        ? " right-0 translate-x-[110%] "
                                        : " left-0 -translate-x-[110%] "
                                    } top-[50%] bg-red-500 hover:bg-red-400 text-white p-1 rounded`}
                                  >
                                    <MdDelete />
                                  </button>
                                )}
                              <div
                                onClick={() => showOptions(message.id)}
                                className={`shadow-sm ${
                                  message.senderId !== activeChat.participantId
                                    ? "bg-white"
                                    : "bg-[#313131] text-white"
                                } break-words max-w-full border-[1px] border-[#bdbdbd] rounded-lg p-4 cursor-pointer`}
                              >
                                {message.message}
                              </div>
                            </div>
                            <small
                              className={`absolute w-[80px]  ${
                                message.senderId !== activeChat.participantId
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
                  className=" w-full h-[9vh] flex justify-center items-center relative gap-3 md:gap-0"
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
export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow);

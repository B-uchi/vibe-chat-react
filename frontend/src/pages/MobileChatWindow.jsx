import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  setMessages,
  reRenderChats,
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
  currentUser,
  reRenderChats,
}) => {
  const [fetchingMsgs, setFetchingMsgs] = useState(true);
  const [messageBody, setMessageBody] = useState("");
  const [decisionBtnLoader, setDecisionBtnLoader] = useState(false);
  const user = useAuth().user;
  const messagesEndRef = useRef(null);
  let groupedMessages;

  useEffect(() => {
    const fetchMessages = async () => {
      setFetchingMsgs(true);
      if (activeChat) {
        try {
          const idToken = await user.getIdToken(true);
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/chat/fetchMessages`,
            {
              method: "POST",
              body: JSON.stringify({ chatId: activeChat.chatId }),
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages);
            scrollToBottom();
          } else {
            toast.error("Error fetching messages");
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
          toast.error("Error fetching messages");
        } finally {
          setFetchingMsgs(false);
        }
      }
    };

    fetchMessages();
  }, []);

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
            if (newMessage) {
              setMessages([
                ...messages,
                { id: newMessage.doc.id, ...newMessage.doc.data() },
              ]);
            }
          }
        }
      );
      return () => unsubscribe();
    }
  }, [messages, activeChat]);

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeout);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRequestDecision = async (decision) => {
    setDecisionBtnLoader(true);
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/${decision}Request`,
        {
          method: "POST",
          body: JSON.stringify({ chatId: activeChat.chatId }),
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (response.ok) {
        reRenderChats();
        toast.success(
          `Chat request ${decision === "accept" ? "accepted" : "declined"}`
        );
      } else {
        toast.error("Error processing request");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error processing request");
    } finally {
      setDecisionBtnLoader(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      return toast.error("Message can't be empty");
    }
    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/sendMessage`, {
        method: "POST",
        body: JSON.stringify({
          messageBody: messageBody.trim(),
          chatId: activeChat.chatId,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        setMessageBody("");
      } else {
        toast.error("Error sending message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
    }
  };

  const convertTimestampToTime = (timestamp) => {
    const seconds = timestamp.seconds || timestamp._seconds;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds;
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (messages) {
    groupedMessages = messages.reduce((acc, message) => {
      const seconds = message.timeStamp.seconds || message.timeStamp._seconds;
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

  if (!activeChat) return <Navigate to="/" />;

  return (
    <section className="h-full flex flex-col relative bg-gray-50">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col h-screen">
        <div className="bg-white px-4 py-2 h-16 shrink-0 border-b flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                clearActiveChat();
                clearMessages();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <IoMdArrowBack size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <img
                src={activeChat.profilePhoto}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {activeChat.username}
                </p>
                <p className="text-sm text-gray-500">
                  {activeChat.onlineStatus ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="Call"
            >
              <MdCall className="text-gray-600" size={20} />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title="More options"
            >
              <IoEllipsisVertical className="text-gray-600" size={20} />
            </button>
          </div>
        </div>

        {!activeChat.isFriend && (
          <div className="bg-blue-50 p-4 border-b">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-medium">
                  {activeChat.initiatedBy === currentUser.id
                    ? "You sent a chat request"
                    : "Chat request received"}
                </span>
              </p>
              {activeChat.initiatedBy !== currentUser.id && (
                <div className="flex items-center space-x-2">
                  {decisionBtnLoader ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRequestDecision("accept")}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestDecision("decline")}
                        className="px-4 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          {fetchingMsgs ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages && messages.length > 0 ? (
                  Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="space-y-6">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                          {date}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {dayMessages.map((message) => {
                          const isSender =
                            message.senderId !== activeChat.participantId;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isSender ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${
                                  isSender
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p>{message.message}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isSender
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {convertTimestampToTime(message.timeStamp)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No messages yet</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t mt-auto">
                <form
                  onSubmit={sendMessage}
                  className="flex items-center space-x-2"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    <IoSend size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaArrowDown size={16} className="text-gray-600" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = ({ chat, user }) => ({
  activeChat: chat.activeChat,
  messages: chat.messages,
  currentUser: user.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  clearActiveChat: () => dispatch(clearActiveChat()),
  setMessages: (messages) => dispatch(setMessages(messages)),
  clearMessages: () => dispatch(clearMessages()),
  reRenderChats: () => dispatch(reRenderChats()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MobileChatWindow);

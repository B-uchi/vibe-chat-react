// add online indicator to chat window and chatlist
// properly display number of unread messages
// when declining a friend request, remove the chat from the chatlist. but then take note of the blocked user id in the user db, so when searching for a user, the blocked user will show with the option to unblock
// when user is blocked, the user can't send messages to the blocker
// whe
// further implement message deletion
// try to implement voice notes
// clamp the bio on the add user screen so therell be space for unblock button

import { connect } from "react-redux";
import {
  clearActiveChat,
  clearMessages,
  reRenderChats,
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
import { MdCall, MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { io } from "socket.io-client";

const ChatWindow = ({
  activeChat,
  clearActiveChat,
  messages,
  setMessages,
  clearMessages,
  currentUser,
  reRenderChats,
}) => {
  const [fetchingMsgs, setFetchingMsgs] = useState(true);
  const [decisionBtnLoader, setdecisionBtnLoader] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState("");
  const [showRequest, setShowRequest] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const user = useAuth().user;
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  let groupedMessages;

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

    socketRef.current.on("typing_status", ({ chatId, userId, isTyping }) => {
      if (activeChat && chatId === activeChat.chatId && userId !== currentUser.id) {
        setPartnerTyping(isTyping);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [activeChat]);

  const emitTyping = (isTyping) => {
    if (socketRef.current && activeChat) {
      socketRef.current.emit("typing", {
        chatId: activeChat.chatId,
        userId: currentUser.id,
        isTyping
      });
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTyping(false);
    }, 2000);
  };

  const deleteMessage = () => {
    // implement backend logic first
  };

  const handleRequestDecision = async (decision) => {
    setdecisionBtnLoader(true);
    const idToken = await user.getIdToken(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/chat/decideRequest`,
      {
        method: "PATCH",
        body: JSON.stringify({
          chatId: activeChat.chatId,
          decision,
          participantId: activeChat.participantId,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    if (response.status == 200) {
      setShowRequest(false);
      clearActiveChat();
      reRenderChats();
      setdecisionBtnLoader(false);
      toast.success(
        decision == "accept"
          ? "Request accepted"
          : "Request declined, you won't be notified again"
      );
    } else {
      setdecisionBtnLoader(false);
      toast.error(
        decision == "accept"
          ? "Error accepting request"
          : "Error declining request"
      );
    }
  };

  const showOptions = (id) => {
    setSelectedMessageId((prevId) => {
      if (prevId === id) {
        setShowMessageOptions(false);
        return null;
      } else {
        setShowMessageOptions(true);
        return id;
      }
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setFetchingMsgs(true);
      if (activeChat) {
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
        if (response.status == 200) {
          const data = await response.json();
          setMessages(data.messages);
          setFetchingMsgs(false);
          scrollToBottom();
        } else {
          setFetchingMsgs(false);
          toast.error("Error fetching messages");
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
      return () => unsubscribe();
    }
  }, [messages]);

  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeout);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      return toast.error("Message can't be empty");
    }
    const idToken = await user.getIdToken(true);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/chat/sendMessage`,
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
      setIsTyping(false);
      emitTyping(false);
    } else {
      toast.error("Error sending message.");
    }
  };

  function convertTimestampToTime(timestamp) {
    const seconds = timestamp.seconds || timestamp._seconds;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds;
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  }

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

  return (
    <section className="h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {!activeChat ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-2xl text-gray-500 font-medium">
            Select a chat to start messaging
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="bg-white h-[65px] px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
                  <div className="relative">
                    <img
                      src={activeChat.profilePhoto}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {activeChat.onlineStatus && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeChat.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {partnerTyping ? "Typing..." : activeChat.onlineStatus ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="Call"
                  onClick={() => toast.error("Calling not available yet")}
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
          </div>

          {/* Messages Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Friend Request Banner */}
            {showRequest && !activeChat.isFriend && (
              <div className="p-3">
                <div
                  className={`p-3 bg-blue-50 rounded-lg z-50 ${
                    activeChat.initiatedBy !== currentUser.id
                      ? "border border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      {activeChat.initiatedBy === currentUser.id ? (
                        <span>
                          Waiting for {activeChat.username} to accept your
                          request
                        </span>
                      ) : (
                        <span>
                          <strong>{activeChat.username}</strong> wants to
                          connect
                        </span>
                      )}
                    </p>
                    {activeChat.initiatedBy !== currentUser.id && (
                      <div className="flex items-center space-x-2">
                        {decisionBtnLoader ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRequestDecision("accept")}
                              className="px-4 py-1.5 cursor-pointer bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestDecision("decline")}
                              className="px-4 py-1.5 cursor-pointer bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {fetchingMsgs ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="px-4 py-6">
                    {messages && messages.length > 0 ? (
                      Object.entries(groupedMessages).map(
                        ([date, dayMessages]) => (
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
                                    <div className="group relative max-w-[70%]">
                                      <div
                                        onClick={() => showOptions(message.id)}
                                        className={`px-4 py-2 rounded-2xl break-words ${
                                          isSender
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-900"
                                        }`}
                                      >
                                        <p className="text-sm whitespace-pre-wrap">
                                          {message.message}
                                        </p>
                                      </div>
                                      <span
                                        className={`text-xs text-gray-500 mt-1 ${
                                          isSender ? "text-right" : "text-left"
                                        } block`}
                                      >
                                        {convertTimestampToTime(
                                          message.timeStamp
                                        )}
                                      </span>
                                      {showMessageOptions &&
                                        selectedMessageId === message.id && (
                                          <button
                                            className="absolute top-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"
                                            style={{
                                              [isSender ? "left" : "right"]:
                                                "-40px",
                                            }}
                                          >
                                            <MdDelete size={16} />
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No messages yet</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t">
                  <form
                    onSubmit={sendMessage}
                    className="flex items-center space-x-2"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageBody}
                        onChange={(e) => {
                          setMessageBody(e.target.value);
                          handleTyping();
                        }}
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
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatWindow);

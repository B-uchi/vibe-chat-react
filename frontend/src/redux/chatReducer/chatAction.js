export const setActiveChat = (chat) => ({
  type: "SET_ACTIVE_CHAT",
  payload: chat,
});

export const clearMessages = () => ({
  type: "CLEAR_MESSAGES"
})

export const setUserChats = (chatList) => ({
  type: "SET_USER_CHATS",
  payload: chatList,
});

export const setChatWindowSize = (size)=>({
  type: "SET_CHAT_WINDOW_SIZE",
  payload: size,
})

export const setMessages = (messages) => ({
  type: "SET_MESSAGES",
  payload: messages,
});

export const clearActiveChat = () => ({
  type: "CLEAR_ACTIVE_CHAT",
});

const INITIAL_USER_STATE = {
  activeChat: null,
  messages: null,
  userChats: null,
  chatRequests: null,
  rerender: false,
};

const chatReducer = (state = INITIAL_USER_STATE, action) => {
  switch (action.type) {
    case "SET_ACTIVE_CHAT":
      return {
        ...state,
        activeChat: action.payload,
      };
    case "SET_CHAT_REQUESTS":
      return {
        ...state,
        chatRequests: action.payload,
      };
    case "SET_USER_CHATS":
      return {
        ...state,
        userChats: action.payload,
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: null,
      };
    case "CLEAR_ACTIVE_CHAT":
      return {
        ...state,
        activeChat: null,
      };
    case "RERENDER_CHATS":
      return {
        ...state,
        rerender: !state.rerender,
      };
    default:
      return state;
  }
};

export default chatReducer;

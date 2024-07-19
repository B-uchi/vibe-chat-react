
const INITIAL_USER_STATE = {
    activeChat: null,
  };
  
  const chatReducer = (state = INITIAL_USER_STATE, action) => {
    switch (action.type) {
      case 'SET_ACTIVE_CHAT':
        return {
          ...state,
          activeChat: action.payload,
        };
      case "CLEAR_ACTIVE_CHAT":
        return {
          ...state,
          activeChat: null,
        };
      default:
        return state;
    }
  };
  
  export default chatReducer;
  

const INITIAL_USER_STATE = {
  currentUser: null,
};

const userReducer = (state = INITIAL_USER_STATE, action) => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };
    case "UPDATE_CURRENT_USER":
      return {
        ...state,
        currentUser: action.payload
      }
    case "CLEAR_CURRENT_USER":
      return {
        ...state,
        currentUser: null,
      };
    default:
      return state;
  }
};

export default userReducer;

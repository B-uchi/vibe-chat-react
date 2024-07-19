import { combineReducers } from "redux";
import userReducer from "./userReducer/user.reducer";
import chatReducer from "./chatReducer/chat.reducer";

const rootReducer = combineReducers({
  user: userReducer,
  chat: chatReducer,
});

export default rootReducer;
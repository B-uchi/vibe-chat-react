import { combineReducers } from "redux";
import userReducer from "./userReducer/user.reducer";

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
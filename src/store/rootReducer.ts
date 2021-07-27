import { combineReducers } from "redux";
import * as L from "./login";
import * as A from "./asyncStorage";

export const rootReducer = combineReducers({
  login: L.reducer,
  asyncStorage: A.reducer,
});

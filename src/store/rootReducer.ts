import { combineReducers } from "redux";
import * as L from "./login";
import * as A from "./asyncStorage";
import * as I from "./isAuthorized";

export const rootReducer = combineReducers({
  login: L.reducer,
  asyncStorage: A.reducer,
  isAuthorized: I.reducer,
});

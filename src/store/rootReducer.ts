import { combineReducers } from "redux";
import * as L from "./login";
import * as A from "./asyncStorage";
import * as O from "./onBoarding";
import * as I from "./isAuthorized";

export const rootReducer = combineReducers({
  login: L.reducer,
  asyncStorage: A.reducer,
  onBoarding: O.reducer,
  isAuthorized: I.reducer,
});

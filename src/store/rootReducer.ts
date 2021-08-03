import { combineReducers } from "redux";
import * as L from "./login";
import * as A from "./asyncStorage";
import * as U from "./latestUpdate";

export const rootReducer = combineReducers({
  login: L.reducer,
  asyncStorage: A.reducer,
  latestUpdate: U.reducer,
});

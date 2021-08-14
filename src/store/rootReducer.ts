import { combineReducers } from "redux";
import * as L from "./login";
import * as A from "./asyncStorage";
import * as U from "./latestUpdate";
import * as O from "./onBoarding";

export const rootReducer = combineReducers({
  login: L.reducer,
  asyncStorage: A.reducer,
  latestUpdate: U.reducer,
  onBoarding: O.reducer,
});

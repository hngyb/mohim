import * as L from "./login";
import * as A from "./asyncStorage";
import * as U from "./latestUpdate";

export type AppState = {
  login: L.State;
  asyncStorage: A.State;
  latestUpdate: U.State;
};

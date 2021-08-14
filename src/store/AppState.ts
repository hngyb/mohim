import * as L from "./login";
import * as A from "./asyncStorage";
import * as U from "./latestUpdate";
import * as O from "./onBoarding";

export type AppState = {
  login: L.State;
  asyncStorage: A.State;
  latestUpdate: U.State;
  onBoarding: O.State;
};

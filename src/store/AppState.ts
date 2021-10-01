import * as L from "./login";
import * as A from "./asyncStorage";
import * as I from "./isAuthorized";

export type AppState = {
  login: L.State;
  asyncStorage: A.State;
  isAuthorized: I.State;
};

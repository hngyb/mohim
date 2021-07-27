import * as L from "./login";
import * as A from "./asyncStorage";

export type AppState = {
  login: L.State;
  asyncStorage: A.State;
};

import type { Action } from "redux";

export type State = {
  accessJWT: string;
  refreshJWT: string;
};

export type SetJWTAction = Action<"@asyncStorage/setJWT"> & {
  accessJWT: string;
  refreshJWT: string;
};
export type Actions = SetJWTAction;

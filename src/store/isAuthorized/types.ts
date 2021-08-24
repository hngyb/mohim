import type { Action } from "redux";

export type State = {
  isAuthorized: boolean;
};

export type SetIsAuthorizedAction = Action<"setIsAuthorized"> & {
  isAuthorized: boolean;
};
export type Actions = SetIsAuthorizedAction;

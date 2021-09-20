import { Dispatch } from "redux";
import * as U from "../../utils";
import type * as T from "./types";

export const loginAction = (loggedUser: T.User): T.LoginAction => ({
  type: "login",
  loggedUser,
});
export const logoutAction = (): T.LogoutAction => ({
  type: "logout",
});
export const loggedUserKey = "loggedUser";
export const signUpAction = (loggedUser: T.User) => (dispatch: Dispatch) => {
  U.writeToStorage(loggedUserKey, JSON.stringify(loggedUser))
    .then(() => {
      dispatch(loginAction(loggedUser));
    })
    .catch((e) => {
      dispatch(loginAction(loggedUser));
    });
};

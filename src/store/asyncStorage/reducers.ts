import * as T from "./types";

const initialState: T.State = {
  accessJWT: "",
  refreshJWT: "",
};

export const reducer = (state: T.State = initialState, action: T.Actions) => {
  switch (action.type) {
    case "@asyncStorage/setJWT":
      return {
        ...state,
        accessJWT: action.accessJWT,
        refreshJWT: action.refreshJWT,
      };
  }
  return state;
};

import * as T from "./types";

const initialState: T.State = {
  isAuthorized: false,
};

export const reducer = (state: T.State = initialState, action: T.Actions) => {
  switch (action.type) {
    case "setIsAuthorized":
      return {
        ...state,
        isAuthorized: action.isAuthorized,
      };
  }
  return state;
};

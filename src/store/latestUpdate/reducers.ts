import * as T from "./types";

const initialState: T.State = {
  latestUpdatedDate: null,
};

export const reducer = (state: T.State = initialState, action: T.Actions) => {
  switch (action.type) {
    case "@asyncStorage/setUpdatedDate":
      return {
        ...state,
        accessJWT: action.latestUpdatedDate,
      };
  }
  return state;
};

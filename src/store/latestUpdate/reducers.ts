import * as T from "./types";

const initialState: T.State = {
  latestUpdatedDate: null,
};

export const reducer = (state: T.State = initialState, action: T.Actions) => {
  switch (action.type) {
    case "@asyncStorage/setUpdatedDate":
      return {
        ...state,
        latestUpdatedDate: action.latestUpdatedDate,
      };
  }
  return state;
};

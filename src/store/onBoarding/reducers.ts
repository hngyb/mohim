import * as T from "./types";

export const initialState: T.State = {
  church: "일산교회",
  sex: "",
  district: "11",
  group: "청년회",
  services: [],
  inviteCode: "",
};

export const reducer = (state: T.State = initialState, action: T.Actions) => {
  switch (action.type) {
    case "@asyncStorage/setProfile":
      return {
        ...state,
        church: action.church,
        sex: action.sex,
        district: action.district,
        group: action.group,
        services: action.services,
        inviteCode: action.inviteCode,
      };
  }
  return state;
};

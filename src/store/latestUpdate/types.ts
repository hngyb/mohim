import type { Action } from "redux";

export type State = {
  latestUpdatedDate: string | null;
};

export type SetUpdatedDateAction = Action<"@asyncStorage/setUpdatedDate"> & {
  latestUpdatedDate: string | null;
};
export type Actions = SetUpdatedDateAction;

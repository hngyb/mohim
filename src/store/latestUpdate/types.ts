import type { Action } from "redux";

export type State = {
  latestUpdatedDate: Date | null;
};

export type SetUpdatedDateAction = Action<"@asyncStorage/setUpdatedDate"> & {
  latestUpdatedDate: Date;
};
export type Actions = SetUpdatedDateAction;

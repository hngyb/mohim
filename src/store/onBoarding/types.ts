import type { Action } from "redux";

export type State = {
  church: string;
  sex: string;
  district: string;
  group: string;
  services: Array<any>;
  inviteCode: string;
};

export type SetProfileAction = Action<"@asyncStorage/setProfile"> & {
  church: string;
  sex: string;
  district: string;
  group: string;
  services: Array<any>;
  inviteCode: string;
};
export type Actions = SetProfileAction;

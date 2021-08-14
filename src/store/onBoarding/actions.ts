import type * as T from "./types";

export const setProfile = (
  church: string,
  sex: string,
  district: string,
  group: string,
  services: Array<any>,
  inviteCode: string
): T.SetProfileAction => ({
  type: "@asyncStorage/setProfile",
  church,
  sex,
  district,
  group,
  services,
  inviteCode,
});

import type * as T from "./types";

export const setUpdatedDate = (
  latestUpdatedDate: string
): T.SetUpdatedDateAction => ({
  type: "@asyncStorage/setUpdatedDate",
  latestUpdatedDate,
});

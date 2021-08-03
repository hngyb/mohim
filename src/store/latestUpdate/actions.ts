import type * as T from "./types";

export const setUpdatedDate = (
  latestUpdatedDate: Date
): T.SetUpdatedDateAction => ({
  type: "@asyncStorage/setUpdatedDate",
  latestUpdatedDate,
});

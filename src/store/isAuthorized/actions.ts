import type * as T from "./types";

export const setIsAuthorized = (
  isAuthorized: boolean
): T.SetIsAuthorizedAction => ({
  type: "setIsAuthorized",
  isAuthorized,
});

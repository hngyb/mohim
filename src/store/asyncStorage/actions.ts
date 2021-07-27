import type * as T from "./types";

export const setJWT = (
  accessJWT: string,
  refreshJWT: string
): T.SetJWTAction => ({
  type: "@asyncStorage/setJWT",
  accessJWT,
  refreshJWT,
});

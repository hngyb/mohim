import Realm from "realm";
import {
  BelongToSchema,
  EventSchema,
  FollowSchema,
  GroupSchema,
  LatestUpdatedDateSchema,
} from "./schema";

export default new Realm({
  schema: [
    BelongToSchema,
    EventSchema,
    FollowSchema,
    GroupSchema,
    LatestUpdatedDateSchema,
  ],
});

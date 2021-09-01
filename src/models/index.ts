import Realm from "realm";
import {
  EventSchema,
  FollowSchema,
  GroupSchema,
  LatestUpdatedDateSchema,
} from "./schema";

export default new Realm({
  schema: [EventSchema, FollowSchema, GroupSchema, LatestUpdatedDateSchema],
});

import Realm from "realm";
import {
  BelongToSchema,
  EventSchema,
  FollowSchema,
  GroupSchema,
} from "./schema";

export default new Realm({
  schema: [BelongToSchema, EventSchema, FollowSchema, GroupSchema],
});

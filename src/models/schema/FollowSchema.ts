export const FollowSchema = {
  name: "Follows",
  properties: {
    groupId: "int",
    createdAt: { type: "date", default: Date() },
    updatedAt: { type: "date", default: Date() },
    deletedAt: { type: "date?" },
  },
  primaryKey: "groupId",
};

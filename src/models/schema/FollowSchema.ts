export const FollowSchema = {
  name: "Follows",
  properties: {
    groupId: "int",
    userId: "string",
    color: "string?",
    isBelongTo: { type: "bool", default: false },
    createdAt: { type: "date", default: Date() },
    updatedAt: { type: "date", default: Date() },
    deletedAt: { type: "date?" },
  },
  primaryKey: "groupId",
};

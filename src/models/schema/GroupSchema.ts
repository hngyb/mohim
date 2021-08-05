export const GroupSchema = {
  name: "Groups",
  properties: {
    id: "int",
    name: "string",
    church: "string",
    isPublic: "bool",
    color: "string?",
    createdAt: { type: "date", default: Date() },
    updatedAt: { type: "date", default: Date() },
    deletedAt: { type: "date?" },
  },
  primaryKey: "id",
};

export const GroupSchema = {
  name: "Groups",
  properties: {
    id: "int",
    name: "string",
    church: "string",
    isPublic: "bool",
    color: "string?",
  },
  primaryKey: "id",
};

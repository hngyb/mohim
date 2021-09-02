export const EventSchema = {
  name: "Events",
  properties: {
    id: "int",
    userId: "string",
    groupId: "int",
    title: "string",
    date: { type: "string", indexed: true },
    startTime: "string?",
    endTime: "string?",
    location: "string?",
    notice: "string?",
    memo: "string?",
    createdAt: { type: "date", default: Date() },
    updatedAt: { type: "date", default: Date() },
    deletedAt: { type: "date?" },
  },
  primaryKey: "id",
};

export const LatestUpdatedDateSchema = {
  name: "LatestUpdatedDates",
  properties: {
    userId: "string",
    latestDate: { type: "date?", default: null },
    deletedAt: { type: "date?" },
  },
  primaryKey: "userId",
};

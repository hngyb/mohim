export const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split("T")[0];
};

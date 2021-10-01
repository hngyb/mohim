export const getCookie = (cookie: string, name: string) => {
  var match = cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : "";
};

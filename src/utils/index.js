export function makeId(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export const centerTextEllipsis = (text, size, key) => {
  return `${text?.slice(0, size || 5)}${key || "..."}${text?.slice(
    -(size || 5)
  )}`;
};

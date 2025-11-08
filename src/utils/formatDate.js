export default function formatDate(date) {
  // 년-월-일
  const prefix = date.split("T")[0];
  const suffix = date.split("T")[1].split(".")[0];
  return prefix + " " + suffix;
}

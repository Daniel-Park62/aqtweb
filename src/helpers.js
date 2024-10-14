export function getComparator(type, column) {
  const key = column.toLowerCase();

  if (type === "string") {
    return (a, b) => a[key].localeCompare(b[key]);
  }
  if (type === "number") {
    return (a, b) => a[key] - b[key];
  }
  if (type === "object") {
    return (a, b) => a[key] - b[key];
  }
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(value);
}
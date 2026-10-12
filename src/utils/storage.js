export function createStorage(storage, onError = () => {}) {
  const memory = new Map(),
    failed = new Set();
  return {
    read(key) {
      if (failed.has(key)) return memory.get(key) || [];
      try {
        const data = JSON.parse(storage.getItem(key) || "[]");
        if (!Array.isArray(data)) throw new Error("Invalid storage format");
        memory.set(key, data);
        return data;
      } catch {
        onError(
          "Browser storage is unavailable or damaged. Changes are kept for this session.",
        );
        return memory.get(key) || [];
      }
    },
    write(key, value) {
      memory.set(key, value);
      try {
        storage.setItem(key, JSON.stringify(value));
        failed.delete(key);
      } catch {
        failed.add(key);
        onError(
          "Could not save to browser storage. Changes are kept for this session.",
        );
      }
    },
  };
}
export function addHistory(history, entry) {
  return [
    entry,
    ...history.filter(
      (i) =>
        !(
          i.query === entry.query &&
          i.source === entry.source &&
          i.sort === entry.sort &&
          i.filter === entry.filter
        ),
    ),
  ].slice(0, 8);
}
export function validResource(i) {
  return (
    i &&
    ["github", "stackoverflow"].includes(i.source) &&
    typeof i.id === "string" &&
    typeof i.title === "string" &&
    typeof i.url === "string"
  );
}

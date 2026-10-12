import test from "node:test";
import assert from "node:assert/strict";
import { searchUrl, normalize, search } from "../src/services/search.js";
import { createStorage, addHistory } from "../src/utils/storage.js";
import { safeLink } from "../src/components/results.js";
test("GitHub query, language, sorting and pagination are encoded", () => {
  const u = new URL(
    searchUrl({
      source: "github",
      query: "web components",
      sort: "stars",
      filter: "JavaScript",
      page: 2,
    }),
  );
  assert.equal(u.searchParams.get("q"), "web components language:JavaScript");
  assert.equal(u.searchParams.get("sort"), "stars");
  assert.equal(u.searchParams.get("page"), "2");
});
test("Stack Exchange keyword and answer filters use supported parameters", () => {
  const u = new URL(
    searchUrl({
      source: "stackoverflow",
      query: "async await",
      sort: "votes",
      filter: "accepted",
      page: 1,
    }),
  );
  assert.equal(u.searchParams.get("site"), "stackoverflow");
  assert.equal(u.searchParams.get("accepted"), "true");
  assert.equal(u.searchParams.get("q"), "async await");
  assert.equal(
    new URL(
      searchUrl({ source: "stackoverflow", query: "x", filter: "unaccepted" }),
    ).searchParams.get("accepted"),
    "false",
  );
});
test("missing optional API fields have usable defaults", () => {
  const repo = normalize("github", { id: 42 });
  assert.equal(repo.id, "github:42");
  assert.equal(repo.description, "No description provided.");
  assert.equal(repo.stars, 0);
  assert.deepEqual(normalize("stackoverflow", { question_id: 42 }).tags, []);
});
test("only trusted HTTPS resource links are allowed", () => {
  assert.equal(safeLink("javascript:alert(1)", "github"), null);
  assert.equal(safeLink("https://github.com.evil.test/x", "github"), null);
  assert.equal(
    safeLink("https://github.com/a/b", "github"),
    "https://github.com/a/b",
  );
});
test("history repeats are deduplicated and bounded to eight", () => {
  let h = [];
  for (let n = 0; n < 12; n++)
    h = addHistory(h, { query: String(n), source: "github" });
  assert.equal(h.length, 8);
  h = addHistory(h, { query: "11", source: "github" });
  assert.equal(h.length, 8);
  assert.equal(h[0].query, "11");
});
test("storage persists and tolerates malformed data and failed writes", () => {
  const data = new Map();
  let notices = 0;
  const s = createStorage(
    { getItem: (k) => data.get(k), setItem: (k, v) => data.set(k, v) },
    () => notices++,
  );
  s.write("x", [{ id: 1 }]);
  assert.deepEqual(s.read("x"), [{ id: 1 }]);
  data.set("x", "{broken");
  assert.deepEqual(s.read("x"), [{ id: 1 }]);
  assert.equal(notices, 1);
  const failed = createStorage({
    getItem: () => null,
    setItem: () => {
      throw new Error();
    },
  });
  failed.write("x", [1]);
  assert.deepEqual(failed.read("x"), [1]);
});
test("requests deduplicate, cache responses and normalize real-shaped payloads", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return {
      ok: true,
      headers: new Headers(),
      json: async () => ({ items: [{ id: 1, name: "demo" }], total_count: 1 }),
    };
  };
  const o = { source: "github", query: "test-cache", page: 1 };
  const [a, b] = await Promise.all([search(o), search(o)]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
  assert.equal(a.items[0].title, "demo");
  await search(o);
  assert.equal(calls, 1);
});
test("network failures provide an actionable message", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("failed");
  };
  await assert.rejects(
    search({ source: "github", query: "network-test", page: 1 }),
    /Check your connection/,
  );
});
test("HTTP errors and malformed responses are reported", async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    headers: new Headers(),
    json: async () => ({}),
  });
  await assert.rejects(
    search({ source: "github", query: "http-error", page: 1 }),
    /HTTP 500/,
  );
  globalThis.fetch = async () => ({
    ok: true,
    headers: new Headers(),
    json: async () => ({}),
  });
  await assert.rejects(
    search({ source: "github", query: "malformed", page: 1 }),
    /Unexpected/,
  );
});
test("Stack Exchange backoff blocks new requests while allowing cached results", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return {
      ok: true,
      headers: new Headers(),
      json: async () => ({
        items: [],
        backoff: 60,
        has_more: false,
        quota_remaining: 10,
      }),
    };
  };
  const o = { source: "stackoverflow", query: "backoff", page: 1 };
  await search(o);
  await search(o);
  await assert.rejects(search({ ...o, query: "other" }), /pause/);
  assert.equal(calls, 1);
});
test("GitHub rate limits honor a reset before allowing new calls", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return {
      ok: false,
      status: 403,
      headers: new Headers({
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 120),
      }),
      json: async () => ({}),
    };
  };
  await assert.rejects(
    search({ source: "github", query: "rate-limit", page: 1 }),
    /rate limit/,
  );
  await assert.rejects(
    search({ source: "github", query: "blocked", page: 1 }),
    /pause/,
  );
  assert.equal(calls, 1);
});

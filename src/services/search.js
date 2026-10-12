const cache = new Map(),
  pending = new Map(),
  blocked = new Map();
export function searchUrl({
  source,
  query,
  sort = "relevance",
  filter = "",
  page = 1,
}) {
  const p = new URLSearchParams();
  if (source === "github") {
    p.set("q", query + (filter ? " language:" + filter : ""));
    p.set("per_page", "12");
    p.set("page", page);
    if (sort !== "relevance") {
      p.set("sort", sort);
      p.set("order", "desc");
    }
    return "https://api.github.com/search/repositories?" + p;
  }
  p.set("site", "stackoverflow");
  p.set("q", query);
  p.set("pagesize", "12");
  p.set("page", page);
  p.set("sort", sort);
  p.set("order", "desc");
  if (filter === "accepted") p.set("accepted", "true");
  if (filter === "unaccepted") p.set("accepted", "false");
  return "https://api.stackexchange.com/2.3/search/advanced?" + p;
}
export function normalize(source, i) {
  if (source === "github")
    return {
      id: "github:" + i.id,
      source,
      title: i.name || "Untitled repository",
      owner: i.owner?.login || "Unknown owner",
      url: i.html_url,
      description: i.description || "No description provided.",
      language: i.language || "Not specified",
      stars: i.stargazers_count || 0,
      forks: i.forks_count || 0,
      updated: i.updated_at,
    };
  return {
    id: "stackoverflow:" + i.question_id,
    source,
    title: i.title || "Untitled question",
    url: i.link,
    owner: i.owner?.display_name || "Unknown author",
    ownerUrl: i.owner?.link,
    tags: Array.isArray(i.tags) ? i.tags : [],
    score: i.score || 0,
    answers: i.answer_count || 0,
    accepted: Boolean(i.accepted_answer_id),
    license: i.content_license || "See original question",
    updated: i.last_activity_date
      ? new Date(i.last_activity_date * 1000).toISOString()
      : null,
  };
}
export async function search(options) {
  const url = searchUrl(options),
    hit = cache.get(url);
  if (hit && Date.now() - hit.time < 60000) return hit.data;
  if (pending.has(url)) return pending.get(url);
  const until = blocked.get(options.source) || 0;
  if (until > Date.now())
    throw new Error(
      "The API needs a pause. Retry after " +
        new Date(until).toLocaleTimeString() +
        ".",
    );
  const request = (async () => {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers:
          options.source === "github"
            ? { Accept: "application/vnd.github+json" }
            : {},
      });
      // Preserve HTTP/rate-limit handling when a proxy returns HTML or no body.
      let body;
      try {
        body = await response.json();
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) body = {};
      if (body.backoff)
        blocked.set(options.source, Date.now() + body.backoff * 1000);
      if (body.quota_remaining === 0)
        blocked.set(options.source, Date.now() + 86400000);
      if (
        response.status === 429 ||
        (response.status === 403 &&
          (response.headers.get("x-ratelimit-remaining") === "0" ||
            response.headers.has("retry-after") ||
            /rate limit|abuse/i.test(String(body.message || ""))))
      ) {
        const retry = response.headers.get("retry-after");
        const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
        const time = retry
          ? Number.isFinite(Number(retry))
            ? Date.now() + Number(retry) * 1000
            : Date.parse(retry)
          : reset;
        blocked.set(options.source, Math.max(Date.now() + 60000, time || 0));
        throw new Error(
          "API rate limit reached. Please pause before retrying.",
        );
      }
      if (!response.ok || body.error_id)
        throw new Error(
          body.error_id
            ? "Stack Exchange could not process this search. Try a simpler keyword."
            : "The service returned HTTP " +
                response.status +
                ". Please retry later.",
        );
      if (!Array.isArray(body.items))
        throw new Error("Unexpected search response. Please retry.");
      const data = {
        items: body.items.map((i) => normalize(options.source, i)),
        more:
          options.source === "github"
            ? options.page < 83 && options.page * 12 < (body.total_count || 0)
            : Boolean(body.has_more),
        partial: Boolean(body.incomplete_results),
        quota: body.quota_remaining,
      };
      cache.set(url, { time: Date.now(), data });
      if (cache.size > 50) cache.delete(cache.keys().next().value);
      return data;
    } catch (e) {
      if (e.name === "AbortError")
        throw new Error("Search timed out. Check your connection and retry.");
      if (e instanceof TypeError)
        throw new Error(
          "Could not reach the service. Check your connection and retry.",
        );
      throw e;
    } finally {
      clearTimeout(timer);
    }
  })();
  pending.set(url, request);
  try {
    return await request;
  } finally {
    pending.delete(url);
  }
}

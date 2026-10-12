export function element(tag, text, className) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (className) n.className = className;
  return n;
}
export function decodeText(value) {
  return (
    new DOMParser().parseFromString(String(value), "text/html").body
      .textContent || ""
  );
}
export function safeLink(url, source) {
  try {
    const p = new URL(url);
    return p.protocol === "https:" &&
      p.hostname === (source === "github" ? "github.com" : "stackoverflow.com")
      ? p.href
      : null;
  } catch {
    return null;
  }
}
function link(text, url, source) {
  const href = safeLink(url, source),
    n = element(href ? "a" : "span", text);
  if (href) {
    n.href = href;
    n.target = "_blank";
    n.rel = "noopener noreferrer";
    n.setAttribute("aria-label", text + " (opens in a new tab)");
  }
  return n;
}
export function card(i, isSaved, toggle, headingTag = "h4") {
  const a = element("article", undefined, "resource-card"),
    top = element("div", undefined, "card-top"),
    save = element("button", isSaved ? "Saved ✓" : "Save +", "save-button");
  save.type = "button";
  save.setAttribute("aria-pressed", String(isSaved));
  save.setAttribute(
    "aria-label",
    (isSaved ? "Remove saved resource: " : "Save resource: ") +
      decodeText(i.title),
  );
  save.dataset.resource = i.id;
  save.addEventListener("click", () => toggle(i));
  top.append(
    element(
      "span",
      i.source === "github"
        ? "GITHUB / REPOSITORY"
        : "STACK OVERFLOW / QUESTION",
      "eyebrow",
    ),
    save,
  );
  const title = element(headingTag, undefined, "resource-title");
  title.append(link(decodeText(i.title), i.url, i.source));
  a.append(top, title);
  if (i.source === "github") {
    a.append(
      element("p", "by " + i.owner, "owner"),
      element("p", i.description, "description"),
    );
    const m = element("div", undefined, "metadata");
    m.append(
      element("span", "● " + i.language),
      element("span", "☆ " + Number(i.stars).toLocaleString() + " stars"),
      element("span", Number(i.forks).toLocaleString() + " forks"),
    );
    a.append(m);
  } else {
    const tags = element("div", undefined, "tags");
    for (const t of (Array.isArray(i.tags) ? i.tags : []).slice(0, 8))
      tags.append(element("span", t));
    const m = element("div", undefined, "metadata");
    m.append(
      element("span", i.score + " score"),
      element("span", i.answers + " answers"),
      element(
        "span",
        i.accepted ? "✓ Accepted answer" : "No accepted answer",
        i.accepted ? "mint" : "",
      ),
    );
    const owner = element("p", undefined, "owner");
    owner.append(
      "Asked by ",
      link(decodeText(i.owner), i.ownerUrl, i.source),
      " · " + i.license,
    );
    a.append(tags, m, owner);
  }
  const date = new Date(i.updated),
    foot = element("div", undefined, "card-footer");
  foot.append(
    element(
      "span",
      i.updated && !Number.isNaN(date.valueOf())
        ? "Updated " +
            date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
        : "Update date unavailable",
    ),
    link(
      i.source === "github" ? "View repository ↗" : "View question ↗",
      i.url,
      i.source,
    ),
  );
  a.append(foot);
  return a;
}

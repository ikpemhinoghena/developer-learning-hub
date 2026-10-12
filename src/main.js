import "./styles/main.css";
import { initializeNavigation } from "./components/navigation.js";
import { search } from "./services/search.js";
import { card, element } from "./components/results.js";
import { createStorage, addHistory, validResource } from "./utils/storage.js";
initializeNavigation();
const $ = (id) => document.getElementById(id);
let browserStorage;
try {
  browserStorage = window.localStorage;
} catch {
  browserStorage = {
    getItem() {
      throw new Error();
    },
    setItem() {
      throw new Error();
    },
  };
}
const storage = createStorage(
  browserStorage,
  (message) => ($("storage-status").textContent = message),
);
const keys = { saved: "dlh:saved:v1", history: "dlh:history:v1" };
const state = {
  source: "github",
  page: 1,
  items: [],
  more: false,
  request: 0,
  busy: false,
  last: null,
  saved: storage.read(keys.saved).filter(validResource),
  history: storage
    .read(keys.history)
    .filter(
      (i) =>
        i &&
        typeof i.query === "string" &&
        ["github", "stackoverflow"].includes(i.source),
    )
    .slice(0, 8),
};
const config = {
  github: {
    sort: [
      ["relevance", "Best match"],
      ["stars", "Most stars"],
      ["forks", "Most forks"],
      ["updated", "Recently updated"],
    ],
    filter: [
      ["", "Any language"],
      ["JavaScript", "JavaScript"],
      ["TypeScript", "TypeScript"],
      ["Python", "Python"],
      ["Java", "Java"],
      ["Rust", "Rust"],
      ["Go", "Go"],
      ["CSS", "CSS"],
      ["HTML", "HTML"],
    ],
  },
  stackoverflow: {
    sort: [
      ["relevance", "Most relevant"],
      ["votes", "Highest score"],
      ["activity", "Recent activity"],
      ["creation", "Newest questions"],
    ],
    filter: [
      ["", "All questions"],
      ["accepted", "Accepted answer"],
      ["unaccepted", "No accepted answer"],
    ],
  },
};
function options(id, values) {
  $(id).replaceChildren(
    ...values.map(([value, label]) => {
      const n = element("option", label);
      n.value = value;
      return n;
    }),
  );
}
function setSource(source) {
  state.source = source;
  for (const b of document.querySelectorAll("[data-source]"))
    b.setAttribute("aria-pressed", String(b.dataset.source === source));
  options("sort", config[source].sort);
  options("filter", config[source].filter);
  $("filter-name").textContent =
    source === "github" ? "Language" : "Answer status";
}
function renderResults() {
  $("results").replaceChildren(
    ...state.items.map((i) =>
      card(
        i,
        state.saved.some((s) => s.id === i.id),
        toggleSave,
      ),
    ),
  );
}
function renderSaved() {
  $("saved-count").textContent = state.saved.length;
  $("saved").replaceChildren(
    ...(state.saved.length
      ? state.saved.map((i) => card(i, true, toggleSave, "h3"))
      : [
          element(
            "p",
            "A useful find deserves a place here. Save a repository or question to start your library.",
            "empty-state",
          ),
        ]),
  );
}
function toggleSave(item) {
  const active = document.activeElement,
    scope = active?.closest("#saved") ? "saved" : "results",
    id = item.id;
  state.saved = state.saved.some((i) => i.id === id)
    ? state.saved.filter((i) => i.id !== id)
    : [item, ...state.saved];
  storage.write(keys.saved, state.saved);
  renderResults();
  renderSaved();
  const next =
    [...$(scope).querySelectorAll("[data-resource]")].find(
      (b) => b.dataset.resource === id,
    ) || $(scope).querySelector("button");
  if (next) next.focus();
  else
    ($("library-title").setAttribute("tabindex", "-1"),
      $("library-title").focus());
  $("storage-status").textContent =
    $("storage-status").textContent ||
    "Library updated. Resources are saved in this browser.";
}
function renderHistory() {
  $("history").replaceChildren(
    ...(state.history.length
      ? state.history.map((i) => {
          const b = element(
            "button",
            i.query +
              " · " +
              (i.source === "github" ? "GitHub" : "Stack Overflow"),
          );
          b.type = "button";
          b.addEventListener("click", () => {
            setSource(i.source);
            $("query").value = i.query;
            $("sort").value = config[i.source].sort.some(([value]) => value === i.sort)
              ? i.sort
              : "relevance";
            $("filter").value = config[i.source].filter.some(([value]) => value === i.filter)
              ? i.filter
              : "";
            run();
          });
          return b;
        })
      : [element("p", "Your recent searches will appear here.")]),
  );
  $("clear-history").disabled = !state.history.length;
}
function parameters() {
  return {
    source: state.source,
    query: $("query").value.trim(),
    sort: $("sort").value,
    filter: $("filter").value,
    page: 1,
  };
}
async function run(more = false) {
  const params = more ? { ...state.last, page: state.page + 1 } : parameters();
  if (!params || params.query.length < 2 || params.query.length > 120) {
    $("status").textContent = "Enter a search between 2 and 120 characters.";
    $("query").focus();
    return;
  }
  const id = ++state.request;
  state.busy = true;
  $("results").setAttribute("aria-busy", "true");
  $("status").textContent =
    "Searching " +
    (params.source === "github"
      ? "GitHub repositories"
      : "Stack Overflow questions") +
    "…";
  $("retry").hidden = true;
  $("more").hidden = true;
  if (!more) {
    state.items = [];
    renderResults();
    state.last = params;
    state.page = 1;
  }
  try {
    const data = await search(params);
    if (id !== state.request) return;
    state.page = params.page;
    state.items = more
      ? [
          ...state.items,
          ...data.items.filter(
            (i) => !state.items.some((old) => old.id === i.id),
          ),
        ]
      : data.items;
    state.more = data.more;
    renderResults();
    $("results-title").textContent =
      (params.source === "github" ? "Repositories" : "Questions") +
      " for “" +
      params.query +
      "”";
    $("status").textContent = state.items.length
      ? state.items.length +
        " results loaded." +
        (data.partial
          ? " GitHub returned partial results. Try a narrower query."
          : "") +
        (data.quota !== undefined
          ? " Stack Exchange daily requests remaining: " + data.quota + "."
          : "")
      : "No results found. Try a broader keyword or reset your filters.";
    $("more").hidden = !state.more;
    state.history = addHistory(state.history, { ...params, page: 1 });
    storage.write(keys.history, state.history);
    renderHistory();
  } catch (e) {
    if (id !== state.request) return;
    $("status").textContent = e.message;
    $("retry").hidden = false;
    $("retry").onclick = () => run(more);
  } finally {
    if (id === state.request) {
      state.busy = false;
      $("results").setAttribute("aria-busy", "false");
    }
  }
}
$("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});
for (const b of document.querySelectorAll("[data-source]"))
  b.addEventListener("click", () => {
    if (state.source === b.dataset.source) return;
    setSource(b.dataset.source);
    if ($("query").value.trim().length >= 2) run();
    else {
      ++state.request;
      state.items = [];
      renderResults();
      $("status").textContent = "Choose a topic to begin exploring.";
      $("more").hidden = true;
      $("retry").hidden = true;
      $("results").setAttribute("aria-busy", "false");
    }
  });
for (const b of document.querySelectorAll("[data-query]"))
  b.addEventListener("click", () => {
    $("query").value = b.dataset.query;
    run();
  });
for (const id of ["sort", "filter"])
  $(id).addEventListener("change", () => {
    if ($("query").value.trim().length >= 2) run();
  });
$("reset").addEventListener("click", () => {
  setSource(state.source);
  if ($("query").value.trim().length >= 2) run();
});
$("clear-history").addEventListener("click", () => {
  state.history = [];
  storage.write(keys.history, []);
  renderHistory();
  $("status").textContent = "Recent searches cleared.";
});
$("more").addEventListener("click", () => run(true));
window.addEventListener("storage", () => {
  state.saved = storage.read(keys.saved).filter(validResource);
  state.history = storage
    .read(keys.history)
    .filter((i) => i && typeof i.query === "string" && config[i.source])
    .slice(0, 8);
  renderSaved();
  renderResults();
  renderHistory();
});
setSource("github");
renderHistory();
renderSaved();

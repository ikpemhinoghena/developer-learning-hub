# Developer Learning Hub

A Vite and vanilla JavaScript application for discovering public GitHub repositories and Stack Overflow questions. Discover. Learn. Build.

## Develop

Use Node.js 20.19+ or 22.12+ (see package.json for supported engine ranges).

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173/developer-learning-hub/ (Vite chooses another port if 5173 is occupied).

```sh
npm test
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```

Preview defaults to http://127.0.0.1:4173/developer-learning-hub/.

## Architecture

- `index.html`: semantic page shell, navigation, discovery, library, metadata.
- `src/main.js`: application state, search journeys, history, library, latest-request protection.
- `src/services/search.js`: public API URLs, normalization, caching, deduplication, timeout, quotas and backoff.
- `src/components/results.js`: safe DOM card rendering, attribution, external link allowlist.
- `src/components/navigation.js`: accessible mobile menu with Escape support.
- `src/utils/storage.js`: versioned local storage support with session fallback and bounded history.
- `src/styles/main.css`: responsive interface, focus styles and reduced motion.
- `tests/core.test.js`: dependency-free service and persistence tests.

No credentials, server, authentication, or new dependencies are required. Never put private tokens in frontend code or VITE_ variables.

## Search behavior

Search explicitly with Enter, the search button, or a suggested topic. Source switches, filters, and sorts repeat the current query. GitHub supports best match, stars, forks, updated date, and a selection of language filters. Stack Overflow supports relevance, votes, activity, creation date, accepted answers, and no-accepted-answer filtering. These controls query the APIs rather than filtering only the visible page.

Pages contain up to 12 resources. Load more appends unique IDs. GitHub's search window is bounded; the hub stops at 83 pages (996 resources) to avoid exceeding its 1,000-result limit. Identical requests share an in-flight promise; results are cached for 60 seconds with a 50-entry cap. Requests time out after 15 seconds. Rate-limit/backoff cooldowns apply for the current page session; reloading resets them. A zero Stack Exchange quota conservatively pauses requests for 24 hours.

Saved resources and the eight latest successful searches are local to the current browser and origin. They are snapshots rather than live-synced resources. No data is sent to an application backend. Searching does send keywords to the selected public API. Storage failures show a notice and preserve changes in memory for the current session. Other open tabs refresh their saved/history views after storage changes.

Question titles are decoded in an inert document and inserted as text, never as live HTML. External resource links allow only HTTPS GitHub/Stack Overflow hosts and open a new tab with noopener/noreferrer. Question cards link to the original question and its author when available, and show the API content-license field; the page provides Stack Overflow and CC BY-SA attribution.

## Deployment and verification

The existing GitHub Pages workflow and Vite base `/developer-learning-hub/` remain intact. No deployment was performed. See `COMPLETION_REPORT.md` for implementation details and `QA_REPORT.md` for the final audit, confirmed fixes, test results, and required browser checks.

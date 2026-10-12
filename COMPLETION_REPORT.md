# Week 5 + Week 6 completion report

## Executive summary

Implemented both public API integrations and a complete discovery interface with real-data cards, source switching, API sorting/filtering, pagination, browser-local bookmarks, recent searches, loading/error feedback, and responsive navy/mint styling. Preserved Vite, vanilla JavaScript, ES modules, Git history, the Pages workflow, and `/developer-learning-hub/` base.

Implementation and automated/service verification are complete. Browser visual, accessibility, and end-to-end journey verification remains outstanding because no browser automation runtime is available in this session. Accordingly, responsive rendering and the complete integration-testing task are not claimed as fully verified. No commit, push, or deployment was performed.

## Files

Created:
- `src/services/search.js`
- `src/components/results.js`
- `src/utils/storage.js`
- `tests/core.test.js`
- `COMPLETION_REPORT.md`

Modified:
- `index.html`
- `src/main.js`
- `src/styles/main.css`
- `package.json` (expanded check script and added dependency-free test script)
- `README.md`

No dependencies added. `package-lock.json`, `vite.config.js`, `src/components/navigation.js`, and `.github/workflows/deploy.yml` were preserved. Build-generated `dist/` output is ignored by Git. No unrelated repository files were edited; the separate `the-wdd330`/Sleep Outside repository was not modified. Its installed formatter was invoked read-only against this project's files.

## Week 5 results and exact source paths

| Task / Trello card title | Implementation and evidence | GitHub source paths |
| --- | --- | --- |
| W5-1: Create mobile-responsive layout | Responsive single/two-column layout, mobile navigation, touch controls, wrapping metadata, fluid headings. CSS reviewed; viewport/overflow checks pending. | `index.html`, `src/styles/main.css`, `src/components/navigation.js` |
| W5-2: Connect to GitHub REST API | Real unauthenticated repository endpoint; live basic and filtered/sorted probes passed; automated errors/cache/limits tests passed. | `src/services/search.js`, `src/main.js` |
| W5-3: Connect to Stack Exchange API | Real keyword question endpoint; live basic and accepted-answer/votes probes passed; backoff test passed; attribution included. | `src/services/search.js`, `src/components/results.js`, `index.html` |
| W5-4: Implement basic search functionality | Keyword validation, Enter/form submit, two sources, request sharing, loading/empty/error/retry states. URL/service tests pass; browser journey pending. | `src/main.js`, `src/services/search.js`, `index.html` |
| W5-5: Display initial API results | Real responses normalized into repository/question cards; optional-field defaults and safe links tested. No fabricated results; initial page honestly prompts a search. Browser rendering check pending. | `src/components/results.js`, `src/services/search.js`, `src/main.js` |

The existing foundation remains operational: production Vite build succeeds, modular folders remain, and the HTML page shell is included in the build. These five tasks are implemented, but Week 5 must not be treated as fully browser-verified until the checklist below is completed.

## Week 6 results and exact source paths

| Task / Trello card title | Result | GitHub source paths |
| --- | --- | --- |
| W6-1: GitHub repository result cards | Name, owner, description, language, stars, forks, updated date, original link, save control. | `src/components/results.js`, `src/styles/main.css` |
| W6-2: Stack Overflow question result cards | Decoded title, tags, score, answers, accepted status, question link, author attribution and content license. | `src/components/results.js`, `src/styles/main.css` |
| W6-3: Filtering and sorting | Real API language/answer filters and source-specific sorts; live probes and URL tests passed. | `src/services/search.js`, `src/main.js`, `index.html` |
| W6-4: Saved resources | Source-prefixed stable IDs; save/view/remove; browser-local notice; storage fallback; cross-tab updates; focus restored after card refresh. Persistence helpers tested, browser journey pending. | `src/main.js`, `src/utils/storage.js`, `src/components/results.js` |
| W6-5: Recent searches | Eight successful searches with source/sort/filter; replay, clear, persistence and deduplication. Helper tests passed; browser replay pending. | `src/main.js`, `src/utils/storage.js` |
| W6-6: Loading and error handling | Live status, aria-busy, loading styling, empty states, timeout/network/HTTP errors, retry, cooldowns, quota and partial-results feedback. Service failure tests passed. | `src/main.js`, `src/services/search.js`, `src/styles/main.css` |
| W6-7: UI/UX redesign | New hero, learning-loop illustration built in HTML/CSS, cohesive navy/mint identity, discovery suggestions, explicit controls, learning library, polished cards. Visual QA pending. | `index.html`, `src/styles/main.css` |
| W6-8: SEO, accessibility, and performance | Metadata, canonical, OG, semantic landmarks/headings, labels, skip link, focus indicators, pressed states, live status, reduced motion, external link safety, no remote fonts/images. Formal browser/a11y audit pending. | `index.html`, `src/styles/main.css`, `src/components/results.js`, `src/main.js` |
| W6-9: Integration and user-journey testing | Twenty-two automated tests plus live API probes, syntax checks and production build pass. Full browser/mobile journeys remain incomplete. | `tests/core.test.js`, `COMPLETION_REPORT.md` |

## API implementation details

GitHub: `GET https://api.github.com/search/repositories`, `Accept: application/vnd.github+json`, no token. Parameters: `q`, optional language qualifier, optional `sort=stars|forks|updated`, `order=desc`, `per_page=12`, `page`. Default omits sort for best match. Handles missing optional fields, incomplete results, primary rate limits, retry-after, and secondary throttling with retry-after. Stops before exceeding the 1,000-result search window (83 pages of 12).

Stack Exchange: `GET https://api.stackexchange.com/2.3/search/advanced`, `site=stackoverflow`, `q`, `sort=relevance|votes|activity|creation`, `order=desc`, `pagesize=12`, `page`; optional `accepted=true` or `accepted=false`. Handles API error envelopes, `backoff`, zero quota, `has_more`, missing owners/tags, and HTML entities in titles. Cards link to original questions and author profiles where available and display content license. Attribution links are in the page footer beneath results.

Both sources share a 60-second bounded memory cache, identical in-flight request deduplication, 15-second timeout, no automatic retries, and explicit user retry. Request sequence IDs prevent late responses replacing newer searches. Cooldowns are session-local. No credentials or additional external configuration needed.

Official references consulted:
- https://docs.github.com/en/rest/search/search#search-repositories
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- https://api.stackexchange.com/docs/advanced-search
- https://api.stackexchange.com/docs/throttle

## Tests actually run

- `npm test`: 22 tests passed, 0 failed after the final audit (11 original tests and 11 audit tests). Covers API parameter encoding, answer filters, optional-field defaults, HTTPS host allowlist, history bounds/deduplication, storage corruption/failure fallback, request sharing/cache, network failure, HTTP/malformed payloads, Stack Exchange backoff, and GitHub rate-limit cooldown.
- `npm run check`: all application/service/component/storage modules and Vite config passed Node syntax checks.
- `npm run build`: passed; Vite 7.3.7. Approximate gzip output: HTML 2.60 kB, CSS 2.57 kB, JavaScript 5.00 kB. No runtime dependencies added.
- Live unauthenticated GitHub search returned `airbnb/javascript`.
- Live GitHub language/descending-stars probe returned two JavaScript repositories.
- Live Stack Exchange keyword search returned “How can I remove a specific item from an array in JavaScript?” and reported remaining quota.
- Live Stack Exchange votes/accepted-answer probe returned two questions and an accepted-answer ID.
- Source formatting completed using an already installed Prettier executable. The first formatter invocation used a nonexistent legacy CLI path; corrected to `bin/prettier.cjs` and formatting succeeded. This did not affect builds or tests.
- Browser automation packages and a callable Computer Use runtime were unavailable; no browser screenshot, Lighthouse, axe, screen-reader, or visual test is claimed.

## Required manual verification

1. Start the app; search JavaScript with Enter. Confirm actual GitHub cards and working external links. Load more and check unique appended results.
2. Change stars/forks/updated sorting and JavaScript/Python language filtering. Confirm results reflect controls; reset filters.
3. Switch to Stack Overflow; search JavaScript. Check decoded titles, author/question links, tags, score, answer counts and accepted status. Test votes/activity/creation sorting and accepted/no-accepted-answer filters.
4. Save one resource from each source; open Saved resources; reload. Confirm persistence, counts, removal and focus behavior. Open a second tab and confirm storage changes sync views.
5. Search several topics, repeat history items with their saved source/filters, reload, clear history, and verify an eight-entry limit.
6. Submit whitespace and one character; try a query with no matches. Confirm validation and empty feedback. Go offline in browser devtools; search, restore connection, retry. Simulate HTTP 429/403 and Stack Exchange error/backoff responses with interception rather than deliberately exhausting public quotas.
7. At 320, 375, 390, 768, 1024 and 1440 CSS pixels: inspect hero, search, dropdowns, long titles/tags, cards, library and footer. Confirm no horizontal overflow and usable 44-pixel controls. Test 200% zoom and mobile landscape.
8. On mobile, open Menu, follow an anchor, reopen and press Escape. Confirm expanded state and focus restoration. On desktop confirm Menu is hidden and links remain visible.
9. Navigate by keyboard only; inspect focus visibility, save/remove focus, skip link, form labels, live loading/error announcements, and external-link announcements. Check with a screen reader and automated accessibility tooling; measure contrast.
10. Run Lighthouse against a production preview and inspect the console for runtime/CORS errors. Honor prefers-reduced-motion. Verify the Pages base path serves assets and links.

## Limits and product notes

Client-rendered API cards are not guaranteed to be indexed or used in social previews. Static page metadata improves the landing page; resource-detail SEO would require a later prerendering/server-rendering strategy. No OG preview image was added. No unsupported indexing claim is made.

Unauthenticated API quotas are shared per relevant API/IP rules and can be exhausted by others. No private token belongs in Vite variables. Cooldowns reset on reload; users should not refresh to bypass API instructions. Stack Exchange's zero-quota pause is conservative rather than an exact reset prediction. Saved resources are snapshots and require a new search for fresh metadata. There is no cloud sync or backend.

## Trello review

No Trello cards were changed. Use the exact task titles in the tables as the Done candidates after their respective verification. Original card IDs/URLs were not provided. W5-2, W5-3 and W6-3 have live API and automated evidence; card rendering, persistence UI, accessibility and responsive tasks still require browser acceptance. W6-9 must remain in verification until the browser checklist passes. Do not mark all Week 5 work fully verified based solely on this report.

## Local commands and Git status

Run `npm run dev -- --host 127.0.0.1` and visit `http://127.0.0.1:5173/developer-learning-hub/`. No server is intentionally left running.

Working tree now contains five modified tracked files and seven untracked files, including the final audit report and audit regression tests. See QA_REPORT.md for the final expanded porcelain status. No commit, push, deploy, workflow changes, Git history edits, or unrelated file modifications were performed.


## Final QA update ? 12 October 2026

The final audit reproduced and fixed six API/storage failure-path gaps plus the misleading Stack Exchange no-answer filter. The filter now means ?No accepted answer? and uses accepted=false; answers=0 is a minimum-answer constraint and was incorrect for the original label. History replay defaults obsolete or unknown sort/filter values safely. The audit added tests/audit.test.js (11 tests); all 22 tests, syntax checks, build, and production HTTP asset checks passed. npm audit reported zero known vulnerabilities. Browser journeys remain pending and the recommendation is NOT READY TO DEPLOY until the manual acceptance checks pass. QA_REPORT.md contains the final evidence and file inventory.

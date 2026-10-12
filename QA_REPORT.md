# Final pre-deployment QA audit

Date: 12 October 2026 (Africa/Lagos)

## Recommendation: NOT READY TO DEPLOY

The API services, automated tests, syntax checks, production build, dependency audit, and production HTTP/asset checks pass after the confirmed defects below were fixed. Final browser acceptance is still outstanding: search/render/save/reload/history journeys, responsive overflow at 375/768/1440 pixels, keyboard behavior, screen-reader status announcements, and console/CORS checks. No callable browser or Computer Use runtime is available in this session. Code inspection and Node HTTP checks cannot establish those browser results.

No commit, push, deployment, Trello update, paid service, or credential creation was performed. No files in Sleep Outside were read or modified during this audit.

## Repository identity and scope

- Absolute working directory: `C:\Users\etiuz\Videos\developer-learning-hub`
- Git root: `C:/Users/etiuz/Videos/developer-learning-hub` (same absolute Windows folder)
- Branch: `main`
- Origin fetch and push: `https://github.com/ikpemhinoghena/developer-learning-hub.git`
- Root and origin matched before any changes.
- Git status emitted warnings about access to the user's global ignore file. Repository-local status and diff checks completed; no global Git configuration was changed.
- All audit edits and generated build files are inside the authorized project. No changes were made to Git configuration, dependency declarations, deployment configuration, or the lockfile during this audit.

## Week 5 results

PASS means the evidence supports that task at its stated scope. PARTIAL means implemented but required browser acceptance is missing; it does not mean a browser test passed.

| Exact task/card title | Result | Evidence performed | Source paths / outstanding verification |
| --- | --- | --- | --- |
| Set up Developer Learning Hub using Vite | PASS | `npm ls --all`, syntax check, build, production HTTP preview | `package.json`, `package-lock.json`, `vite.config.js` |
| Create project folder and file structure | PASS | Module imports resolved during build; service/storage/component tests executed | `src/main.js`, `src/services/search.js`, `src/utils/storage.js`, `src/components/results.js`, `src/components/navigation.js`, `src/styles/main.css` |
| Build initial HTML page layout | PASS for page shell | Built HTML served HTTP 200; all internal fragment targets resolved | `index.html`; visual appearance still requires browser acceptance |
| Create mobile-responsive layout | PARTIAL | Responsive CSS/navigation code reviewed | `src/styles/main.css`, `src/components/navigation.js`, `index.html`; widths, overflow and touch interaction not run |
| Connect to GitHub REST API | PASS for API service | Actual module used for live valid/empty queries, metadata assertions, language/stars filters, pages 1/2; mocked primary/secondary/429 limits | `src/services/search.js`, `tests/core.test.js`, `tests/audit.test.js` |
| Connect to Stack Exchange API | PASS for API service | Actual module used for live keyword queries, metadata, votes/accepted filters, pages 1/2, corrected unaccepted filter; mocked backoff/quota/errors | `src/services/search.js`, `tests/core.test.js`, `tests/audit.test.js`; browser original-link check pending |
| Implement basic search functionality | PARTIAL | Service queries/cache tested; form wiring, validation, latest-request guards inspected | `src/main.js`, `src/services/search.js`, `index.html`; Enter, source switches and UI retry need browser acceptance |
| Display initial API results | PARTIAL | Live data normalization and optional-field defaults tested; no fabricated data found | `src/components/results.js`, `src/main.js`, `src/services/search.js`; actual browser DOM appearance/link clicks pending |

## Week 6 results

| Exact task/card title | Result | Evidence performed | Source paths / outstanding verification |
| --- | --- | --- | --- |
| GitHub repository result cards | PARTIAL | Live normalized name/owner/description/language/stars/forks/date/URL inspected and asserted; safe links/defaults tested | `src/components/results.js`, `src/styles/main.css`, `src/services/search.js`; browser card appearance/clicks pending |
| Stack Overflow question result cards | PARTIAL | Live title/tags/score/answers/accepted/author/license/URL inspected; text-only rendering reviewed | `src/components/results.js`, `src/styles/main.css`, `src/services/search.js`; browser title decoding and attribution links pending |
| Filtering and sorting | PARTIAL overall; API behavior PASS | Live descending GitHub stars with JavaScript language and Stack Overflow votes with accepted=true verified; accepted=false verified after correction | `src/services/search.js`, `src/main.js`, `tests/core.test.js`, `tests/audit.test.js`; UI controls and remaining sorts need browser acceptance |
| Saved resources | PARTIAL | Two source-prefixed snapshots persisted/read/removed across storage-wrapper instances; malformed/failed storage tests pass; UI deduplication reviewed | `src/main.js`, `src/utils/storage.js`, `src/components/results.js`; actual save/remove/reload/cross-tab/focus pending; no bulk-clear UI is offered |
| Recent searches | PARTIAL | Eight-entry cap/deduplication tested; storage persistence tested; history replay/reset inspected; obsolete filter fallback fixed | `src/main.js`, `src/utils/storage.js`; browser replay/clear/reload pending |
| Loading and error handling | PARTIAL overall; service behavior PASS | Network/timeout/HTTP/non-JSON/malformed/API error envelopes/primary and secondary limits/backoff/zero quota tests pass | `src/services/search.js`, `src/main.js`, `src/styles/main.css`; live-region announcements and UI retry pending |
| UI/UX redesign | PARTIAL | Existing redesign reviewed and preserved | `index.html`, `src/styles/main.css`; responsive visual QA not performed |
| SEO, accessibility, and performance | PARTIAL | Metadata/landmarks/labels/focus/reduced-motion code reviewed; production gzip sizes measured; URL/unsafe-sink scans and dependency audit pass | `index.html`, `src/styles/main.css`, `src/components/results.js`, `src/main.js`; keyboard/screen-reader/contrast/Lighthouse pending |
| Integration and user-journey testing | PARTIAL | 22 tests, nine bounded live search requests, link probes, production preview HTTP checks | `tests/core.test.js`, `tests/audit.test.js`, `QA_REPORT.md`; full browser journeys outstanding |

## Automated checks actually executed

- Baseline: existing 11 tests passed, syntax check passed, build passed.
- Added six regression tests before fixes: all six failed, reproducing the listed error-path gaps.
- Final suite: `npm test` — 22 passed, 0 failed, 0 skipped (11 original + 11 audit tests).
- `npm run check` — all six listed application/config JavaScript syntax checks passed.
- `npm run build` — passed with Vite 7.3.7, eight modules transformed.
- Final approximate gzip sizes: HTML 2.60 kB, CSS 2.57 kB, JavaScript 5.00 kB.
- `npm ls --all` — exit 0; Vite is the sole declared development dependency, with no required dependency gaps. Omitted optional packages for other platforms or unused preprocessors are expected.
- `npm audit --json` — 0 known vulnerabilities at audit time. This is not a guarantee against future or undisclosed vulnerabilities.
- `git diff --check` — passed; line-ending warnings only.
- An initial edit attempt using Python could not run because Python is unavailable. No files were changed by that attempt; Node applied the fixes successfully afterward.

## API and link checks actually executed

Nine search requests were made serially through `src/services/search.js`, without credentials; no deliberate quota exhaustion or live rate-limit triggering:

1. GitHub `javascript`, best match: 12 results, real repository metadata (`airbnb/javascript`).
2. GitHub unique unusual query: 0 results, no further page.
3. GitHub `javascript`, JavaScript language, descending stars, page 1: 12 results; all languages and descending stars asserted.
4. Same GitHub query page 2: 12 results; first resource ID differs from page 1.
5. Stack Overflow `javascript`, relevance: 12 results with title, author, tags, score, answers, accepted state, license and original URL.
6. Stack Overflow votes and accepted=true, page 1: 12 results; descending score and accepted state asserted.
7. Same Stack Overflow query page 2: 12 results; first question ID differs from page 1.
8. Original no-answer filter: assertion FAILED because returned questions included answers, proving the bug. No success claimed for this request.
9. Corrected creation/accepted=false query: 12 results; every accepted flag false; quota reported as 291 in this response.

Rate limits, quota exhaustion, backoff, timeout and HTTP failures were tested with mocks rather than by abusing live services. Pagination URLs and GitHub's 83-page boundary were tested. Load More's actual browser click/append behavior is not verified.

External HEAD probes: GitHub original repository link HTTP 200; GitHub attribution homepage HTTP 200; CC BY-SA 4.0 link HTTP 200. Stack Overflow original-question link returned HTTP 403 to the automated HEAD request. Its API-supplied URL passed the HTTPS/hostname allowlist, but browser reachability remains unverified; the 403 alone does not establish a broken link. Author-profile links were inspected but not individually requested. No exhaustive external-link crawl was performed.

## Confirmed defects fixed

1. `response.json()` ran before error handling, so HTML/empty HTTP error bodies bypassed rate-limit cooldowns and displayed raw parsing errors. Non-JSON bodies now preserve HTTP handling, including 429 cooldowns.
2. GitHub secondary-limit HTTP 403 responses without `Retry-After` did not pause requests. Rate-limit/abuse messages now trigger the existing minimum pause. No automatic retry is introduced.
3. Successful `null` JSON responses were misclassified as network failures. Invalid top-level payloads now produce the helpful unexpected-response message.
4. Storage fallback did not retain the latest successful read, so a later read failure could hide saved resources during the session. Successful reads now update the in-memory fallback.
5. Well-formed JSON with a non-array storage shape was silently ignored. It now follows the damaged-storage notice/fallback path.
6. “No answers” incorrectly used Stack Exchange `answers=0`, a minimum rather than exact count. The control is now “No accepted answer” with the supported `accepted=false` parameter. The implementation, tests, README and completion report agree.
7. Saved-library cards used h4 directly under an h2. Library cards now use h3, while search cards retain h4 under the results h3; a shared CSS class preserves appearance. This correction was syntax/build-checked, not screen-reader tested.
8. Replaying stored obsolete/unknown sort/filter values could select no option and submit invalid parameters. Replay now falls back to best match/relevance and the default filter; this also handles history saved under the former filter.

The six pre-fix regression tests cover the first five fixes (HTTP 429 and HTTP 500 are separate cases); the other five audit tests cover answer-filter mapping, pagination limits, zero quota, API/timeout errors, and storage persistence/removal. The history fallback is inspected, not browser-tested.

## Security, accessibility and performance findings

- No credential-signature matches in the inspected application source or production JavaScript. No tokens, Authorization credentials, private environment variables, backend services, or new dependencies were introduced. This was a targeted scan, not an audit of all Git history.
- No innerHTML, outerHTML, insertAdjacentHTML, or eval usage found in inspected application files/bundle. API content is inserted with textContent. DOMParser decodes text in a detached document; parsed nodes are never inserted into the live document.
- External resource URLs must use HTTPS and the exact GitHub or Stack Overflow hostname; unsafe schemes and deceptive hostnames have tests. New-tab links include noopener/noreferrer and an accessible new-tab description.
- localStorage remains browser-local, versioned, bounded for history, and resilient to denied access/damaged formats. Saved entries are snapshots; no cloud sync. Bulk-clear saved resources is not an implemented UI feature.
- Semantic landmarks, skip link, labels, pressed/expanded states, visible focus rules, aria-live/aria-busy, 44-pixel control styles and reduced-motion rules are present. These are source findings, not proof of accessible browser behavior.
- The saved-library heading-level skip was corrected. Final keyboard, screen-reader and measured contrast verification still requires a browser.
- No remote font or large image requests; local SVG favicon; small build output. Browser performance/Lighthouse was not measured.
- Session-local API caches/cooldowns reset on reload. Stack Exchange zero-quota pause remains a conservative 24 hours. Do not reload to bypass a reported backoff.
- Client-rendered resource results have indexing limitations; metadata does not guarantee individual resource indexing. No social preview image is supplied.

Official references checked during the audit:
- [Stack Exchange advanced search](https://api.stackexchange.com/docs/advanced-search): `answers` is a minimum; `accepted` supports true/false.
- [Stack Exchange throttling](https://api.stackexchange.com/docs/throttle): backoff requirements and duplicate request guidance.
- [GitHub REST best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api): primary/secondary limit pauses.

## Build and deployment configuration

- `vite.config.js` still sets `/developer-learning-hub/`.
- No diff in `vite.config.js`, `.github/workflows/deploy.yml`, or `package-lock.json` versus HEAD.
- Workflow still installs with npm ci, builds dist, uploads the Pages artifact and deploys through the Pages action, on main push or manual trigger. Permissions/environment/concurrency remain intact.
- Existing checkout@v7 and setup-node@v7 release references were checked on their official GitHub release pages. The remaining existing Pages action references were inspected, not executed.
- Local production preview temporarily ran on port 4175. HTML, JS, CSS and favicon each returned HTTP 200, with the correct base path and content types. All fragment hrefs referenced existing IDs; no unresolved %BASE_URL% or development script path remained in built HTML.
- Preview was stopped afterward. GitHub Actions, remote Pages configuration and actual deployment were not executed, so they are not claimed as runtime-verified.
- The existing workflow does not run npm test or npm run check; those checks passed locally during this audit.

## Required manual acceptance before deployment

1. At 375, 768 and 1440 pixels, search each source, inspect long cards/tags, and confirm no horizontal overflow, readable controls and usable touch targets. Also test 200% zoom.
2. Submit with Enter; switch sources; change every sort and filter; reset; click Load More. Confirm actual displayed data and unique appended cards. Check original-question and author links in a browser.
3. Save one repository and one question; remove one; reload and confirm persistence/counts. Test another tab. Repeat a recent search, reload, clear history and verify no duplicates and an eight-entry limit.
4. Test empty/whitespace input, a no-match query, offline failure, restored connection and Retry. Simulate rate limits/backoff in devtools or interception instead of exhausting public quotas.
5. Navigate using keyboard only: skip link, source buttons, selectors, cards, save/remove focus, mobile Menu and Escape. Verify visible focus and status announcements with a screen reader; check contrast and heading order.
6. Enable reduced motion; inspect browser console and network for runtime/CORS errors; run Lighthouse/axe on the production preview. Record results before approving deployment.

## Trello eligibility

No cards were changed; original Trello IDs/URLs were not supplied. The exact known titles eligible based on completed verification at their scope are:

- Set up Developer Learning Hub using Vite.
- Create project folder and file structure.
- Build initial HTML page layout (page-shell scope; visual acceptance still pending).
- Connect to GitHub REST API (service scope).
- Connect to Stack Exchange API (service scope).

Keep the following in verification until the manual checks pass: Create mobile-responsive layout; Implement basic search functionality; Display initial API results; GitHub repository result cards; Stack Overflow question result cards; Filtering and sorting; Saved resources; Recent searches; Loading and error handling; UI/UX redesign; SEO, accessibility, and performance; Integration and user-journey testing. Those are the exact Week 5/6 titles from the supplied backlog. Once their browser acceptance passes, they are Done candidates. Full Week 5 or Week 6 completion is not asserted yet.

## Files changed during this audit

Modified existing work: `src/services/search.js`, `src/utils/storage.js`, `src/main.js`, `src/components/results.js`, `src/styles/main.css`, `tests/core.test.js`, `README.md`, `COMPLETION_REPORT.md`.

Created: `tests/audit.test.js`, `QA_REPORT.md`.

`index.html`, `package.json`, and the remaining baseline changes were already present before this audit and were preserved. Generated ignored `dist/` was rebuilt.

## Final Git status (expanded untracked files)

```text
 M README.md
 M index.html
 M package.json
 M src/main.js
 M src/styles/main.css
?? COMPLETION_REPORT.md
?? QA_REPORT.md
?? src/components/results.js
?? src/services/search.js
?? src/utils/storage.js
?? tests/audit.test.js
?? tests/core.test.js
```

Five modified tracked files and seven untracked files. Source paths in the task tables are relative to the confirmed GitHub repository root. No commit, push, deployment or unrelated repository modifications.

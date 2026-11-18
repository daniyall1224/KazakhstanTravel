# Kazakhstan Travel Company | FINAL PROJECT RUBRIC | Group SE-2516

**Source of requirements:** `Final Project Requirements.pdf` and `Final Project Presentation Guideline UPDATED!!!.pdf` (provided by the course).

**Status keys:** IMPLEMENTED = source-code feature is present and was exercised in an isolated browser test; PENDING = requires real website/account/team action; REVIEW = confirm on a real hosted site. **These are not guaranteed teacher scores.**

## Mandatory structure: at least 6 connected functional pages

**IMPLEMENTED: 8 pages.** `index.html` (tour catalog), `tour.html` (dynamic itinerary guides for all 6 tour IDs), `weather.html` (public API), `faq.html` (searchable FAQ), `team.html` (team), `contact.html` (two-step sign-up + demo contact), `login.html` (login), `profile.html` (traveler dashboard). All pages use shared navigation/footer and relative links; invalid `tour.html?id=...` receives a friendly fallback.

## Ten scored criteria

| # | Requirement | Points | Status | Exact implementation | Verification and what remains |
|---|---|---:|---|---|---|
| 1 | Responsiveness | 10 | **IMPLEMENTED** | `css/style.css` — Flexbox, Grid, 900/760/720/480/360 px breakpoints; `js/auth.js` — mobile menu | 8 pages checked at 320, 375, 768, 1280 px; no horizontal overflow detected. Verify physical phone after deploy. |
| 2 | Hosting | 5 | **PENDING** | Relative paths, `.nojekyll`, local `js/vendor/jquery.min.js`, `README.md` deployment guide | **Cannot be finished in files alone**. Publish to GitHub Pages/Netlify, test live routes, and fill repository URL + hosted URL in the separate `*_Links.txt`. |
| 3 | Light & dark | 5 | **IMPLEMENTED** | `js/script.js` `applyTheme()` + localStorage; inline early theme bootstrap in each HTML head; `css/style.css` tokens, `body.night`, `html.theme-night` | Theme toggling, cross-page saved preference, focus contrast checked in preview. |
| 4 | Design & UX | 20 | **IMPLEMENTED** | `css/style.css`; travel photography in `images/`; curated hero, 6 cards, new visual guides, responsive layout, semantic labels, skip links, accessible error messaging | Page screenshots supplied in report and `presentation/screenshots`. Final judgment subjective; check on real display. |
| 5 | Enhanced JS: authentication | 25 (shared with next two) | **IMPLEMENTED** | `contact.html`, `login.html`, `profile.html`; `js/auth.js`; `localStorage` keys `kzt_users_v1`, `kzt_active_v1`, `kzt_saved_v1:<email>` | Tests for user creation, wrong credentials, valid session, profile display, save/remove favorite, logout. Only a school simulation; NEVER use real passwords. |
| 5 | Enhanced JS: validation |  | **IMPLEMENTED** | `js/auth.js` validates name/email/KZ phone/password strength/confirmation; `js/script.js` validates homepage name and popup subscription; `contact.html` includes strength meter & show/hide controls | User-friendly inline errors and `aria-invalid`; all forms `novalidate`; no forbidden `required`, `pattern`, `minlength`, `maxlength`, `min/max`, or `type="email"`. |
| 5 | Enhanced JS: search and filters |  | **IMPLEMENTED** | `js/script.js`: live search + autocomplete, category, price, sorting, Reset filters, persistence, FAQ search and matched-text highlighting | Live filtering and combined filter/sort/search exercised, as well as saved filter selection. |
| 6 | Animated buttons/UI effects | 5 | **IMPLEMENTED** | `css/style.css` hover/lift, star animation, progress, transitions, scroll-to, reduced-motion support; `js/script.js` counters, jQuery toasts, spinner, lazy images, copy buttons | Controls and animations in preview. Sound is opt-in/off by default. |
| 7 | External public API | 10 | **IMPLEMENTED / REVIEW** | `js/weather.js` `fetch()` + `async` / `await` of Open-Meteo; `weather.html`, 6 destinations, loading/error/timeout/retry; guide-to-city URL parameter | Tested with synthetic successful API JSON and HTTP 503. **Real live connection still needs verification on hosting**; mock screenshot clearly labeled. |
| 8 | Feature cohesion | 10 | **IMPLEMENTED** | Shared `js/tours-data.js` powers catalog + itinerary; catalog → guide → destination weather → profile favorites; FAQ travel topics. | All details and prices are labeled *sample* so there is no fake booking offer. |
| 9 | Presentation | 5 | **PREPARED / PENDING** | `PRESENTATION_NOTES.md` includes 4:40–4:55 run-of-show, feature order and speaking prompts. `presentation/screenshots/` backup captures | Both teammates must speak/demo and rehearse; final score depends on live presentation. |
| 10 | Code structure | 5 | **IMPLEMENTED** | `css/style.css`, `js/script.js` (original jQuery interactions), `js/auth.js`, `js/weather.js`, `js/tours-data.js`, `js/tour-detail.js`, `js/vendor/jquery.min.js`, `images/`, README | JavaScript files passed `node --check`; all relative href/src paths verified. Vendor jQuery minified intentionally. |

**Scoring note:** The rubric totals 100 points. Do not interpret this document as an award of 100/100; instructor scoring includes subjective design and presentation judgments and external hosting.

## Technical test summary

- Structural: 8 HTML files; every local referenced HTML/CSS/JS/image exists; all forms have `novalidate` and no banned validation attributes; node syntax check passed on all application `.js` files.
- Browser DOM tests: sign-up validation (missing/incorrect/success); duplicate account validation supported in code; login checks; localStorage session; user profile and wishlist; name validation; live tour search/filter/price sort/reset; dark-mode persistence; FAQ matching; detail URL and day-plan generation; promo code copying and modal newsletter logic.
- API: deterministic success payload and HTTP 503 tested; front end handles a 12-second timeout with a retry message.
- Responsive: all 8 pages inspected in isolated Chromium layout at 320, 375, 768, 1280 CSS pixels; no horizontal overflow in these checks. Screenshots include synthetic demo-account details and synthetic weather fixture; they are **not** production/live screenshots.
- Limitation of environment: direct HTTP navigation to a local web server was blocked by the browser security policy, so end-to-end multi-page navigation and a live external weather request need a final real-domain check after deployment. Linked local files were independently verified.

## Strict Moodle submission (missing/wrong files risks -30 points)

Submit **all three separate files** (ZIP + PDF + TXT):
1. `KazakhstanTravel_SE-2516_FinalProject.zip` — the complete project.
2. `KazakhstanTravel_SE-2516_Report.pdf` — cover/team/goal/roles, page descriptions, feature descriptions and screenshots.
3. `KazakhstanTravel_SE-2516_Links.txt` — TWO real URLs (code repository AND published website). **This has blank placeholders by user request.**

Each member of the team must submit all three files individually in Moodle, not just one member. Do not submit an archive-only bundle or a DOCX report.

## Only steps that cannot truthfully be completed here

1. Publish actual repository and deployed website; insert real addresses in TXT; test HTTP links/images and Open-Meteo on that live site.
2. Confirm actual division of work for the named teammates. The report clearly labels its role allocation as a **draft** until the team approves it.
3. Rehearse and perform a 4:30–5:00 presentation with both teammates; verify against the teacher's timing policy.

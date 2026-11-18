# Five-minute demonstration — Kazakhstan Travel Company

**Suggested target:** 4 minutes 45 seconds, not over 5:00. Instructors deduct 2 points for each additional 30 seconds over 5 minutes. Both team members should actively speak or demonstrate. The speaker division below is **only a proposal**; confirm it before presenting.

## 0:00–0:35 — Introduction (speaker 1)

"Hello! We are the Kazakhstan Travel Company team, Group SE-2516: Zamanbekov Olzhas and Sapargaliyev Danial. Our assignment builds on our previous jQuery website. Our target audience is travelers who want inspiration for Kazakhstan destinations and practical trip information. Everything is a free student demonstration, not a real booking service."

Display the desktop homepage, the travel hero and six destination cards.

## 0:35–1:20 — Responsive design and UI (speaker 1)

Show desktop and mobile viewport sizes (or use backup images). Open mobile navigation, show images/cards adapting to one column. Toggle from light to dark and navigate to the FAQ; explain `localStorage` preserves the choice across pages. Demonstrate hover transition and scroll progress briefly. Mention accessible keyboard navigation and `prefers-reduced-motion`.

## 1:20–2:05 — Search, tours and related features (speaker 1)

Type "Charyn" in the search field. Select **Nature**, show filter results; sort by price; press **Reset filters**. Open **View itinerary** to show our new guide page: sample day-by-day schedule, highlights, related trips, links to destination weather and traveler wishlist. Explain that both the card and guide share one `js/tours-data.js` source.

## 2:05–3:05 — JavaScript forms and authentication (speaker 2)

Open Sign up. Click Next with empty fields, show inline errors; enter a test name/email/phone and a **fake** complex password. Show strength bar, show/hide control, and confirmation check; complete the account. Open Log in with test credentials, land on My profile; show stored name/email/phone; save a tour and remove it. Point out `js/auth.js`, client-side validation, and localStorage. Stress this is a university-only authentication simulation.

## 3:05–3:55 — External API integration (speaker 2)

Open Live weather, select a city or follow the tour's weather link. Show temperature, humidity, wind and daily min/max. Explain `js/weather.js` uses Open-Meteo `fetch` and `async/await`, presents a loading state and gracefully handles timeout/HTTP failures with Retry. If internet is down, use backup screenshot; **do not describe the fixture screenshot as a real-time reading**.

## 3:55–4:40 — Summary, technology and future work (speaker 2)

"We developed eight connected pages with responsive Grid/Flexbox, consistent themes, searchable content, registration and profiles, visual effects and a public API. The JavaScript is split into dedicated modules and jQuery is bundled locally. Future improvements include a secure backend, verified travel providers and real booking functionality. Thanks for watching!"

## 4:40–4:55 — Questions and buffer

Show the architecture/criteria table in the PDF or README if asked. Stop within the five-minute limit.

## Demo checklist

- Publish the website first and keep both URLs ready.
- Prepare a **fictional account** in the browser and an unused **fictional email** for sign-up.
- Open `index.html`, `tour.html?id=charyn`, `weather.html`, `contact.html`, `login.html`, `profile.html` in tabs before starting.
- For device comparison use DevTools responsive mode (Desktop 1280px → Tablet 768px → Phone 375px).
- Rehearse the order and timing with both speakers. Never edit source code during the presentation.
- Backup screenshots are in `presentation/screenshots/` and the PDF report. Demo profile data and weather fixtures are synthetic.

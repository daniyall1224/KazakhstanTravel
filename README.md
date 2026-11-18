# Kazakhstan Travel Company — Final Web Development Project

**Group:** SE-2516 | **Type:** 8 connected HTML pages, responsive static frontend.

An enhanced continuation of the team's original **Assignment6_jQuery**. The project showcases Kazakhstan tour inspiration, individual itineraries, destination weather and a simulated account with locally saved favorites. All prices, trip plans and contact/promo information are **demonstrative examples**, not real offers. There is no real booking, payment or email delivery.

## Eight pages

| Page | What it demonstrates |
|---|---|
| `index.html` | Hero, 6 tour cards, live search/autocomplete, category + price filters, sorting/reset, ratings, gallery, popup, animated interactions |
| `tour.html?id=charyn` | One dynamic tour-detail template for 6 destinations with image, highlights, daily plan, hints, related trips, weather link and favorites |
| `weather.html` | Open-Meteo public `fetch()` API, 6 locations, loading/current conditions/timeout/error/retry, deep links like `?city=charyn` |
| `faq.html` | Live FAQ search, highlighted matches, keyboard-accessible accordion; truthful statements about the educational prototype |
| `team.html` | Team members, lazy-loaded photos and project mission |
| `contact.html` | Two-step sign-up, JS validation of name, email, Kazakhstan mobile number, complex password/confirmation, inline messages, strength meter |
| `login.html` | Email/complex password validation, credential check, saved session and redirect to profile |
| `profile.html` | Name, email, phone, join date, save/remove/view itinerary wishlist, logout |

## Running locally

Run `python -m http.server 8000` from the extracted project folder and browse `http://localhost:8000/` (or use VS Code Live Server). No build tools or package installation are needed. Images and jQuery are included locally. Internet access is needed for real live weather.

Demo registration: use a **fake** email and a unique **fake** password such as `Practice123!`, never your real login details. Then Log in, select a tour, choose **Save to my trips**, and view/remove it from the profile. Clear website localStorage to reset all demo users.

## Deploying to GitHub Pages (the hosting criterion)

1. Create a public GitHub repository.
2. Upload the **contents inside** this project folder to its root, keeping `index.html`, `tour.html`, `css/`, `js/` and `images/` in the same relative structure.
3. In GitHub **Settings → Pages**, use **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. When the live site is published, verify every menu page, tour guide URL, login/signup flow, light/dark modes, mobile layout and actual weather API request; images must render and navigation must not return 404.
5. Insert the distinct GitHub **repository URL** and **live website URL** in the separate `KazakhstanTravel_SE-2516_Links.txt`. The fields are left for the student to fill as requested.

Netlify drag-and-drop static deployment is an alternative. This document cannot itself publish a site or supply real URLs.

## Structure

```text
KazakhstanTravel_SE-2516/
  index.html                   main tour catalog
  tour.html                    dynamic detail template for 6 tour IDs
  weather.html                 public weather API view
  faq.html, team.html          information pages
  contact.html, login.html, profile.html
  css/style.css                shared design, responsive layout & themes
  js/script.js                 Assignment 6 jQuery plus new sorting/reset/validation
  js/auth.js                   registration/login/profile/session/wishlist
  js/weather.js                weather fetch/error/timeout/retry
  js/tours-data.js             canonical 6-tour catalog, descriptions & plans
  js/tour-detail.js            renders selected tour from URL parameter
  js/vendor/jquery.min.js     included offline (not a CDN)
  images/                      travel and team imagery
  presentation/screenshots/   backup presentation captures (demo/mock data labeled)
  README.md
  CRITERIA_CHECKLIST.md       exact ten-rubric mapping & honest remaining steps
  PRESENTATION_NOTES.md       timed group talk and demo flow
```

## Client-side data and security caveats

- `theme`, `soundOn`, `travelerName`: appearance, optional sound and personalized greeting.
- `kzt_users_v1`, `kzt_active_v1`: local-only test account objects and active demo email.
- `kzt_saved_v1:<email>`: per-user saved tour IDs.
- `kzt_tour_filters_v1`, `kzt_weather_city_v1`, `tourRatings`: filters, city and demo ratings.
- `kzt_subscribers_v1`: demo newsletter emails, **never sent anywhere**.

**Warning:** The course explicitly requires localStorage authentication without a backend. This stores demo passwords in readable local browser storage and is **not secure for a real application**. Production authentication requires a backend, password hashing, safe server-managed sessions and privacy controls.

## Verification and restrictions

The code passed JS syntax checks and structural link validation. Interactive browser tests covered registration, login/session, profile, favorite updates, theme, search/filter/sort, weather API fixtures, and mobile/tablet/desktop CSS layout at 320, 375, 768 and 1280 px. Screenshots used for backup capture are local browser previews; fake account data and **mocked** weather values are disclosed. Direct HTTP navigation to a local server was blocked in the test environment, so **live-domain end-to-end checks are still required**.

See `CRITERIA_CHECKLIST.md` for rubric evidence and `PRESENTATION_NOTES.md` for the 5-minute demo plan.

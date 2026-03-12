Original prompt: Rebuild the TTRPG invite so `index.html` opens directly from disk, replace the immediate modal with an animated envelope-to-invite reveal, and make the UI feel intentionally designed on both desktop and mobile.

- Confirmed root cause of blank screen: the app booted from `/src/main.js` as a Vite module entry, which fails for direct-open usage.
- Reworked the source app around intro stages instead of a splash/modal shortcut.
- Bundled the app to `assets/app.js` and `assets/app.css`, and rewired `index.html` to use those direct-open-safe assets.
- Browser-tested the intro flow, guest personalization, acceptance transition, and dashboard rendering on desktop and mobile.
- Remaining note: live shared sync is still treated as hosted-only; direct-open mode intentionally stays local-first.
- Replaced the envelope flow with a shorter scroll-first sequence: name selection now happens on the landing screen, then the scroll reveal runs, then the user enters the board.
- Removed user-facing technical/debug copy from the landing experience and tightened the button wording.
- Updated the map URL to a precise Google Maps search for `8540 E McDowell Rd Lot 32, Mesa, AZ 85207` and added copy-address actions in the dashboard.

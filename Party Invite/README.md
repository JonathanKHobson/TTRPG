# March 21st TTRPG Madness

Static party invite app for Kyle's March 21, 2026 TTRPG gathering.

## Open it directly

The shipped entry point is [`index.html`](/Volumes/KyleSSD/Websites/Party%20Invite/index.html).
It is designed to work when opened directly from Finder/Desktop with no local web server.

The root page loads:

- [`assets/app.js`](/Volumes/KyleSSD/Websites/Party%20Invite/assets/app.js)
- [`assets/app.css`](/Volumes/KyleSSD/Websites/Party%20Invite/assets/app.css)

If you change the source files under [`src`](/Volumes/KyleSSD/Websites/Party%20Invite/src), regenerate those bundled assets before sharing the site.

## Development

1. Install dependencies:
   `npm install`
2. Rebuild the direct-open bundle:
   `npm run build`
3. Optional local dev server:
   `npm run dev`

## Sync behavior

The app supports three sync modes:

- `local`: default and safest for direct-open use; data persists on the current device
- `apps-script`: hosted-only live sync through a deployed Google Apps Script web app
- `emailjs`: hosted fallback that emails changes to Kyle instead of live-sharing them

When the site is opened directly from disk, it intentionally falls back to local persistence.

## Google Apps Script deployment

1. Create a Google Sheet.
2. Open `Extensions -> Apps Script`.
3. Paste [`google-apps-script/Code.gs`](/Volumes/KyleSSD/Websites/Party%20Invite/google-apps-script/Code.gs) into the editor.
4. Deploy as a web app with access set so the invite site can reach it.
5. Copy the deployed URL into `VITE_APPS_SCRIPT_URL`.

Apps Script is best treated as a hosted-mode enhancement, not a requirement for the desktop-open version.

The script creates and uses these tabs:

- `grocery_claims`
- `grocery_additions`
- `activity_votes`
- `activity_suggestions`
- `guest_details`
- `event_audit`

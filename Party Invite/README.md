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
- `emailjs`: hosted email notifications for guest submissions on GitHub Pages
- `apps-script`: optional hosted live sync through a deployed Google Apps Script web app

When the site is opened directly from disk, it intentionally falls back to local persistence.

When the site is hosted on GitHub Pages, use [`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) as the source of truth for hosted sync/email settings. The static build does not reliably consume `VITE_*` config once bundled for direct-open shipping.

The current hosted setup uses EmailJS with queued retries and one-time backfill from cached local submissions on the same device.

## EmailJS hosted setup

[`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) is currently configured with:

- `syncMode: "emailjs"`
- public key `DpN9hLocoU__4dYVX`
- service id `service_9wx16fe`
- template id `template_hjbmxbn`
- notification email metadata `Composer01@gmail.com`

Important:

- the actual destination email is ultimately controlled by the EmailJS template/service setup
- the app also passes `to_email` and `recipient_email` template params with `Composer01@gmail.com`
- if you want a different recipient, change [`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) and confirm the EmailJS template uses that variable

## Google Apps Script deployment

1. Create a Google Sheet.
2. Open `Extensions -> Apps Script`.
3. Paste [`google-apps-script/Code.gs`](/Volumes/KyleSSD/Websites/Party%20Invite/google-apps-script/Code.gs) into the editor.
4. Optional but recommended: in `Project Settings -> Script Properties`, add `NOTIFICATION_EMAIL=composer01@gmail.com`.
5. Deploy as a web app with access set so the invite site can reach it.
6. Copy the deployed URL into [`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) as `appsScriptUrl`.
7. Keep `syncMode: "apps-script"` in [`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) for the hosted GitHub Pages version.

Apps Script is best treated as a hosted-mode enhancement, not a requirement for the desktop-open version.

The script now:

- persists shared state in Sheets
- assigns a mutation id to each guest action
- retries notification emails safely without duplicating stored data
- can replay cached pending browser mutations after the site reconnects
- attempts a one-time backfill from a guest's locally cached invite state when hosted sync is first enabled

The script creates and uses these tabs:

- `grocery_claims`
- `grocery_additions`
- `activity_votes`
- `activity_suggestions`
- `guest_details`
- `event_audit`

## Shipping to GitHub Pages

1. Make source edits under [`src`](/Volumes/KyleSSD/Websites/Party%20Invite/src).
2. Rebuild the shipped bundle with `npm run build`.
3. Confirm [`party-invite.config.js`](/Volumes/KyleSSD/Websites/Party%20Invite/party-invite.config.js) contains the intended hosted EmailJS or Apps Script settings.
4. Commit the updated `Party Invite/` files to the [`JonathanKHobson/TTRPG`](https://github.com/JonathanKHobson/TTRPG) repo.

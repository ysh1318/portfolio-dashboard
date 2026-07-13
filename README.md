# Yash Awachar — Dashboard (private)

Separate deployment from the public site (spec §0.2 / §5). Firebase
Auth-gated, single-user. Manages leads, site copy, availability status,
and the projects list — all writing to the same Firestore project the
public site reads from, so changes go live instantly with no redeploy.

**Not linked from the public site.** Reachable only by its own URL
(e.g. `dash.yashawachar.dev`).

## Setup

```bash
npm install
cp .env.example .env   # fill in real Firebase config values — same
                        # Firebase project as the public site
npm run dev
```

### Creating the login account

There is no sign-up screen by design (single user). Create the one
account once, in the Firebase Console:

1. Authentication > Sign-in method > enable **Email/Password**.
2. Authentication > Users > **Add user** — Yash's email + a password.

That's the only account this app will ever accept.

## Deploy

```bash
npm run build
firebase deploy --only hosting
```

Make sure `.firebaserc` points at the real Firebase project ID first —
the same project ID as the public site's `.firebaserc` (they share one
Firestore + Auth backend, but are two separate Hosting sites/targets).
If you haven't set up a second Hosting site in this Firebase project yet:

```bash
firebase hosting:sites:create dash-yashawachar   # one-time
firebase target:apply hosting dashboard dash-yashawachar
```

then adjust `firebase.json`'s `"hosting"` key to `"target": "dashboard"`
instead of a bare config, per the Firebase multi-site docs.

## Firestore rules & indexes

This app does **not** own `firestore.rules` / `firestore.indexes.json` —
those are deployed from the public site's project (same Firestore
database, one set of rules). Don't run
`firebase deploy --only firestore:rules` from here; there's nothing to
deploy from this repo for that.

## Pages

- `/login` — email/password sign-in.
- `/` — Leads: table (sort by date, filter by status/source), click a row
  for a detail panel to edit status/notes.
- `/content` — Site Content: form mapped to `siteContent/main`.
- `/availability` — toggle availability, set a return date, banner text.
- `/projects` — add/edit/delete projects, numeric `order`, `visible` toggle.

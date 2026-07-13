# Yash Awachar — Portfolio & Client Dashboard: Complete Build Spec

This is the full, final specification for the rebuilt portfolio system. It covers the public multi-page site, the Firebase backend, and the private dashboard. Build to this spec in full — this is not a phased/MVP doc, it describes the finished product.

---

## 0. System Overview

Two separate deployed projects sharing one Firebase backend:

1. **Public site** — `yashawachar.dev` (or current Netlify domain until custom domain is bought). Multi-page marketing/portfolio site. No login required. Reads live content from Firestore.
2. **Dashboard** — separate deployment, e.g. `dash.yashawachar.dev` (different subdomain/project, NOT a route on the public site, for security and bundle-separation reasons). Firebase Auth-gated, single user (Yash only). Used to manage leads, edit site copy, manage the availability status, and manage the projects list — all without redeploying code.

Both connect to the same Firebase project (Firestore + Auth).

---

## 1. Design System (carry over from current site)

- **Palette**: white/glassmorphism cards (`bg-white/80 backdrop-blur-3xl`), gradient accents pink → purple → sky/indigo (`from-pink-400 via-purple-400 to-indigo-400`), amber for status/warning elements.
- **Shape language**: large rounded corners (`rounded-[2.5rem]`), pill-shaped nav/buttons (`rounded-full`).
- **Typography**: extrabold headings, slate-900 body text, slate-500 secondary text, uppercase tracked-wide micro-labels for nav/tags.
- **Avatar**: hexagon-framed anime-style illustrated avatar (`img/avatar-hex.png`, transparent PNG with its own baked-in gradient hex border) — do NOT wrap in an additional clip-path/frame div; display directly with a soft blurred gradient glow behind it (`bg-gradient-to-tr from-pink-300 via-purple-300 to-sky-300 opacity-40 blur-xl`).
- **Background**: soft blurred gradient "shard" blobs positioned absolutely behind content (already present in current build — retain).

---

## 2. Public Site — Sitemap & Page Content

### 2.1 Home (`/`)
- Header (sticky, pill-shaped) with nav: Home / Services / Industries / Work / Process / Pricing / Connect, and a "Let's Talk" CTA button linking to Connect.
- **Availability banner** directly below header (see §4.2) — live from Firestore, not hardcoded.
- Hero: headline, subtext (self-taught 18-year-old builder framing), avatar image, CTA buttons ("Get in Touch", "View My Work").
- Trust strip: Netlify Deploys / Google Cloud Run / AI Workflow / MVP Specialist (existing skew-banner style).
- Short teaser sections linking out to Services and Industries (2–3 sentence summaries + "Explore" links), so Home stays scannable and detail lives on dedicated pages.

### 2.2 Services (`/services` — overview page)
Overview of three service pillars, each with a short description and a link to its own detail page:
1. **Websites & Digital Presence** → `/services/websites`
2. **CBT / Test Engines** → `/services/test-engines`
3. **Business Management Tools** → `/services/management-tools`

#### `/services/websites`
- What's included: landing pages, multi-page business sites, WhatsApp-integrated contact/ordering, basic SEO setup, hosting/deployment handled end-to-end.
- Who it's for: any local business with no or weak online presence.

#### `/services/test-engines`
- Core offering, built around JEEMockLab: PDF-to-CBT conversion, exam-accurate interface (JEE/NEET/MHT-CET), instant scoring, batch-wide rank comparison, WhatsApp-shareable result links.
- Case study block referencing JEEMockLab (live link).

#### `/services/management-tools`
- Student/customer trackers, booking calendars, membership/attendance systems, service-history + reminder tools — framed generically so it applies across coaching, gyms, garages, salons, etc.

### 2.3 Industries (`/industries` — overview + one sub-page per sector)
This is the page linked directly to cold-pitch leads. Overview page lists all sectors as cards; each links to a dedicated page with: the specific pain point, what gets built, and relevant proof/case study if available.

Sub-pages required:
- `/industries/coaching` — JEE/NEET/MHT-CET coaching institutes (CBT tests, results-to-parents via WhatsApp, student tracking)
- `/industries/restaurants` — online menu, WhatsApp ordering, table booking
- `/industries/agri` — Krishi Seva Kendra catalog + WhatsApp ordering, farmer-relatable framing
- `/industries/real-estate` — property listing site + inquiry tracking
- `/industries/fitness` — gym membership tracker, renewal reminders
- `/industries/events` — decorator/caterer booking calendar + inquiry management, avoids date clashes
- `/industries/repair-services` — bike/car garage service-history tracker + reminder notifications

Each sub-page template:
- Headline naming the sector
- "The problem" (2–3 sentences, concrete pain point)
- "What I build" (bulleted, specific features)
- "Proof" (case study card if one exists, e.g. Career Point/JEEMockLab for coaching; otherwise omit this block)
- CTA to Connect, pre-filled context if possible (e.g. query param that pre-fills the WhatsApp message with the sector name)

### 2.4 Work (`/work`)
Expanded project grid (replaces current single-page projects section), pulling live from Firestore `projects` collection (see §4). Each card: image, title, description, tags, live link.

### 2.5 Process (`/process`)
How engagement works step by step (discovery call/message → proposal → build → demo → handoff/support). Keep existing content, expand if needed.

### 2.6 Pricing (`/pricing`)
Ranges, not fixed numbers, per service pillar:
- Websites & Digital Presence: starting range
- Test Engines: per-student/month model with a stated minimum floor (as discussed: ~₹40–60/student/month for ~4 tests, with a minimum monthly floor so small batches are still viable)
- Management Tools: one-time setup + optional monthly maintenance
- Note: "Final pricing depends on scope — reach out for a quote tailored to your business size."

### 2.7 Legal (`/legal/privacy`, `/legal/terms`)
- **Privacy Policy**: DPDP Act (India) aligned. Must cover: what personal data is collected (names, phone numbers, business info, student/customer data processed on behalf of clients), purpose of collection, data storage (Firebase/Google Cloud servers), retention, client rights (access/correction/deletion requests), contact for grievances.
- **Terms of Service**: scope of service, payment terms, revision policy, ownership of delivered code/assets, liability limits, termination conditions.
- These pages are linked in the site footer on every page.
- Separately (not on the website): maintain a **Service Agreement / Contract template** (PDF or doc) sent per client for signature before starting paid work — not a website page, a private document you send.

### 2.8 Contact / Connect (`/connect`)
- Form fields: name, business name, project type, subject, message.
- On submit: write a new document to Firestore `leads` collection FIRST (fire-and-forget, non-blocking), THEN redirect to WhatsApp with the message pre-filled (existing behavior — keep as is).
- Also show: WhatsApp direct link/button, email, and current availability status (pulled from the same `settings/status` doc as the banner).

---

## 3. Global Elements (every page)

- Sticky pill header with full nav (Home / Services / Industries / Work / Process / Pricing / Connect) + "Let's Talk" CTA.
- Availability banner (site-wide, not just Home) — live from Firestore.
- Footer: quick links, social (Instagram @ysh_1318), Privacy Policy / Terms links, copyright line.

---

## 4. Firebase Backend

### 4.1 Setup
- Firestore (Native mode), Authentication (Email/Password provider, single account — Yash only).
- Firebase config shared between public site and dashboard (same project, two separate app deployments).

### 4.2 Firestore Collections

**`siteContent/main`** (single doc — editable copy blocks)
```
{
  heroHeadline: string,
  heroSubtext: string,
  servicesIntro: string,
  industriesIntro: string,
  processIntro: string,
  pricingNote: string,
  connectIntro: string
}
```

**`settings/status`** (single doc — availability)
```
{
  isAvailable: boolean,
  availableFromDate: timestamp,
  bannerMessage: string
}
```

**`projects`** (one doc per project, auto-ID)
```
{
  title: string,
  description: string,
  imageUrl: string,
  liveUrl: string,
  tags: array<string>,
  order: number,
  visible: boolean
}
```

**`leads`** (one doc per inquiry, auto-ID)
```
{
  name: string,
  business: string,
  projectType: string,
  subject: string,
  message: string,
  sourcePage: string,
  status: string,
  notes: string,
  createdAt: timestamp
}
```

### 4.3 Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /siteContent/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /projects/{doc} {
      allow read: if resource.data.visible == true || request.auth != null;
      allow write: if request.auth != null;
    }

    match /leads/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 5. Dashboard (separate deployment)

Private, single-user tool. Not linked from the public site nav or footer.

### 5.1 Login
- Firebase Auth email/password screen. On success, redirect to dashboard home. Route-guard every dashboard page (`onAuthStateChanged` check, redirect to login if null).

### 5.2 Leads view
- Table of `leads`, sortable by `createdAt`, filterable by `status` and `sourcePage`.
- Click a lead → detail panel: edit `status` and `notes` inline, view full submitted message.

### 5.3 Content editor
- Form mapped to `siteContent/main` fields — edit and save, updates the live public site instantly (no redeploy).

### 5.4 Availability control
- Toggle for `isAvailable`, date picker for `availableFromDate`, text input for `bannerMessage` — saves to `settings/status`.

### 5.5 Projects manager
- List of `projects` with add / edit / delete, drag-reorder (or numeric `order` input), `visible` toggle to hide without deleting.

---

## 6. Domain & Hosting

- Public site: current Netlify deployment retained short-term; custom domain (e.g. `yashawachar.dev` or `.in`) recommended as the real professionalism upgrade — not a platform switch (Netlify vs. Cloudflare Pages subdomains are cosmetically equivalent).
- Dashboard: separate project/subdomain (e.g. Cloudflare Pages or Netlify, `dash.yashawachar.dev`), fully isolated from the public site's deploy pipeline.
- Contact form: WhatsApp-redirect behavior is host-independent (already confirmed) — no migration risk either way.

---

## 7. Out of Scope for This Build (explicitly excluded)
- No "client workspace" login/portal beyond the Connect page — clients are not given accounts; all client interaction is via WhatsApp/direct contact and separate signed service agreements.
- No payment processing integrated into the site itself at this stage.
- No blog/CMS beyond the `siteContent` editable fields defined above.

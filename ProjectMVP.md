//// 1. TrueTestify — MVP Milestones

Here’s Step 1 → Milestones (Sequential Delivery Plan)
TrueTestify — MVP Milestones
⚠️ Developer Rules
Work milestone by milestone, no skipping ahead.
CEO approves each milestone (demo + acceptance) before moving to the next
Multi-tenant: every review belongs to a business (business_id).
Respect storage limits and compliance at every step.


Milestone 1 — Accounts & Business Profiles
Goal: Businesses register and get a profile page.
 Why: Foundation of SaaS, everything ties to the business.
What to build:
Business registration/login (JWT-based).

Business profile page: truetestify.com/{business-slug}.

Fields: business_name, slug, logo, brand_color, website, contact_email.

Empty state: “No reviews yet.”

Acceptance:
CEO creates test business, URL works at /business-name.

Branding shows but no reviews yet.


Milestone 2 — Video & Audio Review Capture
Goal: Customers can record/upload video/audio reviews.
 Why: Core feature, unique selling point.
What to build:
In-browser/web app recorder (video + audio).

Upload flow with chunked uploads (1 MB chunks, resumable).

Auto-compression:

Video max 60s, 720p, 1–2 Mbps bitrate.

Audio max 60s.

Consent checkbox before recording:
 “I agree to record my review and allow {Business} to use it publicly.”

Store raw + compressed versions in S3 (private).

Acceptance:
CEO records a 30s video → compresses + saves.

Upload resumes correctly if interrupted.

Consent is mandatory.


Milestone 3 — Review Database & Dashboard
Goal: Businesses manage reviews.
 Why: Organize, moderate, and display.
What to build:
Reviews table: links video/audio/text to business.

Dashboard: shows list of reviews.

Default status = “Pending.”

Businesses can approve/reject.

Stats: number of reviews, storage used, remaining space.

Acceptance:
CEO dashboard shows 1 pending review.
Approve → moves to “Approved.”
Reject → disappears from public view.
Storage counter updates correctly.


Milestone 4 — Public Review Pages
Goal: Each business has a public-facing page.
 Why: Showcase reviews, customer trust.
What to build:
Public page at truetestify.com/{business-slug} shows:

Approved video reviews (hero).

Approved audio reviews.

Optional text reviews (lower priority).

Clean mobile-responsive layout.

Branding (logo + colors).

Acceptance:
CEO approves 1 video review → appears publicly at /business-slug.


Audio shows under video section.

If no video/audio, text reviews fill space.


Milestone 5 — Text Reviews (Optional Fallback)
Goal: Support businesses that want text-only fallback.
 Why: Accessibility + avoids empty pages.
What to build:
Toggle in dashboard: “Allow Text Reviews [Yes/No].”

Simple text submission form with consent.

Display under video/audio on public page.

Acceptance:
CEO enables text reviews → submits text review.

Appears under video/audio (or at top if no media reviews).

Disabling removes text review option.


Milestone 6 — Google Reviews Import
Goal: Import and display Google Business reviews.
 Why: Increases value quickly.
What to build:
OAuth connect to Google Business Profile.

Import: reviewer name, rating, date, text.

Store in DB, display below TrueTestify reviews.

Acceptance:
CEO connects test Google account → imports reviews.

Reviews appear in dashboard and public page.


Milestone 7 — Embeddable Widgets
Goal: Businesses showcase reviews on their own site.
 Why: Growth + integration.
What to build:
Generate embed code (JS or iFrame).

Widget styles:

Grid (multi-tile).

Carousel/slider.

Single spotlight.

Floating pop-up.

Mobile-responsive, brand colors applied.

Acceptance:
CEO copies embed code → pastes into demo site.

Widget loads, shows approved reviews.

Switching style updates widget appearance.


Milestone 8 — Storage & Billing
Goal: Tie storage usage to Stripe billing.
 Why: Revenue + cost control.
What to build:
Stripe subscription plans (e.g., 1 GB, 10 GB).

Track actual storage usage.

If payment fails → hide reviews from public.

If unpaid >1 year → delete data permanently.

Acceptance:
CEO subscribes → can use service.

Cancel subscription → reviews hidden.

Simulate 1 year unpaid → data deleted.


Milestone 9 — Privacy & Compliance Hardening
Goal: Legal compliance & security.
 Why: Protects platform, meets GDPR/CCPA.
What to build:
Consent logs: IP, user agent, timestamp.

Right-to-delete: businesses can delete review on request.

Secure S3 storage: private bucket + signed URLs.

HTTPS enforced everywhere.

Acceptance:
CEO checks consent logs → entries exist.

Delete request → review removed + logged.

Download links expire after set time.


🔑 Stage 1 MVP Complete When:
Businesses can collect video/audio/text reviews.

Approve & showcase them publicly.
Embed reviews on their own site.
Import Google reviews.
Storage tied to billing.
Privacy/compliance enforced.

//// 2. How to Use the Multi-Tenant Model

TrueTestify — How to Use the Multi-Tenant Model (Stage 1)
Read this first. All data belongs to a business. If your code doesn’t resolve the business correctly and filter by it, it’s wrong.

Simple Explanation (for the team)
Tenant = Business.
Every review, file, widget, or subscription belongs to one business (business_id).
Public Pages:
Business public URL = truetestify.com/{business-slug} → maps to one business_id.

Dashboard APIs:
Resolve business_id from the logged-in user’s JWT/session.
Never accept business_id from the client. Always resolve on the backend.


What to Build (Hard Requirements)

1) Tenant Keys on All Tables
Every table must have business_id.
 Examples:
reviews.business_id
pdf_assets.business_id
consent_logs.business_id
subscriptions.business_id
widgets.business_id
Businesses table:
businesses(id, slug, name, logo_url, brand_color, website, contact_email, …)

2) Tenant Resolver (Middleware)
Dashboard APIs (private):
Read business_id from the user’s JWT/session.
Example: /api/business/me returns profile + business_id.
Public pages (public):
Read {business-slug} from URL.
Lookup → business_id.
If resolver fails → reject with 404/403 (never fallback to “global”).
3) Role + Tenant Scope
Only owners/staff of a business can access their data.
Example:
GET /api/reviews → must include WHERE reviews.business_id = ctx.business_id.
Cross-business access must return 403 Forbidden.


4) Routes / URLs
Public
/business/{slug} → shows approved reviews only.
/embed/{slug}?style=carousel → loads widget.
Dashboard
/api/business/me → returns business info.
/api/reviews → list reviews for that business.
/api/widgets → manage embed codes.
/api/storage → show GB used/remaining.

5) Indexes & Safety
Add composite index on (business_id, id) for every large table.
Unique:
uq_businesses_slug → each slug must be unique.
Log every request with request_id + business_id.

6) Storage & Reviews
S3 keys must be tenant-scoped:
 s3://truetestify/{business_id}/reviews/{review_id}/video.mp4
This makes cleanup easy when deleting a business.


Acceptance (CEO Tests)
Create 2 demo businesses: glambeauty, citycuts.
As glambeauty, upload review → only visible on glambeauty’s page.
As citycuts, upload review → only visible on citycuts’ page.
Visiting /business/glambeauty → shows only glambeauty reviews.
API call for glambeauty while logged in as citycuts → 403 Forbidden.



Reminders per Milestone
Milestone 1 (Profiles): slugs map to business_id.
Milestone 2 (Review Capture): reviews.business_id always set from context.
Milestone 3 (Dashboard): all queries filter by business_id.
Milestone 4 (Public Pages): resolve business_id from slug, filter reviews.
Milestone 5 (Text Reviews): same rules, must include business_id.
Milestone 6 (Google Import): imported reviews stored with that business_id.
Milestone 7 (Widgets): embed code generated per business_id.
Milestone 8 (Billing): subscription tied to business_id, storage counted by business.
Milestone 9 (Compliance): consent logs and deletions scoped by business_id.



Do / Don’t (pin this in #dev)
Do
 ✅ Add business_id to every business-owned row.
 ✅ Resolve tenant from JWT (dashboard) or slug (public).
 ✅ Enforce tenant filters in middleware/service layer, not per-endpoint copy/paste.
 ✅ Log business_id on every request and job.
Don’t
 ❌ Never accept business_id from frontend body/query.
 ❌ Never run a query without WHERE business_id = ?.
 ❌ Never expose reviews from another tenant in API/public page.

Minimal Table Pattern
businesses(id, slug, …)
reviews(id, business_id, type, media_url, status, …)
storage_logs(id, business_id, size_mb, …)
widgets(id, business_id, style, settings_json, …)
subscriptions(id, business_id, stripe_id, status, …)
consent_logs(id, business_id, review_id, ip, user_agent, …)


Quick Security Checklist
Middleware sets ctx.business_id → all queries must use it.
Unit test: cross-business fetch → must fail.
Public endpoints validate slug before returning.
Background jobs include business_id in payloads.
Deletion jobs remove only that business’s S3 prefix.

//////// 3. Database & Naming Standards

TrueTestify — Database & Naming Standards ⇄ Schema Map (What to Build, Name to Use)
How to use this file
 Find your current Milestone below. Build only the items listed for that milestone.
 Field and table names are given here so you don’t need to read the whole spec.
 If something new is needed, use the AI prompt at the end of that milestone to extend the schema, then get approval.
Always follow the Multi‑Tenant Rules (separate doc). Every table below includes business_id and all queries must filter by it.

Naming Conventions for Indexes and Constraints
We use consistent prefixes for database objects. This avoids random system names, keeps migrations clean, and speeds up debugging.
ix_ → Indexes
Format: ix_<table>_<column1>[_<column2>]


Examples:
ix_reviews_business_id_status
ix_media_assets_business_id_review_id
ix_google_reviews_business_id_reviewed_at

Why it matters: makes table/column scope obvious, prevents mystery names (e.g., idx12345), improves query plan debugging.
fk_ → Foreign Keys
Format: fk_<table>_<ref_table>
Examples: fk_media_assets_reviews, fk_business_users_businesses, fk_reviews_businesses.


uq_ → Unique Constraints
Format: uq_<table>_<column1>[_<column2>]

Examples: uq_businesses_slug, uq_users_email, uq_embed_tokens_token.


Milestone 1 — Accounts & Business Profiles
Tables (create now):
businesses (id, slug, name, logo_url, brand_color, website, contact_email, settings_json, created_at, updated_at, deleted_at)
users (id, email, password_hash, name, status, last_login_at, created_at, updated_at)
business_users (id, business_id, user_id, role, is_default, created_at, updated_at)
Required uniques & indexes:
uq_businesses_slug, uq_users_email, ix_business_users_business_id_user_id


APIs to expose:
Auth: POST /api/auth/register, POST /api/auth/login
Dashboard: GET /api/business/me (returns business profile + business_id)
Public: GET /business/{slug} (minimal JSON for now)
Seeds:
Demo businesses: glambeauty, citycuts; one owner user each.


AI prompt (paste in PR):
“Review Milestone 1 schema for profiles and membership. Validate uniques, add missing indexes, generate Postgres migrations (up/down). Ensure slug is citext + unique.”

Acceptance:
Public profile URLs resolve and show only allowed fields. Cross‑business access blocked.



Milestone 2 — Video & Audio Review Capture
Tables (create/extend now):
reviews (id, business_id, type, status, title, body_text, rating, reviewer_name, reviewer_contact_json, consent_checked, source, submitted_at, published_at, created_at, updated_at, deleted_at)


media_assets (id, business_id, review_id, asset_type, s3_key, duration_sec, size_bytes, metadata_json, created_at, updated_at)
transcode_jobs (id, business_id, review_id, input_asset_id, target, status, error, created_at, updated_at)


Indexes:
ix_reviews_business_id_status
ix_reviews_business_id_submitted_at
ix_media_assets_business_id_review_id
ix_transcode_jobs_business_id_review_id


APIs:
Public/Uploader: POST /api/public/{slug}/reviews (create pending review with consent)
Uploads: chunked upload endpoints; finalize to create media_assets
Jobs: enqueue transcode_jobs on finalize


Rules:
Limits: video ≤ 60s @ 720p ~1–2 Mbps; audio ≤ 60s.
Consent required before submission; store consent_checked = true.

AI prompt:
“Design review capture with chunked uploads and compression. Provide SQL migrations, job states, and error messages. Ensure tenant scoping on all rows.”

Acceptance:
30s video records, resumes on connection drop, compresses, saves; consent enforced.



Milestone 3 — Review Dashboard & Moderation
Tables (extend/queries):
Reuse reviews, media_assets, transcode_jobs


Indexes (confirm):
ix_reviews_business_id_status
ix_reviews_business_id_submitted_at


APIs (Dashboard):
GET /api/reviews?status=pending|approved|rejected|hidden
POST /api/reviews/{id}/approve
POST /api/reviews/{id}/reject
POST /api/reviews/{id}/hide (toggle visibility)
Usage: GET /api/storage → bytes used/limit, counts


AI prompt:
“Implement moderation endpoints with row locking to avoid race conditions. Provide pagination SQL, and storage usage counters.”

Acceptance:
Pending review appears → approve moves to Approved; reject hides from public; usage counters update.



Milestone 4 — Public Review Pages
Tables (extend/queries):
Reuse reviews, media_assets, businesses

Indexes (confirm):
ix_reviews_business_id_status

APIs (Public):
GET /business/{slug} → returns approved media first (video hero), then audio, then text if enabled
Asset delivery via signed URLs only


AI prompt:
“Create public page queries prioritizing video/audio. Provide signed‑URL generation and caching strategy (short TTL). Ensure no pending/rejected rows leak.”


Acceptance:
Approved video review shows at top; audio next; text shows only if no media or when enabled.



Milestone 5 — Text Reviews (Optional Fallback)
Tables (extend/queries):
Reuse reviews (with type='text' and body_text filled)

Indexes (confirm):
ix_reviews_business_id_status

APIs:
Toggle: POST /api/settings/text-reviews (on/off in businesses.settings_json)
Public respects the toggle and placement rules


AI prompt:
“Add text review support. Provide validations and UI copy. Ensure public placement below media unless no media exists.”


Acceptance:
Text review can be submitted when enabled; appears under media; disabling removes the option.



Milestone 6 — Google Reviews Import
Tables (create/extend now):
google_connections (id, business_id, google_account_id, location_id, access_token, refresh_token, status, connected_at, updated_at)
google_reviews (id, business_id, reviewer_name, rating, text, reviewed_at, source_json, created_at)
Indexes:
ix_google_reviews_business_id_reviewed_at


APIs/Jobs:
OAuth connect endpoint; scheduled import job; dashboard list
Public page shows Google reviews below TrueTestify reviews


AI prompt:
“Implement Google Business import (OAuth + scheduled fetch). Provide schema, token storage strategy, and dedupe logic.”


Acceptance:
Connects to Google; imports reviews; they display in dashboard and public page under TrueTestify reviews.



Milestone 7 — Embeddable Widgets
Tables (create/extend now):
widgets (id, business_id, style, name, settings_json, is_active, created_at, updated_at)
embed_tokens (id, business_id, widget_id, token, expires_at, created_at) (optional)


Indexes:
ix_widgets_business_id_is_active
uq_embed_tokens_token


APIs:
Dashboard: POST /api/widgets (create), GET /api/widgets (list)
Public: GET /embed/{slug}?style=grid|carousel|spotlight|floating (served HTML/JS)
Optional: GET /embed/{token} if using signed access


AI prompt:
“Build embeddable widgets with style variations. Provide JSON contracts and sample snippet code for JS/iFrame embeds.”


Acceptance:
Copy/paste embed code shows approved reviews on external site; switching style updates look.


Milestone 8 — Storage & Billing
Tables (create/extend now):
subscriptions (id, business_id, stripe_customer_id, stripe_subscription_id, plan_code, status, renewal_at, created_at, updated_at)
storage_usage (id, business_id, bytes_used, bytes_limit, last_recalc_at, created_at, updated_at)
storage_events (id, business_id, review_id, delta_bytes, reason, created_at) (optional ledger)
deletion_jobs (id, business_id, scheduled_for, status, created_at, updated_at)


Indexes:
ix_subscriptions_business_id_status
ix_storage_usage_business_id
ix_deletion_jobs_business_id_scheduled_for


APIs/Webhooks:
Stripe webhooks: update subscriptions.status, bytes_limit by plan
Hide on past_due: public pages return 403/overlay
Auto‑purge after > 1 year unpaid: enqueue deletion_jobs and delete S3 prefix

AI prompt:
“Wire Stripe subscriptions to storage limits. Provide webhooks with idempotency, storage counters, and purge scheduler with safety checks.”

Acceptance:
Past‑due hides reviews; returning to active restores; 1‑year unpaid triggers purge.

Milestone 9 — Privacy & Compliance Hardening
Tables (create/extend now):
consent_logs (id, business_id, review_id, consent_text, ip, user_agent, consent_checked_at, created_at)


Indexes:
ix_consent_logs_business_id_review_id

APIs/Jobs:
Consent required on submission; log entries created
Right‑to‑delete: endpoint deletes review + media + updates storage usage
All asset downloads via short‑lived signed URLs only


AI prompt:
“Harden compliance: consent logging schema, signed URL policies, right‑to‑delete flow (including storage accounting). Provide tests.”

Acceptance:
Consent is enforced and logged; delete removes media and updates counters; signed URLs expire properly.

Quick Reminders (every milestone)
Always include business_id and index it.
Status values are lowercase with CHECK constraints.
Use jsonb for flexible fields (e.g., settings_json, metadata_json).
Never accept business_id from the client—resolve from JWT (dashboard) or slug (public).
Serve media via signed URLs only.


All copy (errors, consent text) must be grammar‑checked by AI.
What are ix_, fk_, and uq_ Prefixes?
We use standard prefixes for database indexes and constraints. This avoids random system-generated names, makes migrations predictable, and helps debugging.
ix_ → Indexes
Format: ix_<table>_<column1>[_<column2>]


Examples:
ix_reviews_business_id_status → composite index on (business_id, status) in the reviews table
ix_media_assets_business_id_review_id → index on (business_id, review_id) in the media_assets table
ix_google_reviews_business_id_reviewed_at → index on (business_id, reviewed_at) in the google_reviews table


Why this matters:
Makes it obvious which table + columns the index belongs to.
Avoids mystery names like idx12345 that Postgres generates by default.
Improves query plan debugging and performance tuning.


Rule of Thumb:
Always prefix with ix_.
Always include table + column names in order.
Use composite indexes where multi-column filtering is common.
fk_ → Foreign Keys
Format: fk_<table>_<ref_table>


Examples:
fk_reviews_businesses → foreign key from reviews.business_id → businesses.id
fk_media_assets_reviews → foreign key from media_assets.review_id → reviews.id
fk_business_users_users → foreign key from business_users.user_id → users.id


Why this matters:
Makes parent/child relationships explicit.
Prevents long system defaults like reviews_business_id_fkey.
Clearer schema diffs and migrations.


Rule of Thumb:
Always prefix with fk_.
Always include both table names (child → parent).
Explicitly define ON DELETE/ON UPDATE behavior.
uq_ → Unique Constraints
Format: uq_<table>_<column1>[_<column2>]


Examples:
uq_businesses_slug → ensures business slugs are unique
uq_users_email → ensures user emails are unique
uq_embed_tokens_token → ensures embed tokens are unique


Why this matters:
Enforces data integrity and prevents duplicates.
Makes constraint names human-readable in errors.
Easier debugging of duplicate key value violates unique constraint.


Rule of Thumb:
Always prefix with uq_.
Always match the enforced column(s).
For multi-column uniqueness, list all columns in order.


Golden Rule
ix_ = indexes
fk_ = foreign keys
uq_ = unique constraints
Always use these prefixes consistently across all tables in TrueTestify to avoid confusion and keep schema clean.

////////// 4. MVP Info about project

🚀 Truetestify - competitors - https://www.trustindex.io/

🎯 The Core Idea
A SaaS platform where businesses pay to collect, store, and showcase customer video and audio reviews. Video and audio are the star of their page
Then written review option on the sideline, written review will be the star of their page if they don`t have a video or audio recording 
Customers record or upload reviews directly on your website or mobile app. Businesses can optionally import their Google reviews. If businesses stop paying, reviews are hidden; if unpaid for a year, data is deleted.

Idea covers:
✅ Video review capture → core feature
 ✅ Audio review capture → core feature
 ✅ Written reviews as fallback → practical addition
 ✅ Moderation → essential for brand safety
 ✅ Google reviews import → smart bonus
 ✅ Storage + billing model → solid SaaS revenue
 ✅ Privacy & compliance → legally required
 ✅ Embeddable widgets → crucial for businesses to integrate reviews into their websites
 ✅ Widget styles → ensures businesses have design flexibility
That’s a perfectly solid MVP


🔑 Key Features
✅ 1. Video & Audio Review Collection
Customers:
Record video or audio directly in-browser or in mobile app
Upload existing video or audio files
Simple, user-friendly recording interface
Optional re-record or preview before submission



✅ 2. Client Review Pages
Each business has its own page:
 bash
CopyEdit
Truetestify/business-name


Displays:
Video reviews (hero section)
Audio reviews
Optional text reviews (fallback)
Imported Google reviews
Clean, mobile-responsive design
Custom branding (logo, colors)



✅ 3. Google Reviews Integration
Businesses connect their Google Business Profile
Import and display:
Text reviews
Reviewer name
Rating
Date



✅ 4. Review Moderation System
Dashboard to:
Approve/reject reviews
Reorder display
Toggle visibility



✅ 5. Storage & Billing
Subscription tiers based on:
Storage space (GB)
Number of reviews
If payment missed:
Reviews hidden from public
If unpaid >1 year:
Data permanently deleted
Managed via Stripe or similar



✅ 6. Privacy & Compliance
Explicit user consent for recordings
GDPR/CCPA compliance
User right-to-delete requests honored



✅ 7. Optional Text Reviews
Text reviews available as a fallback option
Businesses can enable/disable this feature
Displayed lower on the page than video/audio


✅ 8. Embeddable Widgets
Businesses generate simple embed code to display reviews on their own website.
Embed options:
JavaScript embed → dynamic content in a div.
iFrame embed → easy copy/paste for any website.
Optional Gutenberg block → for WordPress users.
Widget style options include:
Grid layout → multiple reviews in rows/columns.
Carousel/Slider → rotating video or audio tiles.
Single Review Spotlight → one featured video/audio review.
Floating pop-up widget → small tab or bubble that expands to show reviews.
All widgets must:
Be mobile-responsive.
Allow basic color and branding customization.
Support video, audio, and text reviews if enabled.
💰 Business Model
SaaS subscriptions:


Example Tiers:
$/month → 1 GB storage
$/month → 10 GB storage
Pay-as-you-grow storage fees
Revenue from premium features in future:
AI transcription
Multi-language captions
Advanced analytics



🔥 Your Unique Selling Proposition (USP)
“Turn your customers into your best marketers with authentic video and audio reviews. No other platform makes it this easy—and you keep your Google reviews in one place, too.”

✅ Why You’ll Stand Out
✅ Focus on video and audio → few competitors do this well
 ✅ Simple platform → easy for businesses to adopt
 ✅ No messy integrations → only Google Reviews
 ✅ Recurring revenue model → scalable business
 ✅ Emotional power → faces and voices build trust
 ✅ Mobile-first experience → perfect for modern users

⚙️ Technology Stack (Suggested)
Frontend: React / React Native (for web & mobile app)
Backend: Node.js 
Database: PostgreSQL
Storage: AWS S3
Video processing: FFmpeg or cloud transcoding services
Payments: Stripe
Hosting: AWS / DigitalOcean / GCP
🚀 Next Steps
✅ Finalize MVP feature list
 ✅ Create wireframes for web and mobile
 ✅ Define subscription plans
 ✅ Develop backend architecture
 ✅ Build recording interface (web & app)
 ✅ Launch private beta with first businesses



Developer note 
These are NOT “nice-to-haves.” They’re practical essentials for launching a stable product.

✅ 1. Limit Video and Audio Duration
Why:
Controls storage costs.
Faster uploads.
Encourages snappy, engaging reviews.


✅ Suggested Limits:
Max video length → 60 seconds
Max audio length → 60 seconds


✅ 2. Auto-Compress Video Uploads
Why:
Saves storage costs.
Speeds up uploads, especially on mobile.
Ensures consistent quality across devices.


✅ How:
Convert videos to 720p max.
Lower bitrate (e.g. 1-2 Mbps).
Use tools like FFmpeg or cloud transcoding.


✅ 3. Chunked Uploads for Large Files
Why:
Prevents failed uploads on slow or unstable connections.
Keeps user experience smooth.


✅ How:
Break files into small parts (e.g. 1 MB chunks).
Resume uploads if connection drops.


✅ 4. Businesses Can Turn Text Reviews On or Off
Why:
Some businesses want a premium, “video-only” image.
Others want text as a fallback.


✅ How:
Simple toggle in business dashboard:
 “Allow written reviews? [Yes/No]”




✅ 5. Moderation Queue
Why:
Protects businesses from:
Offensive content
Competitor spam
Inappropriate language


✅ How:
New reviews → “pending.”
Businesses approve/reject before public display.



✅ 6. Basic Usage Dashboard
Why:
Businesses need transparency.
Helps manage subscription tiers.


✅ Minimum data to show:
of reviews collected
Storage space used
Storage space remaining
Total video/audio views


✅ 7. Offline Recording in Mobile App
Why:
Some users record where there’s no Wi-Fi.
Prevents losing reviews due to connectivity.


✅ How:
Save locally in app.
Upload automatically when connection returns.


✅ 8. Explicit User Consent
Why:
Legally required for privacy compliance (GDPR, CCPA).
Covers video/audio as potentially sensitive personal data.


✅ How:
Consent checkbox before recording:
 “I agree to record my review and allow [Business] to use it publicly.”




✅ 9. Secure Storage
Why:
Protects customer data.
Businesses expect security.


✅ How:
Store videos in cloud (e.g. AWS S3) with:
Private buckets
Encrypted uploads/downloads
Use HTTPS for all connections.



✅ 10. Fallback Text Reviews for Accessibility
Why:
Some users can’t or won’t record.
Avoids empty pages if a business has no video/audio yet.


✅ How:
Text reviews available as backup.
Shown lower on the page if video/audio exist.



✅ Possible option to add in the future
(Not mandatory at launch — but valuable upgrades down the road.)
✅ Automated transcription → captions for videos.
 ✅ Multi-language support → subtitles for global businesses.
 ✅ More integrations → e.g. Facebook, Yelp, TripAdvisor.
 ✅ Advanced analytics → e.g. heatmaps of video views.
 ✅ AI moderation → automatic flagging of offensive content.





Branding and Colors 
🔥 That’s a bold, high-trust combo — blue + orange is perfect for SaaS. Here’s what it communicates:

🎨 Why Blue + Orange Works for TrueTestify
Color
Meaning
Why It Works
Blue
Trust, reliability, professionalism
Ideal for B2B, SaaS, and video hosting credibility
Orange
Energy, call-to-action, friendliness
Drives emotional engagement and clicks — perfect for review buttons or accents


✅ Recommended Usage
Element
Suggested Color
Logo base
Blue (dark/navy or SaaS blue)
CTA buttons
Orange (#FFA500 or #FF7F50)
Widget accents
Orange border or background highlights
Dashboard UI
Blue tones, with orange for warnings or action alerts
Consent/checkbox
Neutral (gray or soft blue)


🧠 Psychological Trigger
Blue earns trust, orange sparks action.
 Your whole product is about getting someone to trust a review and take action.

Let me know if you want:
A brand color palette with hex codes
Widget UI mockups in blue/orange
CSS styling rules for the React dev
We can build you a sleek identity in 30 minutes flat.


Core Distribution:
✅ WordPress Plugin: Easily embed testimonial widgets in websites.
✅ Shopify App: Display customer videos directly on product or homepage.
✅ Public Profile Pages: Hosted pages with custom branding.
✅ Mobile app:Easy mobile recording App
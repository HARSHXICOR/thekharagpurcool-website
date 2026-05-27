# Backend SRS and API Architecture

Project: The Kharagpur Wala
Frontend basis: Next.js public marketing site with services, pricing, portfolio/case studies, blog, contact funnel, newsletter capture, and campaign analytics dashboard preview
Document version: 1.0
Date: 2026-05-25

## 1. System Overview

### Purpose
The backend powers a creator-business collaboration platform for discovery, inbound lead capture, campaign sales, content publishing, analytics reporting, and client collaboration. It must support:

- public website content delivery
- campaign inquiry and lead qualification
- package and add-on configuration
- case study and blog management
- newsletter subscriptions
- client account access
- campaign analytics dashboards
- admin operations for content, campaigns, leads, and reporting
- optional phase-2 social/community interactions around creator content

### Core Features
- CMS for services, pricing plans, case studies, testimonials, blog posts, FAQs
- lead management for contact form submissions and consultation bookings
- client onboarding and authentication
- campaign lifecycle management
- deliverable tracking for reels, stories, posts, events, reviews
- performance analytics and downloadable reports
- notification center for clients and internal team
- media asset upload and moderation
- newsletter subscription and email automation
- admin console APIs for operational workflows

### User Roles
- `visitor`: anonymous public user browsing the site
- `subscriber`: newsletter-only user
- `client_user`: authenticated brand/client contact
- `account_manager`: internal operator managing leads and campaigns
- `content_manager`: manages blog, case studies, testimonials, pricing content
- `analyst`: manages analytics imports, reporting, exports
- `admin`: full system access
- `super_admin`: infrastructure-level privileges, tenant settings, audit access

### Main Workflows
1. Visitor browses services, pricing, portfolio, blog, testimonials.
2. Visitor submits inquiry or books collaboration call.
3. Internal team qualifies lead, creates brand account, creates campaign.
4. Client logs in, reviews campaign details, deliverables, metrics, reports.
5. Internal team uploads deliverables and campaign performance data.
6. Notifications and emails are sent on status changes.
7. Marketing team publishes new blogs, case studies, offers, and partner highlights.
8. Optional phase-2 audience community features allow follows, likes, comments, and public content feed engagement.

### Scalability Expectations
- MVP: 10k MAU, <1k authenticated clients, <100 staff
- Growth: 1M monthly public visitors, 100k newsletter subscribers, 10k active client accounts
- Scale target: millions of public users, tens of thousands of campaigns, burst traffic around viral content and event promotions

### Security Expectations
- zero trust API model
- short-lived JWT access tokens
- rotating refresh tokens with device binding
- strict RBAC and row-level authorization checks
- audit logging for every admin mutation
- encrypted secrets and PII
- WAF, rate limits, bot mitigation, abuse detection

## 2. Recommended Backend Stack

### Recommended Stack
- Framework: `NestJS`
- Language: `TypeScript`
- Database: `PostgreSQL 16`
- ORM: `Prisma`
- Auth: `JWT access token + refresh token rotation + OAuth`
- File Storage: `AWS S3` or `Cloudflare R2`
- Realtime: `Socket.IO` via Nest WebSocket gateway
- Cache: `Redis`
- Queue: `BullMQ`
- Search: `PostgreSQL full-text` for MVP, `OpenSearch` later
- CDN: `CloudFront` or `Cloudflare CDN`
- Notifications: `Resend` or `SendGrid` for email, `FCM` for push, `Twilio` for WhatsApp/SMS if needed
- Deployment: `Docker + Kubernetes + managed Postgres + managed Redis`
- Observability: `Pino + OpenTelemetry + Prometheus + Grafana + Sentry`

### Why NestJS
- strongest fit with existing Next.js + TypeScript frontend team
- clear modular architecture for auth, CMS, analytics, campaigns, notifications
- built-in decorators, validation, OpenAPI, guards, interceptors
- easy Socket.IO, BullMQ, Prisma, Swagger integration
- better long-term maintainability than ad hoc Express

Go Fiber is a valid scale option later, but NestJS is the fastest production path with the current frontend stack and team ergonomics.

## 3. Database Design

### ER Diagram Explanation
- `users` belong to zero or many `organizations` through `organization_memberships`
- `organizations` own `campaigns`, `brand_profiles`, `media_assets`, `reports`, `inquiries`
- `campaigns` have many `deliverables`, `campaign_metrics`, `campaign_notes`, `notifications`
- `blog_posts`, `case_studies`, `pricing_plans`, `services`, `testimonials`, `faq_items` are CMS entities
- `newsletter_subscribers` and `inquiries` are lead-capture entities
- `sessions`, `refresh_tokens`, `password_resets`, `email_verifications` support auth
- `audit_logs` capture all sensitive mutations
- optional phase-2 `posts`, `comments`, `likes`, `follows` support public community features

### Global Table Conventions
- primary keys: `uuid`
- timestamps: `created_at`, `updated_at`
- soft delete: `deleted_at nullable`
- actor tracking: `created_by`, `updated_by`
- pagination: cursor pagination for feeds/logs, offset pagination for admin CMS lists
- status enums stored as `varchar` with DB check constraints or Postgres enums

### Core Schemas

#### `users`
Purpose: identity for clients and staff

Schema:
- `id uuid pk`
- `email citext unique not null`
- `password_hash varchar(255) null` for OAuth-only users
- `full_name varchar(120) not null`
- `phone varchar(20) null`
- `avatar_url text null`
- `default_role varchar(30) not null`
- `status varchar(20) not null default 'active'`
- `email_verified_at timestamptz null`
- `last_login_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

Validations:
- email normalized lowercase
- password min 12 chars if local auth enabled
- phone E.164 format
- role in allowed enum

Example:
```json
{
  "id": "6a2b0f5b-d9c0-4db0-8d8d-8f44c362ee91",
  "email": "marketing@cafemocha.in",
  "full_name": "Priya Sharma",
  "phone": "+919239063990",
  "default_role": "client_user",
  "status": "active",
  "email_verified_at": "2026-05-25T10:00:00Z"
}
```

Indexes:
- unique `email`
- btree `(status, created_at desc)`

#### `organizations`
Purpose: brand/client account container

Schema:
- `id uuid pk`
- `name varchar(160) not null`
- `slug varchar(120) unique not null`
- `industry varchar(80) null`
- `website_url text null`
- `instagram_handle varchar(80) null`
- `billing_email citext null`
- `timezone varchar(64) not null default 'Asia/Kolkata'`
- `status varchar(20) not null default 'active'`
- `created_at`, `updated_at`, `deleted_at`

Validations:
- slug kebab-case
- instagram handle sanitized

Example:
```json
{
  "id": "d925343a-64e2-4573-a4b7-7d1f7ee79b40",
  "name": "Cafe Mocha Kharagpur",
  "slug": "cafe-mocha-kharagpur",
  "industry": "Cafe & Restaurant",
  "instagram_handle": "@cafemocha_kgp"
}
```

Indexes:
- unique `slug`
- btree `(industry, status)`

#### `organization_memberships`
Purpose: multi-user access to organization

Schema:
- `id uuid pk`
- `organization_id uuid fk`
- `user_id uuid fk`
- `role varchar(30) not null`
- `status varchar(20) not null default 'active'`
- `invited_by uuid fk users`
- `created_at`, `updated_at`

Constraints:
- unique `(organization_id, user_id)`

#### `services`
Purpose: catalog used by marketing site and inquiry form

Schema:
- `id uuid pk`
- `slug varchar(100) unique`
- `name varchar(120)`
- `short_description text`
- `description text`
- `category varchar(60)`
- `display_order int`
- `is_active boolean`
- `metadata jsonb`
- `created_at`, `updated_at`, `deleted_at`

Example:
```json
{
  "slug": "instagram-promotions",
  "name": "Instagram Promotions",
  "category": "promotion",
  "is_active": true
}
```

#### `pricing_plans`
Purpose: package catalog

Schema:
- `id uuid pk`
- `slug varchar(100) unique`
- `name varchar(120)`
- `tagline text`
- `billing_model varchar(30)` values `campaign`, `monthly`, `custom`
- `monthly_price numeric(12,2) null`
- `annual_price numeric(12,2) null`
- `currency char(3) not null default 'INR'`
- `is_featured boolean default false`
- `is_active boolean default true`
- `created_at`, `updated_at`, `deleted_at`

Validations:
- annual price required if billing model supports annual
- custom plans must have null fixed prices

#### `plan_features`
Schema:
- `id uuid pk`
- `plan_id uuid fk`
- `feature_text text`
- `feature_type varchar(20)` values `included`, `excluded`
- `display_order int`

#### `inquiries`
Purpose: contact form submissions and sales leads

Schema:
- `id uuid pk`
- `name varchar(120) not null`
- `email citext not null`
- `phone varchar(20) not null`
- `company_name varchar(160) null`
- `service_id uuid fk null`
- `budget_band varchar(30) not null`
- `message text null`
- `source varchar(50) not null` values `contact_form`, `cta`, `pricing`, `whatsapp`, `manual`
- `status varchar(30) not null default 'new'`
- `assigned_to uuid fk users null`
- `organization_id uuid fk null` created after qualification
- `utm jsonb null`
- `created_at`, `updated_at`, `deleted_at`

Validations:
- required email and phone
- budget band enum
- anti-spam honeypot and captcha score stored in metadata

Example:
```json
{
  "name": "Rahul Sen",
  "email": "rahul@kgpyouthfest.in",
  "phone": "+919876543210",
  "company_name": "Kharagpur Youth Festival",
  "budget_band": "scale",
  "status": "new",
  "source": "contact_form"
}
```

Indexes:
- btree `(status, created_at desc)`
- btree `(assigned_to, status)`
- gin on `utm`

#### `campaigns`
Purpose: operational campaign record

Schema:
- `id uuid pk`
- `organization_id uuid fk not null`
- `inquiry_id uuid fk null`
- `name varchar(180) not null`
- `slug varchar(160) unique`
- `campaign_type varchar(60) not null`
- `status varchar(30) not null` values `draft`, `proposed`, `active`, `completed`, `cancelled`
- `objective varchar(60)` values `reach`, `footfall`, `leads`, `awareness`, `sales`, `event_attendance`
- `budget numeric(12,2) not null`
- `currency char(3) not null`
- `start_date date null`
- `end_date date null`
- `brief text null`
- `internal_notes text null`
- `owner_id uuid fk users`
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- btree `(organization_id, status, start_date desc)`
- btree `(owner_id, status)`

#### `campaign_deliverables`
Purpose: track promised outputs

Schema:
- `id uuid pk`
- `campaign_id uuid fk`
- `deliverable_type varchar(50)` values `reel`, `story`, `carousel`, `event_coverage`, `review`, `giveaway`, `report`
- `title varchar(180)`
- `status varchar(30)` values `planned`, `in_progress`, `review`, `published`, `archived`
- `scheduled_at timestamptz null`
- `published_at timestamptz null`
- `platform varchar(30)` values `instagram`, `youtube`, `website`, `offline`
- `link_url text null`
- `notes text null`
- `created_at`, `updated_at`, `deleted_at`

#### `campaign_metrics`
Purpose: time-series analytics for dashboard

Schema:
- `id uuid pk`
- `campaign_id uuid fk`
- `metric_date date not null`
- `reach int default 0`
- `impressions int default 0`
- `likes int default 0`
- `comments int default 0`
- `shares int default 0`
- `saves int default 0`
- `profile_visits int default 0`
- `link_clicks int default 0`
- `follower_growth int default 0`
- `footfall_estimate int null`
- `revenue_estimate numeric(12,2) null`
- `source varchar(30)` values `manual`, `import`, `api`
- `created_at`, `updated_at`

Constraints:
- unique `(campaign_id, metric_date, source)`

Indexes:
- btree `(campaign_id, metric_date desc)`

#### `reports`
Purpose: generated dashboard exports

Schema:
- `id uuid pk`
- `campaign_id uuid fk null`
- `organization_id uuid fk not null`
- `report_type varchar(40)` values `campaign_summary`, `monthly`, `custom_range`
- `status varchar(20)` values `queued`, `ready`, `failed`, `expired`
- `storage_key text null`
- `format varchar(10)` values `pdf`, `csv`, `xlsx`, `json`
- `date_from date`
- `date_to date`
- `generated_by uuid fk users`
- `expires_at timestamptz null`
- `created_at`, `updated_at`

#### `blog_posts`
Purpose: content marketing and SEO

Schema:
- `id uuid pk`
- `slug varchar(160) unique`
- `title varchar(220)`
- `excerpt text`
- `content jsonb` rich text blocks
- `featured_image_url text null`
- `category varchar(60)`
- `tags text[] default '{}'`
- `author_id uuid fk users`
- `status varchar(20)` values `draft`, `scheduled`, `published`, `archived`
- `published_at timestamptz null`
- `seo_title varchar(220) null`
- `seo_description varchar(320) null`
- `read_time_minutes int`
- `view_count bigint default 0`
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- unique `slug`
- btree `(status, published_at desc)`
- gin `tags`
- gin `to_tsvector('english', title || ' ' || excerpt)`

#### `case_studies`
Purpose: public portfolio with before/after metrics

Schema:
- `id uuid pk`
- `slug varchar(160) unique`
- `title varchar(220)`
- `client_display_name varchar(180)`
- `industry varchar(80)`
- `challenge text`
- `solution text`
- `results jsonb`
- `duration_label varchar(60)`
- `featured_image_url text`
- `status varchar(20)` values `draft`, `published`, `archived`
- `published_at timestamptz null`
- `sort_order int default 0`
- `created_at`, `updated_at`, `deleted_at`

#### `testimonials`
Schema:
- `id uuid pk`
- `client_name varchar(120)`
- `client_role varchar(160)`
- `organization_name varchar(160) null`
- `avatar_url text null`
- `rating smallint check rating between 1 and 5`
- `quote text`
- `has_video boolean default false`
- `video_url text null`
- `status varchar(20)` values `draft`, `published`, `archived`
- `created_at`, `updated_at`, `deleted_at`

#### `newsletter_subscribers`
Schema:
- `id uuid pk`
- `email citext unique`
- `status varchar(20)` values `pending`, `subscribed`, `unsubscribed`, `bounced`
- `source varchar(50)`
- `confirmed_at timestamptz null`
- `unsubscribed_at timestamptz null`
- `created_at`, `updated_at`

#### `media_assets`
Schema:
- `id uuid pk`
- `organization_id uuid fk null`
- `campaign_id uuid fk null`
- `uploaded_by uuid fk users`
- `storage_key text not null`
- `public_url text null`
- `mime_type varchar(100)`
- `size_bytes bigint`
- `width int null`
- `height int null`
- `duration_seconds int null`
- `checksum_sha256 char(64)`
- `processing_status varchar(20)` values `uploaded`, `processing`, `ready`, `failed`
- `kind varchar(20)` values `image`, `video`, `document`
- `created_at`, `updated_at`, `deleted_at`

Indexes:
- btree `(campaign_id, created_at desc)`
- unique `checksum_sha256` optional for dedupe

#### `notifications`
Schema:
- `id uuid pk`
- `user_id uuid fk`
- `type varchar(50)`
- `title varchar(180)`
- `body text`
- `data jsonb`
- `channel varchar(20)` values `in_app`, `email`, `push`, `sms`
- `read_at timestamptz null`
- `created_at`, `updated_at`

Indexes:
- btree `(user_id, read_at, created_at desc)`

#### `sessions`
Schema:
- `id uuid pk`
- `user_id uuid fk`
- `device_name varchar(120)`
- `device_fingerprint varchar(255)`
- `ip inet`
- `user_agent text`
- `last_seen_at timestamptz`
- `revoked_at timestamptz null`
- `created_at`, `updated_at`

#### `refresh_tokens`
Schema:
- `id uuid pk`
- `session_id uuid fk`
- `user_id uuid fk`
- `token_hash char(64)`
- `expires_at timestamptz`
- `rotated_from uuid fk null`
- `revoked_at timestamptz null`
- `created_at`

#### `password_resets`
Schema:
- `id uuid pk`
- `user_id uuid fk`
- `token_hash char(64)`
- `expires_at timestamptz`
- `used_at timestamptz null`
- `created_at`

#### `email_verifications`
Schema:
- `id uuid pk`
- `user_id uuid fk`
- `token_hash char(64)`
- `expires_at timestamptz`
- `verified_at timestamptz null`
- `created_at`

#### `audit_logs`
Schema:
- `id uuid pk`
- `actor_user_id uuid fk null`
- `entity_type varchar(60)`
- `entity_id uuid`
- `action varchar(40)`
- `before jsonb null`
- `after jsonb null`
- `ip inet null`
- `user_agent text null`
- `created_at timestamptz`

Indexes:
- btree `(entity_type, entity_id, created_at desc)`
- btree `(actor_user_id, created_at desc)`

### Optional Phase-2 Community Tables
- `posts`
- `comments`
- `likes`
- `follows`

These support creator-feed/community features and should be implemented only if the product evolves beyond lead-gen + client dashboard.

## 4. Authentication and Authorization

### JWT Flow
- access token: 15 minutes
- refresh token: 30 days, rotating
- tokens signed with asymmetric keys `RS256`
- access token contains `sub`, `sid`, `role`, `org_ids`, `permissions`, `iat`, `exp`

### Refresh Token Flow
1. Login returns access token + refresh token.
2. Refresh token is stored hashed in DB.
3. Refresh rotates on every use.
4. Reuse detection revokes entire session chain.

### OAuth Support
- Google for clients/admins
- Instagram optional for campaign/profile linking
- OAuth users still map into `users` and `sessions`

### RBAC
- NestJS guards enforce role and permission checks
- object-level checks ensure a `client_user` only accesses their organization
- staff can be limited to assigned campaigns

### Session Handling
- one `session` per device/browser
- list active sessions in account settings
- allow revoke single session or all others

### Password Reset
1. `POST /auth/password/forgot`
2. signed single-use token emailed
3. `POST /auth/password/reset`
4. revoke all refresh tokens after success

### Email Verification
1. signup or invite acceptance triggers verification
2. `GET /auth/email/verify?token=...`
3. mark `email_verified_at`

### API Security
- HTTPS only
- JWT in `Authorization: Bearer`
- refresh token via secure httpOnly cookie or encrypted mobile storage
- signed upload URLs for media

### Rate Limiting
- auth: 5 req / 15 min / IP + email
- inquiry form: 10 req / hour / IP
- newsletter subscribe: 5 req / hour / IP
- public content reads: CDN + soft limits
- admin exports: 10 req / day / user

### Device Management
- device fingerprint optional
- suspicious new device triggers email alert
- geo/IP anomaly detection for admin accounts

## 5. Complete REST API Documentation

Base URL: `/api/v1`
Headers:
- `Authorization: Bearer <access_token>` when required
- `X-Request-Id`
- `Idempotency-Key` for create/payment/export operations where applicable

Status code conventions:
- `200 OK`
- `201 Created`
- `202 Accepted`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `429 Too Many Requests`
- `500 Internal Server Error`

### Auth APIs

#### Login
Method: `POST`
Route: `/auth/login`
Purpose: authenticate local user

Request body:
```json
{ "email": "marketing@cafemocha.in", "password": "strong-password" }
```

Success:
```json
{
  "user": { "id": "uuid", "email": "marketing@cafemocha.in", "role": "client_user" },
  "accessToken": "jwt",
  "refreshToken": "opaque-or-jwt",
  "expiresIn": 900
}
```

Validation:
- valid email
- password required

Auth required: No
Role access: Public

Example curl:
```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marketing@cafemocha.in","password":"secret"}'
```

#### Refresh Token
Method: `POST`
Route: `/auth/refresh`
Purpose: rotate refresh token and issue new access token

#### Logout
Method: `POST`
Route: `/auth/logout`
Purpose: revoke current session

#### Logout All Devices
Method: `POST`
Route: `/auth/logout-all`
Auth: Yes

#### Forgot Password
Method: `POST`
Route: `/auth/password/forgot`
Body: `{ "email": "user@example.com" }`

#### Reset Password
Method: `POST`
Route: `/auth/password/reset`
Body: `{ "token": "token", "password": "new-password" }`

#### Verify Email
Method: `POST`
Route: `/auth/email/verify`
Body: `{ "token": "token" }`

#### Resend Verification
Method: `POST`
Route: `/auth/email/resend`

#### OAuth Start
Method: `GET`
Route: `/auth/oauth/:provider`

#### OAuth Callback
Method: `GET`
Route: `/auth/oauth/:provider/callback`

### User APIs

#### Get Me
Method: `GET`
Route: `/users/me`
Purpose: current profile
Auth: Yes
Role: all authenticated

#### Update Me
Method: `PATCH`
Route: `/users/me`
Body: `fullName`, `phone`, `avatarUrl`

#### List Sessions
Method: `GET`
Route: `/users/me/sessions`

#### Revoke Session
Method: `DELETE`
Route: `/users/me/sessions/:sessionId`

### Inquiry and Lead APIs

#### Create Inquiry
Method: `POST`
Route: `/inquiries`
Purpose: public contact form submission
Body:
```json
{
  "name": "Rahul Sen",
  "email": "rahul@kgpyouthfest.in",
  "phone": "+919876543210",
  "companyName": "Kharagpur Youth Festival",
  "serviceSlug": "event-promotions",
  "budgetBand": "scale",
  "message": "Need pre-event and live coverage"
}
```
Validation:
- name 2..120 chars
- phone E.164 or normalized local mobile
- service slug must exist if provided
- budget band enum

Success:
```json
{ "id": "uuid", "status": "new", "message": "Inquiry received" }
```

Errors:
- duplicate recent inquiry from same email/phone -> `409`
- spam blocked -> `422`

Auth: No
Role: Public

#### List Inquiries
Method: `GET`
Route: `/admin/inquiries`
Query: `status`, `assignedTo`, `cursor`, `limit`
Auth: Yes
Role: `account_manager`, `admin`, `super_admin`

#### Get Inquiry
Method: `GET`
Route: `/admin/inquiries/:id`

#### Update Inquiry Status
Method: `PATCH`
Route: `/admin/inquiries/:id`
Body: `status`, `assignedTo`, `notes`

### Service and Pricing APIs

#### List Services
Method: `GET`
Route: `/services`
Purpose: power services page and inquiry dropdown
Auth: No

#### Get Service
Method: `GET`
Route: `/services/:slug`

#### List Pricing Plans
Method: `GET`
Route: `/pricing-plans`
Query: `billingCycle=monthly|annual`

#### Admin Upsert Service
Method: `POST`
Route: `/admin/services`
Auth: Yes
Role: `content_manager`, `admin`

#### Admin Upsert Pricing Plan
Method: `POST`
Route: `/admin/pricing-plans`

### Blog APIs

#### List Blog Posts
Method: `GET`
Route: `/blog-posts`
Query: `category`, `tag`, `search`, `cursor`, `limit`

#### Get Blog Post by Slug
Method: `GET`
Route: `/blog-posts/:slug`

#### Create Blog Post
Method: `POST`
Route: `/admin/blog-posts`
Auth: Yes
Role: `content_manager`, `admin`

#### Update Blog Post
Method: `PATCH`
Route: `/admin/blog-posts/:id`

#### Publish Blog Post
Method: `POST`
Route: `/admin/blog-posts/:id/publish`

### Case Study APIs

#### List Case Studies
Method: `GET`
Route: `/case-studies`
Query: `industry`, `category`, `featured`, `cursor`, `limit`

#### Get Case Study
Method: `GET`
Route: `/case-studies/:slug`

#### Create Case Study
Method: `POST`
Route: `/admin/case-studies`
Role: `content_manager`, `admin`

### Testimonial APIs

#### List Testimonials
Method: `GET`
Route: `/testimonials`
Query: `hasVideo`, `limit`

#### Admin Create Testimonial
Method: `POST`
Route: `/admin/testimonials`

### Newsletter APIs

#### Subscribe
Method: `POST`
Route: `/newsletter/subscribe`
Body: `{ "email": "hello@example.com" }`

#### Confirm Subscription
Method: `POST`
Route: `/newsletter/confirm`
Body: `{ "token": "token" }`

#### Unsubscribe
Method: `POST`
Route: `/newsletter/unsubscribe`
Body: `{ "token": "token" }`

### Organization and Client APIs

#### List My Organizations
Method: `GET`
Route: `/organizations/me`
Auth: Yes
Role: authenticated

#### Get Organization Dashboard Summary
Method: `GET`
Route: `/organizations/:orgId/dashboard-summary`
Purpose: top-level client dashboard cards
Response:
```json
{
  "totalFollowers": 23500,
  "engagementRate": 8.9,
  "monthlyReach": 4200000,
  "paidCollabs": 600
}
```

#### Get Organization Reports
Method: `GET`
Route: `/organizations/:orgId/reports`

### Campaign APIs

#### List Campaigns
Method: `GET`
Route: `/campaigns`
Query: `orgId`, `status`, `cursor`, `limit`
Auth: Yes
Role: client users limited to own org, staff broader

#### Create Campaign
Method: `POST`
Route: `/campaigns`
Role: `account_manager`, `admin`

#### Get Campaign
Method: `GET`
Route: `/campaigns/:id`

#### Update Campaign
Method: `PATCH`
Route: `/campaigns/:id`

#### Add Deliverable
Method: `POST`
Route: `/campaigns/:id/deliverables`

#### Update Deliverable
Method: `PATCH`
Route: `/campaigns/:id/deliverables/:deliverableId`

#### Add Daily Metrics
Method: `POST`
Route: `/campaigns/:id/metrics`
Body:
```json
{
  "metricDate": "2026-05-25",
  "reach": 125000,
  "impressions": 180000,
  "likes": 8500,
  "comments": 210,
  "shares": 340,
  "linkClicks": 1200
}
```

#### Get Metrics Series
Method: `GET`
Route: `/campaigns/:id/metrics`
Query: `dateFrom`, `dateTo`, `granularity=day|week|month`

#### Export Report
Method: `POST`
Route: `/campaigns/:id/reports/export`
Body: `{ "format": "pdf", "dateFrom": "2026-05-01", "dateTo": "2026-05-25" }`
Response: `202 Accepted`

### Analytics APIs

#### Dashboard Cards
Method: `GET`
Route: `/analytics/dashboard/cards`
Query: `orgId`, `dateFrom`, `dateTo`

#### Follower Growth
Method: `GET`
Route: `/analytics/dashboard/follower-growth`

#### Reach and Impressions
Method: `GET`
Route: `/analytics/dashboard/reach`

#### Content Performance
Method: `GET`
Route: `/analytics/dashboard/content-performance`

#### Audience Demographics
Method: `GET`
Route: `/analytics/dashboard/audience-demographics`

#### Category Impact
Method: `GET`
Route: `/analytics/dashboard/category-impact`

### Notification APIs

#### List Notifications
Method: `GET`
Route: `/notifications`
Query: `unreadOnly`, `cursor`, `limit`

#### Mark Notification Read
Method: `POST`
Route: `/notifications/:id/read`

#### Mark All Read
Method: `POST`
Route: `/notifications/read-all`

### Media Upload APIs

#### Create Upload URL
Method: `POST`
Route: `/media/upload-url`
Body:
```json
{ "fileName": "reel.mp4", "mimeType": "video/mp4", "kind": "video", "campaignId": "uuid" }
```

Success:
```json
{
  "assetId": "uuid",
  "uploadUrl": "https://signed-url",
  "publicBaseUrl": "https://cdn.example.com/..."
}
```

#### Confirm Upload
Method: `POST`
Route: `/media/:assetId/complete`

#### Get Media Asset
Method: `GET`
Route: `/media/:assetId`

### Settings APIs

#### Get My Settings
Method: `GET`
Route: `/settings/me`

#### Update My Settings
Method: `PATCH`
Route: `/settings/me`
Body: notification preferences, timezone, language

#### Get Organization Settings
Method: `GET`
Route: `/organizations/:orgId/settings`

#### Update Organization Settings
Method: `PATCH`
Route: `/organizations/:orgId/settings`
Role: `account_manager`, `admin`, org admin client if allowed

### Search APIs

#### Global Search
Method: `GET`
Route: `/search`
Query: `q`, `type=blog|case-study|campaign|organization|inquiry`, `limit`

#### Admin Search
Method: `GET`
Route: `/admin/search`
Auth: Yes
Role: staff

### Admin APIs

#### Dashboard Summary
Method: `GET`
Route: `/admin/dashboard/summary`

#### Audit Logs
Method: `GET`
Route: `/admin/audit-logs`
Query: `actorUserId`, `entityType`, `entityId`, `cursor`

#### Invite User
Method: `POST`
Route: `/admin/users/invite`

#### Update User Role
Method: `PATCH`
Route: `/admin/users/:id/role`

### Optional Phase-2 Feed and Community APIs

These are only required if the product adds public content interaction.

#### Feed List
Method: `GET`
Route: `/feed`
Purpose: public creator posts feed

#### Posts CRUD
- `GET /posts`
- `GET /posts/:slug`
- `POST /admin/posts`
- `PATCH /admin/posts/:id`

#### Comments
- `GET /posts/:postId/comments`
- `POST /posts/:postId/comments`
- `DELETE /comments/:id`

#### Likes
- `POST /posts/:postId/likes`
- `DELETE /posts/:postId/likes`

#### Follows
- `POST /creator/follow`
- `DELETE /creator/follow`

## 6. Realtime Architecture

### WebSocket Architecture
- Socket.IO namespace `/realtime`
- JWT-authenticated handshake
- Redis adapter for horizontal scale
- rooms:
  - `user:{userId}`
  - `org:{orgId}`
  - `campaign:{campaignId}`

### Events
- `notification.created`
- `notification.read`
- `campaign.updated`
- `campaign.metric_ingested`
- `deliverable.status_changed`
- `report.ready`
- optional phase-2 `comment.created`, `post.liked`, `follow.created`

### Presence
- track online sessions in Redis with TTL heartbeat
- presence only for authenticated dashboard users

### Typing Indicator
Only if in-app campaign chat is added later:
- `chat.typing.start`
- `chat.typing.stop`

### Realtime Feed Updates
Not needed for MVP public site
- optional phase-2 only

### Reconnection Strategy
- exponential backoff
- replay unread notifications after reconnect
- client resync endpoint on socket reconnect

## 7. Media Handling

### Upload Pipeline
1. client requests signed upload URL
2. uploads directly to object storage
3. backend receives completion callback
4. queue triggers metadata extraction, virus scan, resize/transcode
5. CDN URL published when ready

### Compression Strategy
- images: WebP/AVIF variants
- videos: H.264 + MP4 for compatibility, HLS for streaming if needed
- documents: PDF thumbnails + checksum

### CDN Integration
- cache immutable media for 1 year
- signed URLs for private client report assets

### Video Processing
- FFmpeg workers
- generate poster image
- normalize resolution
- bitrate ladders for large assets

### MIME Validation
- trust magic-byte sniffing, not extension only
- reject executables and archives unless explicitly supported

### Storage Architecture
- public bucket: CMS images
- private bucket: reports, client documents, raw campaign assets

## 8. Security Architecture

### OWASP Protections
- DTO validation with `class-validator`
- ORM parameterization via Prisma
- output encoding and markdown sanitization for CMS
- Helmet headers
- strict CORS allowlist
- upload scanning

### SQL Injection Prevention
- Prisma query builder only
- no raw SQL without reviewed repository layer

### XSS Prevention
- sanitize rich text blocks
- CSP with nonce-based scripts in admin apps

### CSRF Strategy
- Bearer token APIs are low-risk
- if refresh token stored in cookie, enforce CSRF token on refresh/logout

### Encryption
- at rest: cloud KMS
- in transit: TLS 1.2+
- sensitive fields optionally encrypted: phone, billing email, OAuth tokens

### Secure Headers
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### API Gateway Recommendations
- Cloudflare or AWS API Gateway + WAF
- route-level throttling
- geo blocking for admin if needed

### DDoS Protection
- CDN shielding
- WAF bot rules
- rate limiting and request body size limits

### Logging Strategy
- structured JSON logs
- redact tokens, passwords, PII

### Monitoring Strategy
- latency, error rate, queue lag, DB saturation, Redis memory, upload failures

## 9. Performance Optimization

### Database
- read-heavy public content served from cached API or edge
- partition `audit_logs` and `campaign_metrics` by month if volume grows

### Query Optimization
- avoid N+1 with Prisma includes/selects
- pre-aggregated metric views for dashboards

### Redis Caching
- public CMS payloads: 5-15 minutes
- dashboard aggregates: 1-5 minutes
- feature flags and rate limits

### Feed and Infinite Scroll
- cursor pagination using `(published_at, id)` or `(created_at, id)`
- no offset for large lists

### Lazy Loading
- load heavy report data and media metadata on demand

### Background Jobs
- email sending
- report generation
- analytics imports
- media processing
- search indexing

## 10. Deployment Architecture

### Environments
- `dev`: local Docker Compose
- `staging`: production-like namespace with masked data
- `prod`: multi-AZ managed services

### Docker Setup
- `api` container
- `worker` container
- `scheduler` container

### CI/CD
1. lint
2. unit tests
3. integration tests
4. build image
5. security scan
6. deploy to staging
7. smoke tests
8. manual approval
9. production rollout

### Kubernetes Recommendation
- yes for production if team can operate it
- otherwise use ECS/Fargate or Fly/Render for MVP

### NGINX Strategy
- reverse proxy only if not using ingress controller-managed routing
- upload body limits
- compression
- websocket upgrade support

### Environment Variables
- `APP_ENV`
- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `S3_BUCKET_PUBLIC`
- `S3_BUCKET_PRIVATE`
- `AWS_REGION`
- `EMAIL_PROVIDER_API_KEY`
- `SENTRY_DSN`
- `FRONTEND_ORIGIN`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

## 11. Folder Structure

```text
backend/
  src/
    main.ts
    app.module.ts
    common/
      guards/
      interceptors/
      filters/
      decorators/
      dto/
      utils/
      constants/
    config/
    prisma/
    modules/
      auth/
      users/
      organizations/
      inquiries/
      services/
      pricing/
      blog/
      case-studies/
      testimonials/
      campaigns/
      analytics/
      reports/
      media/
      notifications/
      newsletter/
      search/
      admin/
      health/
      audit/
      community/   # optional phase-2
    jobs/
    gateways/
    integrations/
  prisma/
    schema.prisma
    migrations/
  test/
    unit/
    integration/
    e2e/
  docs/
    openapi/
  docker/
```

## 12. API Versioning Strategy
- URI versioning: `/api/v1`
- non-breaking additions allowed in same version
- breaking changes released as `/api/v2`
- deprecations announced 90 days ahead
- deprecated fields marked in OpenAPI and response headers

## 13. Logging and Monitoring

### Logging
- `Pino` with request correlation ID
- log levels: `debug`, `info`, `warn`, `error`, `fatal`

### Error Tracking
- `Sentry` for exceptions, traces, release health

### Metrics
- `/health/live`
- `/health/ready`
- `/metrics` Prometheus scrape

### Crash Recovery
- stateless pods
- liveness/readiness probes
- queue jobs idempotent and retry-safe

## 14. Third-Party Integrations
- Email: `Resend` for transactional, `SendGrid` if marketing needs are broader
- Push: `Firebase Cloud Messaging`
- Analytics: `PostHog` for product analytics, `Google Analytics` for marketing
- Payments: `Razorpay` for India-first payments, Stripe if international expansion
- Social login: `Google`, optional `Meta/Instagram`
- Cloud storage: `AWS S3` or `Cloudflare R2`

## 15. Testing Strategy
- Unit: services, guards, validation, mappers
- Integration: auth, inquiries, campaigns, analytics repositories
- E2E/API: supertest against staging-like env
- Load: k6 for public content, auth burst, report generation
- Security: dependency scanning, SAST, DAST, auth abuse, rate limit tests

## 16. Swagger / OpenAPI Strategy
- generate from Nest decorators
- split docs by tags: Auth, CMS, Inquiries, Campaigns, Analytics, Media, Admin
- publish `/api/docs` for internal/staging only
- export static OpenAPI JSON for SDK generation

## 17. Production Readiness Checklist
- all secrets in vault
- TLS enabled
- migrations tested
- backups configured
- log redaction verified
- rate limits enabled
- audit logs enabled
- health checks passing
- dashboard/report queues healthy
- rollback plan tested
- alerting configured

## 18. Future Scalability

### Microservices Migration Path
Start as modular monolith. Extract in this order if needed:
1. media processing
2. notifications
3. analytics ingestion/reporting
4. community/feed service

### Horizontal Scaling
- stateless API replicas behind load balancer
- Redis adapter for sockets
- read replicas for PostgreSQL

### Sharding Strategy
- avoid early sharding
- shard large analytics/time-series tables or move to ClickHouse later

### Event-Driven Possibilities
- publish domain events:
  - `inquiry.created`
  - `campaign.created`
  - `deliverable.published`
  - `report.generated`
  - `notification.dispatched`

## Naming Conventions
- snake_case in database
- kebab-case in public slugs
- camelCase in JSON API payloads
- singular module names, plural route names

## Error Handling Strategy
- consistent error envelope
```json
{
  "error": {
    "code": "INQUIRY_VALIDATION_FAILED",
    "message": "Validation failed",
    "details": [{ "field": "email", "issue": "invalid_format" }],
    "requestId": "req_123"
  }
}
```

## Implementation Phases

### Phase 1: Foundation
- auth
- users
- organizations
- services
- pricing
- inquiries
- media
- admin basics

### Phase 2: Content and Growth
- blog
- case studies
- testimonials
- newsletter
- search

### Phase 3: Client Operations
- campaigns
- deliverables
- analytics ingestion
- reports
- notifications
- client dashboard APIs

### Phase 4: Scale and Optional Community
- websocket realtime
- exports pipeline hardening
- OpenSearch
- optional posts/comments/likes/follows

## Backend Development Roadmap
1. scaffold NestJS monolith and shared platform modules
2. model Prisma schema and migrations
3. implement auth and RBAC
4. implement CMS read/write APIs
5. implement inquiry funnel and admin review
6. implement organization and campaign modules
7. implement analytics and reports
8. add media processing and notifications
9. add observability, hardening, and load testing

## Estimated Complexity
- Auth and RBAC: Medium
- CMS: Medium
- Inquiry and CRM-lite: Medium
- Campaign operations: High
- Analytics dashboard and exports: High
- Media processing: High
- Optional community features: Medium to High

Overall project complexity: `High`, but very manageable as a modular monolith.

## API Dependency Order
1. auth
2. users
3. organizations
4. services and pricing
5. inquiries
6. media
7. blog/case studies/testimonials/newsletter
8. campaigns
9. analytics
10. reports
11. notifications
12. optional community

## MVP vs Scalable Version

### MVP
- local auth + Google OAuth
- PostgreSQL + Prisma
- Redis for rate limiting only
- basic CMS
- inquiries
- campaigns
- dashboard summaries
- CSV/PDF exports

### Scalable Version
- Redis full caching + socket adapter
- async analytics pipelines
- object storage with processing workers
- OpenSearch
- event bus
- fine-grained permissions
- multi-region CDN
- optional public community layer

## Frontend Mapping Summary
- `/contact` -> `POST /inquiries`
- `/services` -> `GET /services`
- `/pricing` -> `GET /pricing-plans`
- `/portfolio` -> `GET /case-studies`
- `/blog` -> `GET /blog-posts`, `POST /newsletter/subscribe`
- `/dashboard` -> `GET /organizations/:orgId/dashboard-summary`, campaign analytics APIs, reports APIs

## 19. Meta Developer and Instagram Graph API Integration

### Integration Goal
This integration enables each client organization to connect one or more Instagram Professional accounts and ingest official Instagram Graph API profile, media, and insights data into the analytics dashboard. The architecture is asynchronous, multi-tenant, and built for long-lived analytics history rather than direct frontend-to-Meta calls.

### 19.1 Meta Developer Requirements

#### Meta Developer Setup
- Create a Meta Developer account for the business operating this platform.
- Create one production app per environment family:
  - `tgw-platform-dev`
  - `tgw-platform-staging`
  - `tgw-platform-prod`
- Use separate webhook endpoints, App IDs, and secrets per environment.

#### App Creation
- App type: `Business`
- Add products/capabilities needed for:
  - Facebook Login for Business
  - Instagram Graph / Instagram API with Facebook Login
  - Webhooks

#### Instagram Account Requirements
- Only `Instagram Professional` accounts are supported.
- Both `Business` and `Creator` accounts are allowed for insights access.
- Consumer/personal Instagram accounts are not supported.

#### Facebook Page Linking Requirements
- The Instagram Professional account must be linked to a Facebook Page.
- The app user must be able to list and select the Page they manage.
- The Page linkage is a hard prerequisite for the `Instagram API with Facebook Login` path.

#### App Review and Verification
- For accounts you do not own/manage directly, request `Advanced Access`.
- Complete business verification before submitting advanced permissions.
- Prepare app review screencasts for:
  - account connection
  - reading profile/media
  - reading insights
  - optional comment or publish workflows

#### Recommended Meta Products to Enable
- Facebook Login for Business
- Webhooks
- Instagram API with Facebook Login

### 19.2 OAuth Architecture

#### Chosen Login Pattern
Use `Instagram API with Facebook Login` rather than client-side Instagram Basic Display. This is the correct official route for Professional account media management and analytics.

#### OAuth Flow
1. Frontend starts connect flow: `GET /api/v1/meta/connect-url?orgId=...`
2. Backend generates state token with:
   - `orgId`
   - `requestedScopes`
   - nonce
   - expiry
3. User is redirected to Meta OAuth consent screen.
4. Meta redirects to backend callback with `code` and `state`.
5. Backend validates state and exchanges code for a short-lived user access token.
6. Backend exchanges short-lived token for a long-lived user access token server-side.
7. Backend fetches Pages the user manages.
8. Backend resolves the linked Instagram Business/Creator account for the chosen Page.
9. Backend stores encrypted token material and creates `instagram_accounts` linkage.
10. Backend enqueues an initial full sync.

#### Token Exchange Flow
- `authorization_code` to short-lived user token
- short-lived token exchanged server-side for long-lived token
- long-lived user token used to fetch Page tokens and IG account references

#### Long-Lived Token Strategy
- Store long-lived user token as the primary renewable credential.
- Store associated Page token if a workflow requires Page-scoped actions.
- Schedule proactive refresh at:
  - `expires_at - 10 days`
  - retry at `expires_at - 5 days`
  - final retry at `expires_at - 2 days`

#### Token Refresh Mechanism
- Dedicated BullMQ queue: `meta-token-refresh`
- Refresh worker:
  1. loads encrypted token
  2. calls token refresh/exchange endpoint if supported for that token type
  3. updates `expires_at`
  4. writes token rotation audit event
- If refresh fails due to invalid grant or revoked access:
  - mark account `reauth_required`
  - notify internal staff and client

#### Token Encryption and Storage Strategy
- Never expose Meta access tokens to frontend after callback success.
- Store token values encrypted with application-level envelope encryption:
  - `ciphertext`
  - `key_version`
  - `iv`
  - `auth_tag`
- KMS-backed master key in production.
- Only workers/services in `meta-integration` module can decrypt.

#### Multi-Account Support
- One `organization` can connect multiple Instagram accounts.
- One `user` can authorize multiple organizations if permitted.
- Distinguish:
  - `authorization owner`
  - `organization owner`
  - `instagram account`
  - `linked page`

#### Re-Authentication Strategy
- Trigger reauth when:
  - token expired and refresh failed
  - Page unlinked
  - permissions revoked
  - account switched from professional to personal
  - Meta returns repeated auth error codes
- UI shows `Reconnect Instagram` CTA in dashboard.
- Reauth preserves historical analytics; only token linkage is replaced.

### 19.3 Required Permissions

Use the Facebook Login variant because the app is multi-client and dashboard-driven.

#### Core Permissions
- `pages_show_list`
  - needed to list Pages the authorizing user manages and choose the Page linked to the Instagram Professional account
- `instagram_basic`
  - needed to read IG account identity and media metadata
- `pages_read_engagement`
  - needed for Page-linked engagement metadata and some Page/IG access dependencies
- `instagram_manage_insights`
  - needed to read account- and media-level insights

#### Optional but Commonly Needed
- `instagram_content_publish`
  - only if you later support content publishing from dashboard
- `instagram_manage_comments`
  - only if you later support moderation, private replies, comment workflows
- `business_management`
  - needed if your platform will manage shared business assets or support Business Manager-linked workflows across client assets

#### Conditional Permissions
- `ads_read`
- `ads_management`
  - may be required in some Business Manager-linked scenarios when the app user’s role comes through Meta business asset assignment rather than direct Page admin flow

#### Why Each Permission Matters
- `instagram_basic`: profile ID, username, media listing, captions, timestamps, media type
- `instagram_manage_insights`: follower counts, impressions, reach, saves, profile actions, demographics, story insights, media performance
- `pages_show_list`: resolve which Pages the user manages and which one is linked to the IG account
- `pages_read_engagement`: complete Page-side engagement access and support dependencies used by IG with Facebook Login
- `business_management`: cross-business asset management for agencies and shared client assets
- `instagram_content_publish`: future-safe for scheduled publishing and draft-to-publish pipelines

### 19.4 Database Design for Meta Integration

All Meta tables belong in a dedicated module namespace but remain in the same PostgreSQL cluster.

#### `instagram_accounts`
Purpose: logical Instagram account linked to an organization

Fields:
- `id uuid pk`
- `organization_id uuid fk organizations not null`
- `authorized_by_user_id uuid fk users not null`
- `instagram_user_id varchar(64) not null`
- `page_id varchar(64) not null`
- `page_name varchar(160) null`
- `username varchar(120) not null`
- `display_name varchar(160) null`
- `account_type varchar(20) not null` values `BUSINESS`, `CREATOR`
- `biography text null`
- `website text null`
- `profile_picture_url text null`
- `followers_count int null`
- `follows_count int null`
- `media_count int null`
- `meta_app_id varchar(40) not null`
- `status varchar(30) not null default 'active'`
- `connection_status varchar(30) not null default 'connected'`
- `last_profile_sync_at timestamptz null`
- `last_media_sync_at timestamptz null`
- `last_insights_sync_at timestamptz null`
- `reauth_required_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz null`

Indexes:
- unique `(organization_id, instagram_user_id)`
- btree `(organization_id, status)`
- btree `(connection_status, updated_at desc)`

Relationships:
- one `organization` to many `instagram_accounts`
- one `instagram_account` to many `instagram_media`
- one `instagram_account` to many `instagram_audience_insights`

Validations:
- username lowercase
- page_id and instagram_user_id must be numeric strings
- only one active record per org/account pair

#### `instagram_tokens`
Purpose: encrypted token material and auth state

Fields:
- `id uuid pk`
- `instagram_account_id uuid fk instagram_accounts not null`
- `token_type varchar(30) not null` values `user_long_lived`, `page`, `system_user`
- `access_token_ciphertext text not null`
- `access_token_iv text not null`
- `access_token_auth_tag text not null`
- `refresh_token_ciphertext text null`
- `scopes text[] not null default '{}'`
- `granted_scopes text[] not null default '{}'`
- `expires_at timestamptz null`
- `issued_at timestamptz not null`
- `last_refreshed_at timestamptz null`
- `refresh_status varchar(20) not null default 'valid'`
- `last_error_code varchar(60) null`
- `last_error_message text null`
- `key_version varchar(30) not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `revoked_at timestamptz null`

Indexes:
- btree `(instagram_account_id, token_type, revoked_at)`
- btree `(expires_at, refresh_status)`

Relationships:
- one-to-many historical rotations per account

Validations:
- only one non-revoked token per `(instagram_account_id, token_type)`
- `expires_at` required for expiring token types

#### `instagram_media`
Purpose: media catalog snapshot for posts, reels, stories, carousels

Fields:
- `id uuid pk`
- `instagram_account_id uuid fk instagram_accounts not null`
- `ig_media_id varchar(64) not null`
- `parent_ig_media_id varchar(64) null` for carousel child grouping
- `media_type varchar(30) not null` values `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, `STORY`, `REEL`
- `media_product_type varchar(30) null`
- `caption text null`
- `permalink text null`
- `thumbnail_url text null`
- `media_url text null`
- `shortcode varchar(50) null`
- `like_count int null`
- `comments_count int null`
- `is_comment_enabled boolean null`
- `has_children boolean not null default false`
- `published_at timestamptz not null`
- `fetched_at timestamptz not null`
- `deleted_on_instagram_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Indexes:
- unique `(instagram_account_id, ig_media_id)`
- btree `(instagram_account_id, published_at desc)`
- btree `(media_type, published_at desc)`

Validations:
- permalink URL format
- media type enum

#### `instagram_media_metrics`
Purpose: immutable daily or sync-time metric snapshots per media object

Fields:
- `id uuid pk`
- `instagram_media_id uuid fk instagram_media not null`
- `instagram_account_id uuid fk instagram_accounts not null`
- `metric_date date not null`
- `snapshot_at timestamptz not null`
- `plays int null`
- `video_views int null`
- `reach int null`
- `impressions int null`
- `likes int null`
- `comments int null`
- `shares int null`
- `saves int null`
- `engagement int null`
- `profile_visits int null`
- `follows int null`
- `total_interactions int null`
- `raw_payload jsonb not null`
- `created_at timestamptz not null`

Indexes:
- unique `(instagram_media_id, metric_date, snapshot_at)`
- btree `(instagram_account_id, metric_date desc)`
- btree `(instagram_media_id, metric_date desc)`

Validations:
- non-negative metric values
- raw payload required for auditability

#### `instagram_audience_insights`
Purpose: account-level demographic and audience snapshots

Fields:
- `id uuid pk`
- `instagram_account_id uuid fk instagram_accounts not null`
- `snapshot_date date not null`
- `period varchar(20) not null` values `day`, `week`, `days_28`, `lifetime`
- `followers_count int null`
- `follower_count_delta int null`
- `reach int null`
- `impressions int null`
- `profile_views int null`
- `website_clicks int null`
- `email_contacts int null`
- `phone_call_clicks int null`
- `text_message_clicks int null`
- `audience_cities jsonb null`
- `audience_countries jsonb null`
- `audience_age_gender jsonb null`
- `top_hours jsonb null`
- `raw_payload jsonb not null`
- `created_at timestamptz not null`

Indexes:
- unique `(instagram_account_id, snapshot_date, period)`
- btree `(instagram_account_id, snapshot_date desc)`

Validations:
- JSON payload shapes versioned

#### `instagram_story_insights`
Purpose: story-specific 24h analytics before expiry

Fields:
- `id uuid pk`
- `instagram_media_id uuid fk instagram_media not null`
- `instagram_account_id uuid fk instagram_accounts not null`
- `snapshot_at timestamptz not null`
- `exits int null`
- `impressions int null`
- `reach int null`
- `replies int null`
- `taps_forward int null`
- `taps_back int null`
- `shares int null`
- `total_interactions int null`
- `raw_payload jsonb not null`
- `created_at timestamptz not null`

Indexes:
- btree `(instagram_media_id, snapshot_at desc)`
- btree `(instagram_account_id, snapshot_at desc)`

#### `sync_jobs`
Purpose: operational job tracking beyond BullMQ internals

Fields:
- `id uuid pk`
- `organization_id uuid fk organizations null`
- `instagram_account_id uuid fk instagram_accounts null`
- `job_type varchar(40) not null`
  values `profile_sync`, `media_sync`, `insights_sync`, `story_sync`, `token_refresh`, `webhook_reconcile`
- `job_scope varchar(20) not null` values `full`, `incremental`, `single_media`
- `status varchar(20) not null` values `queued`, `running`, `succeeded`, `failed`, `dead_letter`
- `attempt_count int not null default 0`
- `max_attempts int not null default 5`
- `cursor text null`
- `date_from date null`
- `date_to date null`
- `payload jsonb null`
- `error_code varchar(60) null`
- `error_message text null`
- `started_at timestamptz null`
- `finished_at timestamptz null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Indexes:
- btree `(instagram_account_id, job_type, created_at desc)`
- btree `(status, created_at asc)`

#### `api_rate_limit_logs`
Purpose: Meta quota and backoff observability

Fields:
- `id uuid pk`
- `instagram_account_id uuid fk instagram_accounts null`
- `endpoint varchar(255) not null`
- `graph_api_version varchar(20) not null`
- `http_status int not null`
- `call_count_estimate int null`
- `business_use_case_usage jsonb null`
- `x_app_usage jsonb null`
- `x_page_usage jsonb null`
- `retry_after_seconds int null`
- `request_id varchar(100) null`
- `recorded_at timestamptz not null`

Indexes:
- btree `(instagram_account_id, recorded_at desc)`
- btree `(endpoint, recorded_at desc)`
- btree `(http_status, recorded_at desc)`

### 19.5 Instagram APIs to Integrate

#### Account Data
Use account endpoints to fetch:
- profile info
- biography
- profile picture
- followers/follows/media counts
- connected Page references

Fields to request when available:
- `id`
- `username`
- `name`
- `biography`
- `website`
- `profile_picture_url`
- `followers_count`
- `follows_count`
- `media_count`

#### Media Data
Sync all relevant published media:
- posts
- reels
- stories
- carousel posts

Fields:
- `id`
- `caption`
- `media_type`
- `media_product_type`
- `media_url`
- `thumbnail_url`
- `permalink`
- `timestamp`
- `like_count`
- `comments_count`
- `children`

#### Insights Data
Account-level metrics:
- impressions
- reach
- profile views / profile visits
- website clicks
- email contacts
- phone call clicks
- text message clicks
- follower count and growth
- audience city/country
- age/gender breakdown

Media-level metrics:
- impressions
- reach
- likes
- comments
- saves
- shares
- plays or video views
- follows attributed to content

Story metrics:
- impressions
- reach
- exits
- replies
- taps forward
- taps back
- shares

### 19.6 Backend Sync Architecture

#### High-Level Pattern
Frontend never queries Meta directly.

Flow:
1. scheduled or event-driven sync enqueues work
2. workers call Meta APIs
3. raw payload stored
4. normalized rows upserted
5. aggregates updated
6. dashboard reads from local Postgres + Redis

#### BullMQ Queues
- `meta-connect`
- `meta-profile-sync`
- `meta-media-sync`
- `meta-insights-sync`
- `meta-story-sync`
- `meta-webhook-reconcile`
- `meta-token-refresh`
- `meta-analytics-rollup`

#### Cron Strategy
- profile sync: every 6 hours
- media sync: every 15 minutes for active accounts
- recent media insights sync: every 4 hours
- story sync: every 30 minutes while stories are active
- audience insights sync: daily at 02:30 org-local or UTC bucket
- token refresh scan: daily

#### Incremental Sync Logic
- store last successful cursor and last successful timestamp per account/job type
- media sync queries newest first until encountering already-known IDs beyond overlap window
- use overlap window of 72 hours to avoid missing late metrics or edits

#### Retry Mechanism
- retry classes:
  - transient 5xx: exponential backoff, 5 attempts
  - quota 429: retry after header or capped backoff
  - auth 401/403: no blind retries, move to `reauth_required`
  - object deleted 404: mark tombstone locally

#### Stale Token Handling
- if API returns auth error:
  - mark active sync as `failed_auth`
  - suspend future syncs for that account except token refresh/reconnect checks
  - emit notification

#### API Failure Recovery
- dead-letter failed jobs after max attempts
- admin dashboard for resync
- nightly reconciliation job compares latest local media count against account media count and backfills gaps

### 19.7 Rate Limiting Strategy

#### Meta Rate Limits
Meta enforces app-, user-, and business-use-case-based limits. Treat limits as dynamic and observable, not fixed constants.

#### Enforcement Strategy
- per-account distributed lock in Redis for expensive syncs
- weighted concurrency:
  - profile sync low cost
  - media sync medium
  - insights sync high
- cap concurrent syncs per app and per worker shard

#### Batching Strategy
- batch media detail requests where Graph supports field expansion
- avoid one-request-per-card frontend behavior entirely
- fetch only active recent media for high-frequency insight refresh

#### Caching Strategy
- Redis caches:
  - account summary 5 min
  - dashboard aggregates 15 min
  - top content 15 min
  - audience insights 6 hr

#### Backoff Strategy
- exponential backoff with jitter:
  - 30s
  - 2m
  - 10m
  - 30m
  - 2h
- honor `Retry-After` when present

#### Quota Monitoring
- persist `X-App-Usage`, `X-Page-Usage`, and business usage headers when available
- alert at:
  - 70% usage: warn
  - 85% usage: throttle nonessential syncs
  - 95% usage: pause backfills, preserve only critical dashboard freshness jobs

### 19.8 Webhook Architecture

#### Webhook Events to Support
- comment events
- live comment events
- mentions
- story mentions if available in subscribed fields
- media publish or publish-state-related events where supported
- account updates requiring refresh/reconcile

Note:
Use official subscribed fields actually available to the Instagram object in Meta App Dashboard. For metrics freshness, treat webhooks as triggers, not the source of truth for insights totals.

#### Webhook Flow
1. Meta sends `GET` verification challenge during setup.
2. Backend verifies `hub.verify_token` and echoes `hub.challenge`.
3. Event `POST` requests are validated with `X-Hub-Signature-256`.
4. Raw webhook payload stored to append-only event table or object store log.
5. Lightweight handler enqueues downstream jobs.

#### Recommended Event Handling
- `comments` / `live_comments`:
  - store event
  - invalidate comment-related caches
  - enqueue single-media refresh
- `mentions`:
  - create internal notification
  - enqueue media lookup if relevant
- `story_insights`:
  - trigger story snapshot refresh quickly because story metrics are short-lived

### 19.9 Security for Meta Integration

#### Encrypted Token Storage
- AES-256-GCM envelope encryption
- KMS-rotatable master key
- token decrypt only in server-side trusted boundary

#### Token Rotation
- keep token history rows
- revoke previous token row after successful rotation
- audit all refreshes and reconnects

#### Webhook Signature Validation
- compute HMAC SHA-256 over raw request body using app secret
- compare against `X-Hub-Signature-256` using timing-safe equality
- reject mismatches with `401`

#### API Abuse Prevention
- org-level limits on manual sync button
- signed internal job invocation only
- no arbitrary IG account lookups without ownership linkage

#### Permission Validation
- store granted scopes in DB
- preflight each workflow against stored scopes
- if missing required scope, surface precise reconnect instructions

#### Secret Management
- Meta App Secret in KMS/Secrets Manager
- separate secret per environment
- rotate annually or on incident

### 19.10 Analytics Processing

#### Snapshot Model
Store raw daily snapshots instead of mutating single counters. This allows:
- historical trend recalculation
- anomaly detection
- dashboard comparisons
- retroactive bug repair

#### Aggregation Jobs
- `daily_account_rollup`
- `daily_media_rollup`
- `weekly_growth_rollup`
- `top_content_rank_rollup`

#### Derived Metrics
Compute in warehouse-style rollups:
- engagement rate
  - `(likes + comments + shares + saves) / reach`
- follower growth delta
- top-performing reel ranking
- best posting window by weekday/hour
- campaign attributed uplift when media linked to campaigns

#### Historical Metrics Storage
- keep immutable raw snapshots
- keep denormalized dashboard tables:
  - `instagram_dashboard_daily`
  - `instagram_dashboard_media_top_n`
  - `instagram_dashboard_audience_latest`

#### Realtime Dashboard Optimization
- dashboard API reads from precomputed tables
- Redis front cache for hot organizations
- webhook-triggered targeted invalidation

### 19.11 Frontend Mapping

#### Dashboard Overview Cards
Frontend widgets:
- total followers
- engagement rate
- monthly reach
- paid collabs or connected campaigns

Backend sources:
- `GET /api/v1/meta/dashboard/overview?orgId=...`
- data from `instagram_audience_insights` rollups

#### Follower Growth Chart
- `GET /api/v1/meta/dashboard/follower-growth?orgId=...&range=6m`
- sourced from daily account rollups

#### Reach and Engagement Graphs
- `GET /api/v1/meta/dashboard/reach-engagement?orgId=...&range=30d`

#### Reels Performance
- `GET /api/v1/meta/dashboard/top-reels?orgId=...&range=30d&limit=10`

#### Top Performing Content
- `GET /api/v1/meta/dashboard/top-content?orgId=...&metric=reach`

#### Audience Insights
- `GET /api/v1/meta/dashboard/audience?orgId=...`

#### Connected Accounts Management
- `GET /api/v1/meta/accounts?orgId=...`
- `POST /api/v1/meta/accounts/connect`
- `POST /api/v1/meta/accounts/:id/reconnect`
- `DELETE /api/v1/meta/accounts/:id`

### 19.12 API Examples

#### Connect Instagram Account
Method: `POST`
Route: `/api/v1/meta/accounts/connect`
Purpose: begin OAuth flow

Request:
```json
{
  "organizationId": "d925343a-64e2-4573-a4b7-7d1f7ee79b40",
  "redirectUri": "https://app.example.com/settings/integrations/meta/callback"
}
```

Response:
```json
{
  "authorizationUrl": "https://www.facebook.com/v21.0/dialog/oauth?...",
  "state": "signed-state-token"
}
```

#### OAuth Callback Finalization
Method: `POST`
Route: `/api/v1/meta/accounts/callback`

Request:
```json
{
  "code": "AQAB...",
  "state": "signed-state-token",
  "selectedPageId": "123456789012345"
}
```

Success:
```json
{
  "account": {
    "id": "36af4b0f-80c7-4c1d-b790-00f307f2f0b9",
    "instagramUserId": "17841400000000000",
    "username": "the_kharagpur_wala_",
    "pageId": "123456789012345",
    "connectionStatus": "connected"
  },
  "initialSyncJobId": "29194e8f-8ff5-433b-a2fc-0d3f5d46f9b1"
}
```

#### Fetch Dashboard Insights
Method: `GET`
Route: `/api/v1/meta/dashboard/overview?organizationId=d925343a-64e2-4573-a4b7-7d1f7ee79b40&range=30d`

Success:
```json
{
  "accountId": "36af4b0f-80c7-4c1d-b790-00f307f2f0b9",
  "range": "30d",
  "followers": 23542,
  "followerGrowth": 842,
  "reach": 4203341,
  "impressions": 6189920,
  "engagementRate": 8.9,
  "profileVisits": 22130,
  "websiteClicks": 1482,
  "lastSyncedAt": "2026-05-25T08:30:00Z"
}
```

#### Sync Reels
Method: `POST`
Route: `/api/v1/meta/accounts/:accountId/sync/reels`

Request:
```json
{
  "mode": "incremental",
  "dateFrom": "2026-05-01"
}
```

Response:
```json
{
  "jobId": "0f4b89d1-3644-4218-b0ca-c47698a2d711",
  "status": "queued"
}
```

#### Get Top Reels
Method: `GET`
Route: `/api/v1/meta/dashboard/top-reels?organizationId=d925343a-64e2-4573-a4b7-7d1f7ee79b40&range=30d&limit=5`

Success:
```json
{
  "items": [
    {
      "igMediaId": "18012345678901234",
      "caption": "Cafe Mocha launch reel",
      "permalink": "https://instagram.com/reel/abc123",
      "publishedAt": "2026-05-16T09:30:00Z",
      "reach": 380120,
      "plays": 512300,
      "likes": 24190,
      "comments": 612,
      "shares": 940,
      "saves": 2810,
      "engagementRate": 7.51
    }
  ]
}
```

### 19.13 Recommended Backend Architecture

#### Module Structure
```text
src/modules/meta/
  meta.module.ts
  controllers/
    meta-auth.controller.ts
    meta-accounts.controller.ts
    meta-dashboard.controller.ts
    meta-sync.controller.ts
    meta-webhook.controller.ts
  services/
    meta-oauth.service.ts
    meta-token.service.ts
    meta-account.service.ts
    meta-profile-sync.service.ts
    meta-media-sync.service.ts
    meta-insights-sync.service.ts
    meta-story-sync.service.ts
    meta-rate-limit.service.ts
    meta-dashboard.service.ts
  clients/
    meta-graph.client.ts
  repositories/
    instagram-accounts.repository.ts
    instagram-media.repository.ts
    instagram-insights.repository.ts
  workers/
    token-refresh.worker.ts
    profile-sync.worker.ts
    media-sync.worker.ts
    insights-sync.worker.ts
    analytics-rollup.worker.ts
    webhook-reconcile.worker.ts
  dto/
  mappers/
  enums/
```

#### Service Layer Responsibilities
- `meta-graph.client`
  - all HTTP calls to Meta, retry/backoff, header parsing
- `meta-oauth.service`
  - connect URL generation, callback exchange, state validation
- `meta-token.service`
  - encrypt, decrypt, refresh, revoke, reauth marking
- `meta-media-sync.service`
  - incremental media traversal and upserts
- `meta-insights-sync.service`
  - fetch and normalize account/media/story insight payloads
- `meta-dashboard.service`
  - serves frontend-ready analytics views from local DB/cache

### 19.14 Edge Cases

#### Expired Tokens
- mark `reauth_required`
- stop noncritical syncs
- preserve historical data

#### Revoked Permissions
- compare required scopes against granted scopes on each sync
- if missing, emit reconnect notification with exact missing scope list

#### Disconnected Pages
- if IG account no longer linked to selected Page:
  - mark account `disconnected_page`
  - require fresh connect flow

#### API Downtime
- circuit breaker on Meta client
- serve stale dashboard cache with `dataFreshness: stale`

#### Missing Insights
- some metrics are unavailable for some media types or windows
- return nullable metrics, never coerce to zero unless semantically correct

#### Deleted Media
- if media disappears from API:
  - set `deleted_on_instagram_at`
  - exclude from active rankings
  - keep historical metrics

#### Duplicate Syncs
- Redis lock per `(accountId, jobType)`
- DB unique constraints on media and snapshot keys

### 19.15 Production Recommendations

#### Scalable Sync Architecture
- shard workers by account hash
- isolate token refresh from analytics fetch workloads
- prioritize recent active accounts over dormant accounts

#### Observability
- log Meta request IDs
- trace each sync job end-to-end
- metrics:
  - sync latency
  - sync success rate
  - token refresh failures
  - quota saturation
  - webhook lag
  - stale dashboard count

#### Monitoring Alerts
- token refresh failure rate > 5%
- account sync stale > 12h for active account
- webhook signature failures spike
- quota > 85%
- dead-letter jobs > threshold

#### API Cost and Throughput Considerations
- Meta does not bill per call like many third-party APIs, but quota exhaustion is the practical cost
- optimize for:
  - fewer repeated reads
  - snapshot rollups
  - webhook-triggered targeted refresh

#### Future Extensibility
Design a generic social analytics contract:
- `social_accounts`
- `social_media`
- `social_media_metrics`
- provider adapters:
  - Instagram
  - YouTube
  - TikTok

This lets you add TikTok/YouTube later without rewriting dashboard service contracts.

### 19.16 Implementation Notes

#### MVP Integration Scope
- connect one or more Instagram Professional accounts per organization
- read account profile
- sync posts/reels/stories
- ingest account/media/story insights
- power dashboard cards and charts

#### Phase-2 Scope
- comment webhooks and moderation
- content publishing
- cross-channel comparative analytics
- attribution joins between campaigns and IG media

### Official Documentation References
- Meta long-lived token docs:
  - https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
- Meta Webhooks for Instagram Platform:
  - https://developers.facebook.com/docs/instagram-platform/webhooks/
- Meta permissions reference:
  - https://developers.facebook.com/docs/permissions/reference
- Meta Instagram API with Facebook Login collection:
  - https://www.postman.com/meta/instagram/folder/23987686-3a75357f-e106-47ef-a8d9-af1aadf85365
- Meta Instagram insights collection:
  - https://www.postman.com/meta/instagram/folder/w5jo9vk/insights

## 20. Frontend-Aligned MVP Backend Scope

### Purpose
This section narrows the implementation scope to what the current frontend already presents today. It is the recommended first production build.

### Current Frontend Reality
The current UI is a creator-business collaboration platform with:
- public marketing pages
- creator service catalog
- pricing packages
- portfolio and case studies
- testimonials
- blog and newsletter capture
- contact and collaboration inquiry funnel
- client analytics dashboard preview

It is not currently a public social network or community app.

### MVP Backend Modules Required Now

#### 1. Auth and Access
Required because the frontend has `Client Login` and a dashboard.

Implement:
- login
- refresh token rotation
- invite-based client onboarding
- forgot/reset password
- session management
- RBAC for `client_user`, `account_manager`, `content_manager`, `admin`

Key APIs:
- `/api/v1/auth/*`
- `/api/v1/users/me`
- `/api/v1/users/me/sessions`

#### 2. Organizations and Client Accounts
Required because each client dashboard must belong to a specific client/business account.

Implement:
- organizations
- organization memberships
- client profile linkage
- organization settings

Key APIs:
- `/api/v1/organizations/me`
- `/api/v1/organizations/:orgId/settings`

#### 3. Public CMS Content
Required because the frontend already displays editable public content areas.

Implement CMS entities for:
- services
- pricing plans
- plan features
- blog posts
- case studies
- testimonials
- FAQ items

Key APIs:
- `/api/v1/services`
- `/api/v1/pricing-plans`
- `/api/v1/blog-posts`
- `/api/v1/case-studies`
- `/api/v1/testimonials`
- `/api/v1/admin/*` content endpoints

#### 4. Inquiry and Lead Funnel
Required because the contact page is currently a direct sales funnel.

Implement:
- contact form submission
- lead assignment
- lead status workflow
- internal notes
- source tracking

Key APIs:
- `/api/v1/inquiries`
- `/api/v1/admin/inquiries`

#### 5. Instagram Meta Integration
Required because the dashboard UI implies real Instagram-backed analytics.

Implement:
- Meta OAuth connect flow
- encrypted token storage
- profile/media/insights sync
- webhook verification and event handling
- background sync jobs

Key APIs:
- `/api/v1/meta/accounts/connect`
- `/api/v1/meta/accounts/callback`
- `/api/v1/meta/accounts`
- `/api/v1/meta/accounts/:id/sync/*`

#### 6. Campaigns and Deliverables
Required because the business model is collaboration/campaign execution, not just analytics display.

Implement:
- campaign creation
- campaign ownership
- deliverable tracking
- status workflow
- campaign notes
- optional attachment linkage

Key APIs:
- `/api/v1/campaigns`
- `/api/v1/campaigns/:id`
- `/api/v1/campaigns/:id/deliverables`

#### 7. Analytics Dashboard APIs
Required because the dashboard page already shows cards, charts, and category impact sections.

Implement:
- overview cards
- follower growth series
- reach/impressions series
- content performance by type
- audience demographics
- top-performing media
- category impact rollups

Key APIs:
- `/api/v1/meta/dashboard/overview`
- `/api/v1/meta/dashboard/follower-growth`
- `/api/v1/meta/dashboard/reach-engagement`
- `/api/v1/meta/dashboard/top-content`
- `/api/v1/meta/dashboard/audience`

#### 8. Reports and Exports
Required because the dashboard includes an export/report interaction pattern.

Implement:
- queued report generation
- PDF/CSV export
- downloadable report records

Key APIs:
- `/api/v1/campaigns/:id/reports/export`
- `/api/v1/organizations/:orgId/reports`

#### 9. Notifications
Required because sync failures, reports, reconnect prompts, and campaign updates need user visibility.

Implement:
- in-app notifications
- email notifications
- read/unread state

Key APIs:
- `/api/v1/notifications`
- `/api/v1/notifications/:id/read`

#### 10. Media Asset Management
Required because public CMS, case studies, reports, and campaign assets all need file storage.

Implement:
- signed uploads
- media catalog
- processing state
- CDN-backed delivery

Key APIs:
- `/api/v1/media/upload-url`
- `/api/v1/media/:assetId/complete`

### Modules Explicitly Deferred from MVP

These are not needed for the current frontend and should not block first release:
- public feed
- posts CRUD for community content
- public comments system
- likes
- follows
- public social graph
- live chat / typing indicators
- creator-fan messaging
- auto publishing to Instagram

### Frontend-to-Backend MVP Mapping

#### Home
Needs:
- services preview
- stats
- case studies preview
- testimonials preview

Backend:
- public content endpoints
- cached stats endpoints or CMS-managed stats block

#### About
Needs:
- creator profile
- milestone timeline
- category highlights

Backend:
- CMS blocks or specialized about-page content model

#### Services
Needs:
- service list
- service details

Backend:
- `services` module

#### Pricing
Needs:
- pricing plans
- add-ons
- FAQs

Backend:
- `pricing_plans`
- `plan_features`
- `faq_items`

#### Portfolio
Needs:
- case studies
- campaign filters
- before/after metrics

Backend:
- `case_studies`
- optional filter taxonomy

#### Blog
Needs:
- blog listing
- featured article
- categories
- newsletter subscription

Backend:
- `blog_posts`
- `newsletter_subscribers`

#### Contact
Needs:
- collaboration inquiry form

Backend:
- `inquiries`

#### Dashboard
Needs:
- analytics summary
- chart data
- audience breakdown
- category impact
- export/report actions

Backend:
- Meta integration
- campaign analytics
- reports
- notifications

### MVP Database Subset

The minimal first-release table set should be:
- `users`
- `organizations`
- `organization_memberships`
- `services`
- `pricing_plans`
- `plan_features`
- `faq_items`
- `blog_posts`
- `case_studies`
- `testimonials`
- `newsletter_subscribers`
- `inquiries`
- `campaigns`
- `campaign_deliverables`
- `reports`
- `notifications`
- `media_assets`
- `instagram_accounts`
- `instagram_tokens`
- `instagram_media`
- `instagram_media_metrics`
- `instagram_audience_insights`
- `instagram_story_insights`
- `sync_jobs`
- `api_rate_limit_logs`
- `sessions`
- `refresh_tokens`
- `password_resets`
- `email_verifications`
- `audit_logs`

### MVP Delivery Order
1. auth and organizations
2. inquiries
3. public CMS modules
4. media uploads
5. Instagram connection flow
6. sync workers and local analytics storage
7. dashboard analytics APIs
8. reports and notifications

### MVP Success Criteria
- client can log in
- client can connect Instagram Professional account
- backend stores encrypted token and starts sync
- dashboard shows real local analytics after sync
- admin can manage services, pricing, blog, case studies, testimonials
- contact form creates actionable inquiry records
- reports can be generated and downloaded

### Recommendation
Use this section as the implementation contract for phase 1.
Keep the broader sections of the SRS for future expansion, but treat anything community/social-feed related as non-MVP.

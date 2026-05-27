# The Kharagpur Wala Backend

NestJS backend for the The Kharagpur Wala creator-business collaboration platform. The codebase currently covers:

- public CMS APIs for services, pricing, testimonials, case studies, and blog content
- lead capture and newsletter flows
- client organizations, campaigns, analytics, notifications, and settings modules
- mocked Meta/Instagram connection flows for local development
- Prisma + PostgreSQL persistence and Redis-backed future queue/cache integration

## Current status

This project now:

- builds successfully with `npm run build`
- passes unit tests with `npm test -- --runInBand`
- passes e2e tests without binding a real socket via `npm run test:e2e -- --runInBand`
- starts even if PostgreSQL is unavailable, but does so in degraded mode

Important:

- most read and write APIs still require PostgreSQL
- the Meta integration is still a high-fidelity local mock, not a live Graph API implementation
- media upload signing is still mocked

## Stack

- NestJS 11
- Prisma ORM
- PostgreSQL 16
- Redis 7
- Swagger / OpenAPI
- Jest + Supertest

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### 3. Configure environment

```bash
cp .env.example .env
```

Default local ports:

- backend: `http://localhost:3001`
- frontend origin allowed by CORS: `http://localhost:3000`

### 4. Prepare the database

```bash
npm run db:setup
```

That command runs:

1. `prisma generate`
2. `prisma db push`
3. `prisma db seed`

Note: this project currently uses `db push` for local schema setup. There is no committed `prisma/migrations/` directory yet.

### 5. Start the backend

```bash
npm run start:dev
```

## Health endpoints

- `GET /api/v1` returns API metadata
- `GET /api/v1/health/live` returns liveness
- `GET /api/v1/health/ready` returns readiness

Readiness behavior:

- returns `200` when PostgreSQL is reachable
- returns `503` when PostgreSQL is down

The app is allowed to boot even when the database is unavailable so you can still inspect health and startup logs.

## Swagger

When the app is running:

- Base API: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- Swagger UI: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Seed accounts

After `npm run db:setup`, these demo users are available:

- Super admin
  - email: `superadmin@tgw.in`
  - password: `password12345`
- Client user
  - email: `marketing@cafemocha.in`
  - password: `password12345`

## Useful scripts

```bash
npm run build
npm run start:dev
npm run test -- --runInBand
npm run test:e2e -- --runInBand
npm run prisma:generate
npm run db:push
npm run db:seed
npm run db:setup
```

## What is still mocked

These areas are scaffolded but not yet production-integrated:

- `src/modules/meta` uses mocked OAuth token exchange and seeded Instagram analytics data
- `src/modules/media` returns mocked upload metadata instead of real S3/R2 presigned uploads
- some analytics/dashboard responses include fallback demo values when synced data is missing

## Recommended next implementation steps

1. Replace mock Meta callback logic with official Instagram Graph API token exchange
2. Add BullMQ workers for sync jobs and report generation
3. Wire real object storage for media upload flows
4. Add committed Prisma migrations for reproducible environments
5. Add Redis-backed rate limiting and background job processing

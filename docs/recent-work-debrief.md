# Recent Work Debrief

## Summary

The repository has moved from a social-app-shaped baseline toward a usable language-learning product foundation. This batch completes the next major step after learner profile persistence by adding phrase cards, hardening backend deployment packaging, and introducing a local development path that does not depend on AWS deployment.

## What was implemented

### 1. Phrase cards as a real product slice

- Added a dedicated phrase-card domain model and frontend page
- Added backend handlers for:
  - `GET /phrase-cards`
  - `GET /phrase-cards/:id`
- Added real persistence support through infrastructure and seeded phrase-card content
- Wired the dashboard and phrase-card experience to real backend-backed data instead of frontend-only assumptions

### 2. Backend deployment packaging fix

- Replaced the brittle per-Lambda zip expectation with a shared `backend/dist` runtime asset
- Added a cross-platform backend build script that works on Windows
- Updated deployment scripts and CDK asset paths so Lambda handlers resolve consistently
- Documented the corrected deployment flow

### 3. Local development mode

- Added a dev-only `mock` mode for browser-only testing with `localStorage`
- Added a dev-only `local-api` mode using a lightweight Node server with file persistence
- Preserved the AWS/serverless production path without redesigning the architecture
- Added scripts and env presets so the frontend can be run against:
  - AWS
  - local mock data
  - local API

## Why this matters

This reduces product risk in three ways:

- The app is now less dependent on the original social domain
- The next product slice can be tested without waiting on AWS deployment
- Phrase cards and learner preferences now form a real, testable language-learning core

## Local testing paths

### Mock mode

```powershell
npm run dev:frontend:mock
```

### Local API mode

Terminal 1:

```powershell
npm run dev:local-api
```

Terminal 2:

```powershell
npm run dev:frontend:local-api
```

Demo credentials for both:

- username: `demo`
- password: `password123`

## Current limits

- Lessons, grammar persistence, translator sessions, and favorites are still not implemented as real backend slices
- The backend still contains legacy social-app resources and handlers alongside the new language-product modules
- AWS deploy still requires valid AWS credentials and account resolution to actually provision infrastructure

## Best next step

The strongest next implementation step is to continue replacing social-domain assumptions with product-domain modules, starting with either:

- phrase-card favorites / saved phrases
- lesson catalog persistence
- grammar topic persistence

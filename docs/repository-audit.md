# AI Language Companion Repository Audit

## 1. Current tech stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Playwright configured for end-to-end testing
- CSS-based styling without a component system

### Backend
- Node.js Lambda handlers
- JavaScript handlers with light TypeScript usage in a single hello function
- AWS SDK v3
- Jest listed, but no implemented test suite found

### Infrastructure
- AWS CDK v2
- API Gateway
- Lambda
- DynamoDB
- Cognito
- S3 + CloudFront

### Workspace setup
- Root npm/yarn workspaces
- Separate `frontend`, `backend`, and `infrastructure` packages

## 2. Architecture overview

### Repository shape
- `frontend/`: single-page React app
- `backend/`: Lambda handlers grouped by capability
- `infrastructure/`: CDK stack provisioning auth, API, data, and hosting

### Current application architecture
- The repository is still a micro-blogging product, not yet a language platform.
- Frontend routes center on `Feed`, `CreatePost`, `Profile`, `Login`, and `Register`.
- Backend domain model centers on users, posts, likes, follows, and comments.
- Infrastructure provisions social-app-oriented tables and endpoints.

### Existing reusable foundations
- Cognito-based account system
- API Gateway + Lambda deployment pattern
- DynamoDB-based persistence pattern
- Protected SPA routing
- Workspace separation between UI, backend, and infra
- CloudFront/S3 static web deployment path

## 3. Reusable assets and modules

### Strong candidates for reuse
- Authentication flow and user persistence foundation
- Infrastructure deployment topology for a web-first MVP
- Basic API service layer pattern in the frontend
- Error boundary and auth context patterns
- Existing deployment scripts and monorepo layout

### Reuse with refactor
- `users` concept should evolve into learner profiles and preferences
- current API layer should be modularized by feature area
- DynamoDB approach is reusable, but table design must be aligned to learning and conversation workflows
- current UI shell can be reused structurally, but not as a product experience

### Likely to retire or heavily repurpose
- post/feed model
- likes/comments/follows tables and handlers
- social-focused design language
- current feed-centric information architecture

## 4. Missing foundations

### Product and domain
- no language-learning domain model
- no multilingual configuration layer
- no module boundaries for translator, phrases, lessons, and grammar
- no content strategy or schema for scenarios, phrase packs, or lesson progression

### Engineering
- no shared domain contracts between frontend and backend
- no environment validation strategy
- no backend service abstraction for AI/transcription/translation providers
- no repository-level architecture docs or ADRs
- no meaningful automated tests in place
- no CI definition found

### Data and analytics
- no event model for user progress, translation history, or saved phrases
- no storage model for lesson progress or grammar content
- no analytics or monetization readiness layer

## 5. Risks and technical debt

### Product mismatch
- current domain model is misaligned with the business goal, so continuing feature work on top of posts/feed would create waste

### Backend risks
- auth middleware decodes tokens manually before fallback validation; that is fragile and should be hardened later
- login flow uses `email` in request body but actually authenticates against the username value
- many handlers return broad error responses without domain-level validation
- DynamoDB access patterns rely on scan-heavy feed behavior that will not scale well

### Frontend risks
- UI, page state, and API concerns are tightly coupled in pages
- design system is inherited from a social app and conflicts with the target product
- current route map does not express the intended learning modules

### Infrastructure risks
- stack naming and outputs still reference micro-blogging terminology
- removal policies are destructive-development defaults
- no clear staging/production separation

## 6. Opportunities for scaling

### Product architecture
- convert the app to a module-oriented platform with bounded contexts:
  - learner identity
  - translator
  - phrasebook
  - lessons
  - grammar

### Technical architecture
- keep the current monorepo and AWS foundation, but introduce:
  - domain contracts in frontend first, then shared contracts if backend is modernized
  - backend service layer for AI providers
  - feature-specific repositories and APIs
  - analytics/event interfaces for future premium and personalization

### Delivery strategy
- repurpose the existing auth and hosting base
- land a professional web dashboard first
- add translator and phrasebook APIs incrementally
- postpone real-time streaming until the MVP validates user value

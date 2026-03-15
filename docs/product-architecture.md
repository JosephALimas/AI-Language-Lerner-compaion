# AI Language Companion Architecture Direction

## Recommended architecture

### Frontend
- Keep React + TypeScript + Vite.
- Move toward feature modules with clear separation between:
  - UI components
  - domain models
  - services/adapters
  - static content and configuration
- Suggested feature areas:
  - `auth`
  - `dashboard`
  - `translator`
  - `phrasebook`
  - `lessons`
  - `grammar`
  - `profile`

### Backend
- Keep AWS serverless for MVP speed.
- Evolve Lambda handlers into domain-oriented APIs:
  - `auth`
  - `learner-profile`
  - `translator-sessions`
  - `phrase-cards`
  - `lessons`
  - `grammar-guides`
- Add a service layer per handler for:
  - transcription provider integration
  - translation provider integration
  - persistence
  - validation

### Data direction
- Keep DynamoDB initially, but redesign tables around product capabilities instead of social entities.
- Target MVP entities:
  - learner profile
  - language pair preference
  - translation session
  - translation turn
  - phrase card
  - lesson
  - lesson step
  - grammar topic
  - saved item/progress event

### AI integration strategy
- Use provider adapters instead of direct provider calls from handlers.
- Translator pipeline target:
  1. capture audio on client
  2. upload or stream to transcription service
  3. normalize transcript
  4. send text to translation service
  5. persist source text, translation, speaker role, and timestamps
  6. optionally synthesize reply audio later
- Build MVP on request-response APIs first, then extend toward streaming.

## AIDLC roadmap

### 1. Discovery and audit
- map current stack, routes, handlers, infra, and data model
- identify reusable foundations and product mismatches

### 2. Requirement analysis
- formalize learner personas
- define primary language pairs
- define survival-language outcomes for MVP

### 3. System architecture
- establish module boundaries
- define frontend domain contracts
- define target backend API surface

### 4. AI integration planning
- choose initial transcription and translation adapters
- define latency, cost, and privacy constraints
- separate synchronous MVP flow from future streaming flow

### 5. MVP scope definition
- learner auth
- language pair selection
- translator history
- phrase cards
- scenario-based lessons
- beginner grammar guidance

### 6. Incremental implementation
- first: frontend product shell and domain model
- second: backend domain renaming and new endpoints
- third: phrasebook and lessons content persistence
- fourth: translator MVP flow

### 7. Testing and validation planning
- unit tests for domain transformation and validation
- integration tests for handlers
- Playwright coverage for core web flows

### 8. Documentation
- repository audit
- product architecture
- ADRs for provider and data decisions

### 9. Deployment readiness
- environment-specific configs
- production-safe retention policies
- release checklist

### 10. Future iteration readiness
- analytics events
- premium entitlements
- adaptive learning
- pronunciation feedback

## MVP scope

### In
- web-first authenticated shell
- learner profile with source and target language preferences
- translator module UI and session model
- phrase cards by practical category
- lesson catalog for survival scenarios
- grammar starter guides tied to real situations
- persistent-ready contracts, even if some content is static in the first pass

### Out for initial MVP
- live streaming bi-directional voice
- advanced spaced repetition
- social features
- subscriptions and billing
- deep analytics dashboards
- full mobile app

## Feature and module breakdown

### Translator
- microphone capture UX
- transcript display
- translated output
- alternating speaker turns
- conversation history contract
- future streaming adapter slot

### Phrasebook
- categories such as airport, housing, emergencies, study, and daily errands
- source/target language pair behavior
- save/favorite readiness
- quick-send into translator

### Lessons
- scenario-first progression
- compact modules with outcomes
- future exercise slots
- progress tracking contract

### Grammar
- plain-language explanations
- sentence building basics
- examples tied to survival scenarios
- future drill expansion

## Implementation backlog

### Foundation
1. Rebrand frontend shell and navigation around language modules
2. Introduce frontend domain models for languages, lessons, phrases, grammar, and translator sessions
3. Add module-oriented service layer with mock-backed content
4. Replace social design language with a product-appropriate learning dashboard
5. Add repository architecture documentation

### Backend preparation
6. Define target API contracts for translator, phrasebook, lessons, and grammar
7. Harden auth model and align username/email semantics
8. Introduce backend shared response helpers and validation utilities
9. Rename infrastructure resources away from micro-blogging terminology

### MVP delivery
10. Implement learner preferences persistence
11. Implement phrase card endpoints and DynamoDB schema
12. Implement lesson catalog endpoints
13. Implement grammar topic endpoints
14. Implement translator session and turn persistence
15. Integrate transcription and translation providers behind adapters

### Quality and operations
16. Add unit tests for domain models and service adapters
17. Add Playwright coverage for auth and dashboard flows
18. Add CI workflow
19. Add production deployment config and safer retention policies

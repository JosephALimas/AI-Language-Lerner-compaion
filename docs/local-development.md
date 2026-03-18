# Local Development Mode

This project now supports a dev-only local testing path in addition to the AWS/serverless production path.

## Available local modes

### 1. Mock mode

- No backend process required
- Data is persisted in the browser `localStorage`
- Best for fast UI testing of:
  - login/register
  - learner profile persistence
  - phrase card filtering

Frontend runtime:

- `VITE_APP_RUNTIME_MODE=mock`

How to run:

```powershell
npm run dev:frontend:mock
```

Demo credentials:

- username: `demo`
- password: `password123`

Notes:

- You can also register additional local users from the app.
- Mock data is isolated to your browser and machine.

### 2. Local API mode

- Runs a lightweight Node HTTP server
- Persists data to `dev/local-api/data/runtime/local-db.json`
- Uses the same frontend API contracts as the AWS path for:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /users/:id`
  - `PUT /users/:id`
  - `GET /learner-profile`
  - `PUT /learner-profile`
  - `GET /phrase-cards`
  - `GET /phrase-cards/:id`
  - `GET /posts` returning an empty list for legacy compatibility

Frontend runtime:

- `VITE_APP_RUNTIME_MODE=local-api`
- `VITE_API_URL=http://localhost:4010`

How to run:

Terminal 1:

```powershell
npm run dev:local-api
```

Terminal 2:

```powershell
npm run dev:frontend:local-api
```

Demo credentials:

- username: `demo`
- password: `password123`

Local API details:

- Health check: `GET http://localhost:4010/health`
- Runtime data file: `dev/local-api/data/runtime/local-db.json`
- Phrase card seed source: `frontend/src/dev/seed-data/phrase-cards.json`

## Environment files

Committed safe env presets:

- `frontend/.env.mock`
- `frontend/.env.localapi`
- `frontend/.env.example` for AWS-backed frontend usage

## What remains AWS-only

The following production paths are still AWS/serverless only:

- CDK infrastructure provisioning
- API Gateway, Lambda, DynamoDB, Cognito, CloudFront, S3
- backend deployment scripts
- production auth and token validation
- production phrase-card seeding through infrastructure

## Temporary local-mode decisions

- Local auth is intentionally simplified for development only.
- Local API stores passwords in a local JSON file because this mode is not meant for production use.
- Legacy social endpoints are not fully reproduced locally; only the minimum needed to keep the current learner profile and phrase-card flows working has been implemented.

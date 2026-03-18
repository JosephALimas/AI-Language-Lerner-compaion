# Backend Deployment Flow

## Purpose

The backend deployment flow prepares a single shared Lambda runtime asset directory in `backend/dist` and then lets CDK use that directory for every Lambda function handler.

## Generated files

Running the backend packaging flow produces:

- `backend/dist/common/...`
- `backend/dist/functions/...`
- `backend/dist/node_modules/...`
- `backend/dist/package.json`
- `backend/dist/package-lock.json`

This directory is the runtime asset consumed by CDK.

## Intended flow

From the repository root, `deploy-backend.ps1` now runs the backend steps in this order:

1. `npm install` in `backend/`
2. `npm run build` in `backend/`
   - copies runtime source files from `backend/src` to `backend/dist`
   - excludes `.ts` source files
3. `backend/scripts/prepare-lambda-packages.ps1`
   - installs production dependencies into `backend/dist/node_modules`
   - prepares `backend/dist` as the deployable Lambda runtime asset
4. `npm install` in `infrastructure/`
5. `npm run build` in `infrastructure/`
6. `cdk bootstrap`
7. `cdk deploy`

## CDK expectation

CDK now points every Lambda function to the shared asset directory:

- asset path: `backend/dist`
- handler examples:
  - `functions/auth/register.handler`
  - `functions/users/getLearnerProfile.handler`
  - `functions/phraseCards/getPhraseCards.handler`

## Why this replaced the old flow

The previous packaging flow attempted to create one zip per Lambda function in `backend/dist/lambda-packages`.
That approach was brittle on Windows and slow because it duplicated dependency installation and packaging work across functions.

The current flow is simpler and more reliable:

- one runtime asset directory
- one production dependency install
- handler paths preserved from the source tree

## Temporary notes

- The deploy scripts still install infrastructure dependencies during deployment; that is acceptable for now but could later move to CI or a more formal release pipeline.
- `backend/dist` is a generated artifact and should not be committed.

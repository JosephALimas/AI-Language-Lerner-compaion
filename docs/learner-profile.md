# Learner Profile Slice

## Purpose

This is the first persisted language-product domain flow in the repository.
It gives each authenticated user a learner profile with language preferences and learning intent, so the app no longer depends on static frontend assumptions for the primary learning setup.

## Domain model

The learner profile is currently stored as a nested object on the existing user record in `UsersTable`.

```json
{
  "userId": "string",
  "nativeLanguage": "es | de | en | it",
  "learningLanguage": "es | de | en | it",
  "interfaceLanguage": "es | de | en | it",
  "proficiencyLevel": "beginner | intermediate | advanced",
  "learningGoal": "travel | study_abroad | living_abroad | tourism | business | other"
}
```

## API contract

### `GET /learner-profile`
- Auth required: yes
- Uses the authenticated user context from the existing auth middleware
- Response:

```json
{
  "learnerProfile": {
    "userId": "user-123",
    "nativeLanguage": "es",
    "learningLanguage": "de",
    "interfaceLanguage": "es",
    "proficiencyLevel": "beginner",
    "learningGoal": "travel"
  }
}
```

### `PUT /learner-profile`
- Auth required: yes
- Request body:

```json
{
  "nativeLanguage": "es",
  "learningLanguage": "de",
  "interfaceLanguage": "es",
  "proficiencyLevel": "beginner",
  "learningGoal": "travel"
}
```

- Response:

```json
{
  "message": "Learner profile saved successfully",
  "learnerProfile": {
    "userId": "user-123",
    "nativeLanguage": "es",
    "learningLanguage": "de",
    "interfaceLanguage": "es",
    "proficiencyLevel": "beginner",
    "learningGoal": "travel"
  }
}
```

## Persistence approach

- The implementation intentionally reuses the existing `UsersTable` instead of introducing a new table in this slice.
- The learner profile is stored under `user.learnerProfile`.
- Registration now seeds a default learner profile so new users have a real persisted starting configuration immediately.
- If an older user record has no `learnerProfile` yet, the GET endpoint returns a compatibility default so the frontend can still render and save the profile without a migration step.
- This is an incremental step that keeps future refactoring open if learner settings later merit a separate table or more advanced access patterns.

## Frontend integration

- The dashboard loads the learner profile from `/learner-profile` and uses it to show the active language pair, proficiency level, and learning goal.
- The profile page now acts as a minimal learner settings screen for the authenticated user.
- Existing legacy social/profile behavior is left mostly intact for now to avoid a destructive rewrite.

## Temporary decisions and assumptions

- Supported languages are currently limited to the initial product set: Spanish, German, English, and Italian.
- Default seeded learner profile values are:
  - native language: `es`
  - learning language: `de`
  - interface language: `es`
  - proficiency: `beginner`
  - learning goal: `travel`
- Existing auth middleware is reused as-is. No auth hardening was attempted in this slice.

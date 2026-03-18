# Phrase Cards Slice

## Purpose

Phrase cards are the second persisted language-product slice in the repository.
They provide practical survival and travel language content through real backend storage instead of frontend-only mock data.

## Domain model

Phrase cards are stored in a dedicated `PhraseCardsTable`.

```json
{
  "id": "string",
  "sourceLanguage": "es | de | en | it",
  "targetLanguage": "es | de | en | it",
  "category": "string",
  "phraseText": "string",
  "translatedText": "string",
  "pronunciationGuide": "string?",
  "usageNotes": "string?",
  "level": "beginner | intermediate | advanced",
  "isSystemProvided": true
}
```

Current storage also includes internal query fields:
- `languagePair`
- `categoryLevelSort`

These support efficient filtering by learner language pair and category without overengineering the first slice.

## API contract

### `GET /phrase-cards`
- Auth required: yes
- If `sourceLanguage` and `targetLanguage` are omitted, the backend derives them from the authenticated learner profile
- Query parameters:
  - `sourceLanguage`
  - `targetLanguage`
  - `category`
  - `level`

- Response:

```json
{
  "phraseCards": [
    {
      "id": "es-de-greetings-hello",
      "sourceLanguage": "es",
      "targetLanguage": "de",
      "category": "greetings",
      "phraseText": "Hola, mucho gusto.",
      "translatedText": "Hallo, freut mich.",
      "pronunciationGuide": "HA-lo, froyt mikh",
      "usageNotes": "Useful for first meetings and polite introductions.",
      "level": "beginner",
      "isSystemProvided": true
    }
  ],
  "filters": {
    "sourceLanguage": "es",
    "targetLanguage": "de",
    "category": "greetings",
    "level": "beginner"
  }
}
```

### `GET /phrase-cards/{id}`
- Auth required: yes
- Response:

```json
{
  "phraseCard": {
    "id": "es-de-greetings-hello",
    "sourceLanguage": "es",
    "targetLanguage": "de",
    "category": "greetings",
    "phraseText": "Hola, mucho gusto.",
    "translatedText": "Hallo, freut mich.",
    "level": "beginner",
    "isSystemProvided": true
  }
}
```

## Persistence approach

- Phrase cards now live in a dedicated DynamoDB table instead of inside the user record.
- The table uses a GSI on `languagePair` and `categoryLevelSort` so the first slice can support:
  - learner-pair-based retrieval
  - category filtering
  - lightweight level filtering
- No public content-creation endpoint is exposed yet.
- Initial system phrase cards are seeded through infrastructure so the deployed app has immediately usable content.

## Seed content strategy

- The initial seed content prioritizes Spanish-speaking learners studying German.
- Additional seed coverage is included for:
  - Spanish to English
  - Spanish to Italian
- Categories currently emphasize practical situations:
  - greetings
  - directions
  - restaurant
  - transport
  - emergencies
  - shopping
  - lodging
  - study / daily life

## Frontend integration

- The dashboard now loads phrase cards from the backend and shows a persisted preview for the learner's active language pair.
- A dedicated phrase-cards screen loads real cards from the API and supports category and level filtering.
- Learner profile preferences are reused so phrase cards align with the current source and target languages.

## Temporary decisions and limitations

- Phrase cards are currently system-provided only; no admin or authoring workflow is exposed yet.
- Favorites, review history, personalization, offline packs, and audio are intentionally deferred.
- The initial query model is optimized for the current MVP filters, not for every future phrase-card workflow.

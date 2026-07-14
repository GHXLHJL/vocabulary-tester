# Findings - Vocabulary Tester v3.5

## Maimemo API Research
- **Rate Limit**: 20 requests per 10s, 40 per 60s, 2000 per 5h.
- **Caching Strategy**: Use `localStorage` to cache interpretations to avoid redundant API calls.
- **Learning Data API**: Can fetch status (1, 0.5, 0) and memory strength.

## Data Structure Constraints
- Groups are identified by `id`.
- Insertion detection needs to compare `words.length` or individual word presence.

## UI/UX Notes
- User profile prefers clean, minimal layout.
- Use deep blue (#0056b3) for correct answers and Serif/Songti font.

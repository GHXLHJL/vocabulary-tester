# Task Plan - Vocabulary Tester v3.5 Maimemo Integration

## Goal
Implement v3.5 features: Maimemo API integration for smart weighting and authoritative grading, and strict data change rules (insertion/demotion).

## Phases
- [x] Phase 1: Settings UI & Token Management `complete`
    - Add settings button/panel to dashboard
    - Implement Token storage in `localStorage`
    - Implement Token validation (simple ping or test request)
- [x] Phase 2: Data Change Logic Refactoring `complete`
    - Implement detection for new groups and word insertions
    - Implement automatic demotion/reset logic for modified groups
- [x] Phase 3: Maimemo API Integration (Weighting) `complete`
    - Implement "Sync Weakness" logic to map Maimemo errors to local groups
    - Adjust group weights based on Maimemo status
- [x] Phase 4: Maimemo API Integration (Grading) `complete`
    - Implement authoritative interpretation fetching
    - Update grading logic to include API results

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| | | |

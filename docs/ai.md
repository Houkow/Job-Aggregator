# AI Feature - Smart Search Assistant (LLM-powered Filter Enhancement)

## Problem
Users struggle to efficiently configure search filters when exploring job offers, leading to time-consuming manual filtering and less relevant results.

## Solution
We implemented a lightweight AI-assisted search feature powered by a local LLM (via LM Studio) combined with rule-based preprocessing.

The system improves the Explorer experience by:
- interpreting user intent from natural language search queries
- suggesting and auto-filling relevant filters (location, skills, contract type)
- translating unstructured input into structured search parameters
- reducing manual effort during job exploration

## Input
- User search query
- Selected filters (if any)
- Optional user context (profile, previous searches)

## Output
- Structured filter suggestions
- Auto-completed search parameters
- Improved query interpretation
- Optional contextual search guidance

## Method
The system combines:
- rule-based keyword extraction for initial parsing
- a local LLM (LM Studio) for intent interpretation and filter suggestion generation

The LLM is used only at inference time and runs locally without external API calls.

No training or fine-tuning is performed.

## Constraints
- Response time under 5 seconds
- Runs locally via LM Studio
- Lightweight integration with frontend Explorer page
- No external API dependency

## Why this feature
Users often do not know how to structure job search filters. This feature reduces friction by translating natural language into structured filters, improving usability and search efficiency.

## Success Metrics
- Reduced manual filter usage
- Faster search setup time
- Increased engagement on Explorer page
- Improved user satisfaction during job discovery
# ADR 001 - Tech Stack

## Context
We needed to build a full job aggregator platform (frontend, backend, data ingestion, database).

## Decision
We chose:
- Frontend: Next.js
- Backend: Node.js (Express-style API)
- Database: PostgreSQL
- Data ingestion: Python service
- Containerization: Docker + Docker Compose

## Why
- Next.js for fast UI + routing
- Node.js for API simplicity
- Python for data processing flexibility
- PostgreSQL for relational job/user data

## Alternatives
- Monolithic backend (rejected: not scalable)
- No Python service (rejected: weaker ingestion pipeline)

## Consequences
+ clear separation of concerns
+ scalable architecture
- more services to maintain
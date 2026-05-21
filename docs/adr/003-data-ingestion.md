# ADR 003 - Data Ingestion

## Context
We need to collect job offers from WeLoveDevs API and store them in our database.

## Decision
We use a Python script executed by the backend to ingest and normalize job data.

## Why
- Python is better for data processing
- Easy integration with external APIs
- Lightweight ingestion pipeline

## Alternatives
- Node.js ingestion (rejected: less efficient for data parsing)
- No ingestion system (rejected: project requirement)

## Consequences
+ flexible ingestion system
+ clean separation backend / data layer
- dependency on Python runtime
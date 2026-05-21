# ADR 002 - Authentication

## Context
We needed secure authentication for users and admins.

## Decision
We use JWT authentication with bcrypt password hashing.

## Why
- Stateless authentication
- Secure password storage
- Compatible with frontend/backend separation

## Alternatives
- Session-based auth (rejected: not scalable for API architecture)

## Consequences
+ secure and scalable
- token management required on frontend
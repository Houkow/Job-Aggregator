# Security - Job Aggregator

## Authentication
- JWT-based authentication
- Passwords hashed with bcrypt

## Authorization
- Roles: user, admin, recruiter
- Backend enforces role-based access control

## API Security
- Protected routes require JWT token

## Input Security
- Parameterized SQL queries to prevent injection
- Basic input validation on requests

## Environment
- Secrets stored in .env files
- No hardcoded credentials

## Database
- PostgreSQL with foreign keys and constraints
- Cascade deletion for data consistency

## Docker
- Services isolated in containers
- Database only accessible via backend

## Limitations
- Rate limiting
- No advanced security layer (WAF / 2FA)
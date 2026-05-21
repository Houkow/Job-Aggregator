# Architecture Overview

## System design

The application is composed of 4 main services orchestrated using Docker Compose:

- Frontend (Next.js)
- Backend API (Node.js / Express)
- Database (PostgreSQL)
- AI Service (Python FastAPI)

Each service is fully containerized and communicates over a shared Docker network.
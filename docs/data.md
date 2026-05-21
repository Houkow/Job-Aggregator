# Data - Job Aggregator

## Data Sources

### 1. WeLoveDevs (main source)
We use the WeLoveDevs API to fetch job offers.

- Official Epitech API
- Rate limit: 1 request / second
- Data retrieved: title, company, location, description, salary, contract type

👉 This is the main source of job listings displayed on the platform.

---

### 2. Internal data
We store in PostgreSQL:
- users
- profiles
- saved offers
- applications
- recruiter offers

---

## Data Flow

### 1. Fetching
We call the WeLoveDevs API to retrieve job offers.

### 2. Normalization
We transform raw data into a unified format:
- consistent structure for all offers
- cleanup of missing fields
- standardization (location, contract type, etc.)

### 3. Storage
All data is stored in a PostgreSQL database.

---

## Database

We use PostgreSQL running in Docker.

Main tables:
- users
- roles
- offers
- profiles
- saved_offers
- applications
- recruiter_offers

Relationships are enforced using foreign keys.

---

## Goal

- centralize job offers from external sources
- enable search and filtering
- manage user actions (save, apply, etc.)

---

## Summary

WeLoveDevs = job source  
PostgreSQL = storage layer  
backend = data processing + API layer  
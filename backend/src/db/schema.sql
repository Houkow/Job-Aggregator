CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('user'), ('admin')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    description_preview TEXT,
    company_name VARCHAR(255),
    company_id VARCHAR(255),
    contract_types TEXT[],
    location_lat FLOAT,
    location_lng FLOAT,
    formatted_places TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10),
    salary_recurrence VARCHAR(50),
    profession VARCHAR(255),
    status VARCHAR(50),
    source VARCHAR(100) DEFAULT 'welovedevs',
    publish_date TIMESTAMP,
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_offers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES offers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, offer_id)
);
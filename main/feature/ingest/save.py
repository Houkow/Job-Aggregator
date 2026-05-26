import psycopg2
import os
# from dotenv import dotenv_values

# # Charge le .env du backend
# config = dotenv_values("../../../backend/.env")

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "jobdb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
    )

def save_jobs(jobs):
    conn = get_connection()
    cur = conn.cursor()
    inserted = 0
    skipped = 0

    for job in jobs:
        try:
            cur.execute("""
                INSERT INTO offers (
                    external_id, title, company_name, formatted_places,
                    location_lat, location_lng, salary_min, salary_max,
                    skills, contract_types, description, publish_date, profession
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    to_timestamp(%s / 1000000.0), %s
                )
                ON CONFLICT (external_id) DO NOTHING
            """, (
                job.get("external_id"),
                job.get("title"),
                job.get("company"),
                job.get("formatted_places"),
                job.get("location_lat"),
                job.get("location_lng"),
                job.get("salary_min"),
                job.get("salary_max"),
                job.get("skills", []),
                job.get("contract_types", []),
                job.get("description"),
                job.get("publish_date"),
                job.get("type"),
            ))
            inserted += 1
        except Exception as e:
            print(f"Erreur insertion {job.get('external_id')}: {e}")
            skipped += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"✓ {inserted} offres insérées, {skipped} ignorées")
    return inserted
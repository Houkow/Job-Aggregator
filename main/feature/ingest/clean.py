def clean_job(job):
    geoloc = job.get("_geoloc", [{}])

    return {
        "external_id": job.get("objectID"),
        "title": job.get("title"),
        "company": job.get("smallCompany", {}).get("companyName"),
        "formatted_places": job.get("formattedPlaces", ["Unknown"])[0],
        "location_lat": geoloc[0].get("lat") if geoloc else None,
        "location_lng": geoloc[0].get("lng") if geoloc else None,
        "salary_min": job.get("details", {}).get("salary", {}).get("min"),
        "salary_max": job.get("details", {}).get("salary", {}).get("max"),
        "skills": [s["name"] for s in job.get("skillsList", [])],
        "contract_types": job.get("contractTypes", []),
        "description": job.get("description"),
        "publish_date": job.get("publishDate"),
        "type": job.get("profession", {}).get("algoliaKeyword")
    }
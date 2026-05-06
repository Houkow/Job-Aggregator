def clean_job(job):
    return {
        "title": job.get("title"),
        "company": job.get("smallCompany", {}).get("companyName"),
        "location": job.get("formattedPlaces", ["Unknown"])[0],
        "salary_min": job.get("details", {}).get("salary", {}).get("min"),
        "salary_max": job.get("details", {}).get("salary", {}).get("max"),
        "skills": [s["name"] for s in job.get("skillsList", [])],
        "type": job.get("profession", {}).get("algoliaKeyword")
    }
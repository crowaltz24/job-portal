import os
import json
import PyPDF2
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from bson.objectid import ObjectId  # keep this one because it allows you to find entries if theyre an ObjectId type instead of string

def connect_to_db():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["job-portal"]
    return db

def load_job_listings(db):
    jobs_collection = db["jobs"]
    return list(jobs_collection.find())

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = "".join(page.extract_text() for page in reader.pages if page.extract_text())
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def preprocess_text(text):
    return text.lower()

def numpy_to_python(obj):
    if isinstance(obj, np.float64) or isinstance(obj, np.float32):
        return float(obj)
    if isinstance(obj, np.int64) or isinstance(obj, np.int32):
        return int(obj)
    return obj

def recommend_jobs_for_user(user_id):
    db = connect_to_db()

    users_collection = db["users"]
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user or "resumePath" not in user:
        return {"error": "User or resume not found."}

    relative_path = user["resumePath"]
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    resume_path = os.path.join(base_dir, relative_path)

    if not os.path.exists(resume_path):
        return {"error": f"Resume file not found at {resume_path}"}

    resume_text = extract_text_from_pdf(resume_path)
    if not resume_text:
        return {"error": "Could not extract text from the resume."}
    resume_text = preprocess_text(resume_text)

    job_listings = load_job_listings(db)
    if not job_listings:
        return {"error": "No job listings found."}

    job_descriptions = [preprocess_text(job.get("description", "").replace("\n", " ")) for job in job_listings]
    job_ids = [job["_id"] for job in job_listings]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([resume_text] + job_descriptions)

    similarity_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    ranked_jobs = sorted(zip(job_ids, similarity_scores), key=lambda x: x[1], reverse=True)

    recommendations = [{"job_id": str(job_id), "score": numpy_to_python(score)} for job_id, score in ranked_jobs[:10]]

    return json.dumps({"recommendations": recommendations}, default=numpy_to_python)

if __name__ == "__main__":
    user_id = "67642c3382551158a0c6fc39"
    try:
        recommendations = recommend_jobs_for_user(user_id)
        # Always output JSON
        print(json.dumps(recommendations, default=numpy_to_python))
    except Exception as e:
        error_response = {"error": f"Error generating recommendations: {str(e)}"}
        print(json.dumps(error_response))

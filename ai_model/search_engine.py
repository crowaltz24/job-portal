import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def recommend_jobs(keywords, job_descriptions):
    documents = job_descriptions + [keywords]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1]).flatten()
    ranked_jobs = sorted(list(enumerate(cosine_similarities)), key=lambda x: x[1], reverse=True)
    return ranked_jobs

if __name__ == '__main__':
    try:
        input_data = json.loads(sys.stdin.read())
        keywords = input_data['keywords']
        job_descriptions = input_data['job_descriptions']
        ranked_jobs = recommend_jobs(keywords, job_descriptions)
        print(json.dumps(ranked_jobs))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
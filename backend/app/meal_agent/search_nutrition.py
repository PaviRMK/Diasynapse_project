import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the saved index (created in the previous step)
df = pd.read_csv(r"E:\DiaSynapse\backend\data\nutrition_reference_indexed.csv")
embeddings = np.load(r"E:\DiaSynapse\backend\data\nutrition_embeddings.npy")

model = SentenceTransformer("all-MiniLM-L6-v2")
def has_conflicting_keywords(query, matched_dish):
    query_lower = query.lower()
    dish_lower = matched_dish.lower()

    veg_words = ["vegetable", "veg", "paneer", "dal", "aloo", "gobi"]
    nonveg_words = ["chicken", "mutton", "fish", "egg", "prawn", "beef", "pork"]

    query_is_veg = any(w in query_lower for w in veg_words)
    dish_is_nonveg = any(w in dish_lower for w in nonveg_words)

    query_is_nonveg = any(w in query_lower for w in nonveg_words)
    dish_is_veg = any(w in dish_lower for w in veg_words)

    return (query_is_veg and dish_is_nonveg) or (query_is_nonveg and dish_is_veg)
def search_dish(query, top_k=1, min_similarity=0.80):
    query_embedding = model.encode([query])[0]

    similarities = np.dot(embeddings, query_embedding) / (
        np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_embedding)
    )

    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        score = round(float(similarities[idx]), 3)
        dish_name = df.iloc[idx]["Dish Name"]
        conflict = has_conflicting_keywords(query, dish_name)
        results.append({
            "dish_name": dish_name,
            "carbs_per_100g": df.iloc[idx]["Carbohydrates (g)"],
            "similarity_score": score,
            "reliable_match": (score >= min_similarity) and (not conflict)
        })
    return results

# Test it with a few sample food names
if __name__ == "__main__":
    test_queries = ["Dosa", "Idli", "Potato masala", "Sambar", "Coconut chutney","Vegetable Stew"]
    for q in test_queries:
        result = search_dish(q, top_k=1)
        print(f"Query: '{q}' -> {result}")
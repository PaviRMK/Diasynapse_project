import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the nutrition reference data
df = pd.read_csv(r"E:\DiaSynapse\datasets\nutrition_reference\Indian_Food_Nutrition_Processed.csv")
print("Total dishes:", df.shape[0])

# Load a small, fast embedding model (runs locally, free, no API needed)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Convert every dish name into an embedding (a list of numbers representing its meaning)
print("Creating embeddings for all dish names...")
dish_names = df["Dish Name"].tolist()
embeddings = model.encode(dish_names, show_progress_bar=True)

# Save embeddings + the dataframe together so we don't have to redo this every time
np.save(r"E:\DiaSynapse\backend\data\nutrition_embeddings.npy", embeddings)
df.to_csv(r"E:\DiaSynapse\backend\data\nutrition_reference_indexed.csv", index=False)

print("Saved embeddings and indexed nutrition data.")
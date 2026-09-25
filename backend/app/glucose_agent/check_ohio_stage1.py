import pandas as pd

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\combined_glucose_data.csv")
print("Total rows:", df.shape[0])
print(df["dataset"].value_counts())
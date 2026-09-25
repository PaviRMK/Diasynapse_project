import pandas as pd

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\target_glucose_data.csv")

print("Total rows:", df.shape[0])
print()
print("Rows per dataset:")
print(df["dataset"].value_counts())
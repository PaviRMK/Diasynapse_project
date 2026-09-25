import pandas as pd

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\target_glucose_data.csv")

print("Unique values in 'dataset' column:")
print(df["dataset"].value_counts())

print("\nSample patient_id per dataset:")
for d in df["dataset"].unique():
    sample = df[df["dataset"] == d]["patient_id"].unique()[:5]
    print(f"{d}: {sample}")
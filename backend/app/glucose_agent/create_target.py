import pandas as pd

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\features_glucose_data.csv")
df["timestamp"] = pd.to_datetime(df["timestamp"])
df = df.sort_values(["patient_id", "timestamp"])

# Target = glucose value 30 minutes into the future (6 steps ahead, ~5 min intervals)
df["target_glucose_30min"] = df.groupby("patient_id")["glucose"].shift(-6)

# Drop rows where target couldn't be created (end of each patient's data)
df = df.dropna(subset=["target_glucose_30min"])

print("After target creation:", df.shape)
print(df[["timestamp", "patient_id", "glucose", "target_glucose_30min"]].head(10))

output_path = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\target_glucose_data.csv"
df.to_csv(output_path, index=False)
print(f"Saved to {output_path}")
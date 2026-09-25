import pandas as pd
import numpy as np

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\target_glucose_data.csv")

print("Total rows:", df.shape[0])
print("Total unique patients:", df["patient_id"].nunique())

# Patient-wise 80/20 split across ALL datasets together (prevents data leakage)
np.random.seed(42)
all_patients = df["patient_id"].unique()
np.random.shuffle(all_patients)

split_idx = int(len(all_patients) * 0.8)
train_patients = all_patients[:split_idx]
test_patients = all_patients[split_idx:]

train_df = df[df["patient_id"].isin(train_patients)]
test_df = df[df["patient_id"].isin(test_patients)]

print("\nTrain patients:", len(train_patients), "| Test patients:", len(test_patients))
print("Train rows:", train_df.shape[0], "| Test rows:", test_df.shape[0])

print("\nTrain dataset breakdown:")
print(train_df["dataset"].value_counts())
print("\nTest dataset breakdown:")
print(test_df["dataset"].value_counts())

train_output = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\train_data.csv"
test_output = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\test_data.csv"
train_df.to_csv(train_output, index=False)
test_df.to_csv(test_output, index=False)
print(f"\nSaved train data to {train_output}")
print(f"Saved test data to {test_output}")
import pandas as pd

df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\cleaned_glucose_data.csv")

# Step 1: Convert timestamp column to proper datetime
df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
df = df.dropna(subset=["timestamp"])

# Step 2: Sort by patient and time (VERY important for time-series features)
df = df.sort_values(["patient_id", "timestamp"])

# Step 3: Extract time-of-day features
df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek

# Step 4: Create "previous glucose reading" feature (per patient)
df["glucose_lag_1"] = df.groupby("patient_id")["glucose"].shift(1)

# Step 5: Create "glucose 30 minutes ago" (assuming ~5 min intervals, 6 steps back)
df["glucose_lag_6"] = df.groupby("patient_id")["glucose"].shift(6)

# Step 6: Drop rows where lag features couldn't be created (start of each patient's data)
df = df.dropna(subset=["glucose_lag_1", "glucose_lag_6"])

print("After feature engineering:", df.shape)
print(df.columns.tolist())
print(df.head())

output_path = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\features_glucose_data.csv"
df.to_csv(output_path, index=False)
print(f"Saved to {output_path}")
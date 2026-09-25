import pandas as pd

df = pd.read_csv(
    r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\combined_glucose_data.csv",
    low_memory=False
)

print("Before cleaning:", df.shape)

# Step 1: Drop rows with no timestamp or no glucose (can't use these at all)
df = df.dropna(subset=["timestamp", "glucose"])

# Step 2: Convert glucose to proper numbers (force errors into NaN, then drop those too)
df["glucose"] = pd.to_numeric(df["glucose"], errors="coerce")
df = df.dropna(subset=["glucose"])

# Step 3: Convert carbs and insulin_dose to numbers too (text like "data not available" becomes NaN)
df["carbs"] = pd.to_numeric(df["carbs"], errors="coerce")
df["insulin_dose"] = pd.to_numeric(df["insulin_dose"], errors="coerce")

# Step 4: Fill missing carbs/insulin with 0 (means "no meal/dose at this exact moment" - correct info, not missing)
df["carbs"] = df["carbs"].fillna(0)
df["insulin_dose"] = df["insulin_dose"].fillna(0)

print("After cleaning:", df.shape)
print(df.isnull().sum())
print(df.head())

# Save the cleaned file
output_path = r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\cleaned_glucose_data.csv"
df.to_csv(output_path, index=False)
print(f"Saved cleaned file to {output_path}")
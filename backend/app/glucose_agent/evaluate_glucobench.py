import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load the raw GlucoBench eval data
df = pd.read_csv(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\data\eval_glucobench_data.csv")
print("Raw GlucoBench data:", df.shape)

# Clean it (same steps as clean_data.py)
df = df.dropna(subset=["timestamp", "glucose"])
df["glucose"] = pd.to_numeric(df["glucose"], errors="coerce")
df = df.dropna(subset=["glucose"])
df["carbs"] = pd.to_numeric(df["carbs"], errors="coerce").fillna(0)
df["insulin_dose"] = pd.to_numeric(df["insulin_dose"], errors="coerce").fillna(0)

# Create the same features (same steps as feature_engineering.py)
df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
df = df.dropna(subset=["timestamp"])
df = df.sort_values(["patient_id", "timestamp"])
df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek
df["glucose_lag_1"] = df.groupby("patient_id")["glucose"].shift(1)
df["glucose_lag_6"] = df.groupby("patient_id")["glucose"].shift(6)
df = df.dropna(subset=["glucose_lag_1", "glucose_lag_6"])

# Create the same target (same steps as create_target.py)
df["target_glucose_30min"] = df.groupby("patient_id")["glucose"].shift(-6)
df = df.dropna(subset=["target_glucose_30min"])

print("After processing:", df.shape)

# Load the trained model and predict
model = joblib.load(r"C:\Users\Pavithraa\OneDrive\Desktop\DiaSynapse\backend\models\glucose_xgboost_model.pkl")

feature_cols = ["glucose", "carbs", "insulin_dose", "hour", "day_of_week", "glucose_lag_1", "glucose_lag_6"]
X = df[feature_cols]
y_true = df["target_glucose_30min"]

y_pred = model.predict(X)

mae = mean_absolute_error(y_true, y_pred)
rmse = np.sqrt(mean_squared_error(y_true, y_pred))
mard = np.mean(np.abs(y_true - y_pred) / y_true) * 100

print(f"\n--- GlucoBench Independent Evaluation ---")
print(f"MAE:  {mae:.2f} mg/dL")
print(f"RMSE: {rmse:.2f} mg/dL")
print(f"MARD: {mard:.2f}%")
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
import joblib

train_df = pd.read_csv(r"E:\DiaSynapse\backend\data\train_data.csv")
test_df = pd.read_csv(r"E:\DiaSynapse\backend\data\test_data.csv")

# Features the model learns from, and the target it predicts
feature_cols = ["glucose", "carbs", "insulin_dose", "hour", "day_of_week", "glucose_lag_1", "glucose_lag_6"]
target_col = "target_glucose_30min"

X_train = train_df[feature_cols]
y_train = train_df[target_col]
X_test = test_df[feature_cols]
y_test = test_df[target_col]

print("Training XGBoost model...")
model = xgb.XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)

print("Predicting on test set...")
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mard = np.mean(np.abs(y_test - y_pred) / y_test) * 100  # Mean Absolute Relative Difference (%)

print(f"\nMAE:  {mae:.2f} mg/dL")
print(f"RMSE: {rmse:.2f} mg/dL")
print(f"MARD: {mard:.2f}%")

# Save the trained model
model_path = r"E:\DiaSynapse\backend\models\glucose_xgboost_model.pkl"
joblib.dump(model, model_path)
print(f"\nModel saved to {model_path}")
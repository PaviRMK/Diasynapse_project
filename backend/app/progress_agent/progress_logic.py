import pandas as pd

def get_progress_report(csv_path):
    df = pd.read_csv(csv_path)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    # Split into first half vs second half (simple week-over-week comparison)
    midpoint = len(df) // 2
    first_half = df.iloc[:midpoint]
    second_half = df.iloc[midpoint:]

    avg_glucose_week1 = round(first_half["avg_glucose"].mean(), 1)
    avg_glucose_week2 = round(second_half["avg_glucose"].mean(), 1)
    glucose_change = round(avg_glucose_week2 - avg_glucose_week1, 1)

    weight_week1 = round(first_half["weight_kg"].mean(), 1)
    weight_week2 = round(second_half["weight_kg"].mean(), 1)
    weight_change = round(weight_week2 - weight_week1, 1)

    # Simple trend labeling (rule-based, not causation)
    if glucose_change < -5:
        glucose_trend = "Improving"
    elif glucose_change > 5:
        glucose_trend = "Worsening"
    else:
        glucose_trend = "Stable"

    return {
        "period_days": len(df),
        "avg_glucose_week1": avg_glucose_week1,
        "avg_glucose_week2": avg_glucose_week2,
        "glucose_change": glucose_change,
        "glucose_trend": glucose_trend,
        "weight_week1_kg": weight_week1,
        "weight_week2_kg": weight_week2,
        "weight_change_kg": weight_change,
        "note": "Glucose and weight trends are shown as associations over time, not as proven cause-and-effect.",
        "label": "Based on your own logged history"
    }


if __name__ == "__main__":
    result = get_progress_report(r"E:\DiaSynapse\backend\app\progress_agent\sample_history.csv")
    for key, value in result.items():
        print(f"{key}: {value}")

from app.firebase_config import db
import pandas as pd

def get_progress_report_from_firebase():
    # Fetch all glucose logs from Firestore
    docs = db.collection("glucose_logs").order_by("logged_at").stream()

    records = []
    for doc in docs:
        data = doc.to_dict()
        records.append({
            "logged_at": data.get("logged_at"),
            "avg_glucose": data.get("predicted_glucose_30min")
        })

    if len(records) < 2:
        return {
            "error": "Not enough logged data yet to show a trend. Log at least 2 glucose readings first."
        }

    df = pd.DataFrame(records)
    df["logged_at"] = pd.to_datetime(df["logged_at"])
    df = df.sort_values("logged_at")

    midpoint = len(df) // 2
    if midpoint == 0:
        midpoint = 1

    first_half = df.iloc[:midpoint]
    second_half = df.iloc[midpoint:]

    avg_glucose_period1 = round(first_half["avg_glucose"].mean(), 1)
    avg_glucose_period2 = round(second_half["avg_glucose"].mean(), 1)
    glucose_change = round(avg_glucose_period2 - avg_glucose_period1, 1)

    if glucose_change < -5:
        glucose_trend = "Improving"
    elif glucose_change > 5:
        glucose_trend = "Worsening"
    else:
        glucose_trend = "Stable"

    return {
        "total_readings": len(df),
        "avg_glucose_period1": avg_glucose_period1,
        "avg_glucose_period2": avg_glucose_period2,
        "glucose_change": glucose_change,
        "glucose_trend": glucose_trend,
        "note": "Trend based on your real logged glucose predictions over time.",
        "label": "Based on your own logged history"
    }
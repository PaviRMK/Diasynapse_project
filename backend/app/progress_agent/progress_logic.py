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
from datetime import datetime, timedelta, timezone
import logging
from math import isfinite
import os

logger = logging.getLogger(__name__)
PROGRESS_DEBUG_ENABLED = os.getenv("DIASYNAPSE_PROGRESS_DEBUG", "").lower() in {"1", "true", "yes"}

def get_progress_report_from_firebase(
    user_email: str,
    user_id: str | None = None,
    range_days: int = 7,
    now: datetime | None = None,
):
    if range_days not in (7, 14, 30):
        range_days = 7

    now = now or datetime.now().astimezone()
    if now.tzinfo is None:
        now = now.astimezone()
    cutoff = now - timedelta(days=range_days)

    if PROGRESS_DEBUG_ENABLED:
        logger.info(
            "Progress request uid=%s range_days=%s cutoff=%s now=%s",
            user_id,
            range_days,
            cutoff.isoformat(),
            now.isoformat(),
        )

    def read_user_records(collection_name: str) -> list[dict]:
        documents = []
        seen_ids = set()
        filters = [("user_email", user_email)]
        if user_id:
            filters.extend((field, user_id) for field in ("user_id", "uid", "userId"))

        for field, value in filters:
            collection_path = f"{collection_name}"
            documents_from_query = list(
                db.collection(collection_path).where(field, "==", value).stream()
            )
            if PROGRESS_DEBUG_ENABLED:
                logger.info(
                    "Progress query uid=%s collection=%s filter=%s matched_documents=%s",
                    user_id,
                    collection_path,
                    field,
                    len(documents_from_query),
                )
            for document in documents_from_query:
                document_id = getattr(document, "id", None)
                data = document.to_dict() or {}
                data["_document_id"] = document_id
                identity = document_id or (data.get("logged_at") or data.get("timestamp"), repr(data))
                if identity not in seen_ids:
                    seen_ids.add(identity)
                    documents.append(data)
                    if PROGRESS_DEBUG_ENABLED:
                        logger.info(
                            "Progress document uid=%s path=%s/%s timestamp=%s input_glucose=%s total_estimated_carbs_g=%s",
                            user_id,
                            collection_path,
                            document_id,
                            data.get("logged_at") or data.get("timestamp"),
                            data.get("input_glucose"),
                            data.get("total_estimated_carbs_g"),
                        )
        return documents

    def parse_timestamp(value):
        if isinstance(value, datetime):
            timestamp = value
        elif isinstance(value, str) and value.strip():
            try:
                timestamp = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
            except ValueError:
                return None
        else:
            return None

        if timestamp.tzinfo is None:
            timestamp = timestamp.astimezone()
        return timestamp.astimezone(now.tzinfo)

    glucose_records = []
    for record in read_user_records("glucose_logs"):
        timestamp = parse_timestamp(record.get("logged_at") or record.get("timestamp"))
        raw_value = record.get("input_glucose")
        try:
            value = float(raw_value)
        except (TypeError, ValueError):
            continue
        if timestamp is None or timestamp < cutoff or timestamp > now or not isfinite(value):
            continue
        glucose_records.append({
            "document_id": record.get("_document_id"),
            "timestamp": timestamp,
            "value": value,
            "history_sequence": record.get("history_sequence", 0),
        })
    glucose_records.sort(key=lambda record: (record["timestamp"], record["history_sequence"]))

    meal_records = []
    for record in read_user_records("meal_logs"):
        timestamp = parse_timestamp(record.get("timestamp") or record.get("logged_at"))
        raw_carbs = record.get("total_estimated_carbs_g")
        try:
            carbs = float(raw_carbs)
        except (TypeError, ValueError):
            continue
        if timestamp is None or timestamp < cutoff or timestamp > now or not isfinite(carbs):
            continue
        meal_records.append({
            "document_id": record.get("_document_id"),
            "timestamp": timestamp,
            "carbs": carbs,
            "items": record.get("items", []),
        })
    meal_records.sort(key=lambda record: record["timestamp"])

    if PROGRESS_DEBUG_ENABLED:
        logger.info(
            "Progress filtered uid=%s glucose_records=%s meal_records=%s",
            user_id,
            len(glucose_records),
            len(meal_records),
        )

    def display_timestamp(timestamp: datetime) -> str:
        return timestamp.isoformat()

    average_glucose = (
        round(sum(record["value"] for record in glucose_records) / len(glucose_records), 1)
        if glucose_records
        else None
    )
    time_in_range = (
        round(
            sum(70 <= record["value"] <= 140 for record in glucose_records)
            / len(glucose_records)
            * 100,
            1,
        )
        if glucose_records
        else None
    )

    avg_glucose_period1 = None
    avg_glucose_period2 = None
    glucose_change = None
    glucose_trend = None
    if len(glucose_records) >= 2:
        midpoint = len(glucose_records) // 2
        first_half = glucose_records[:midpoint]
        second_half = glucose_records[midpoint:]
        avg_glucose_period1 = round(sum(row["value"] for row in first_half) / len(first_half), 1)
        avg_glucose_period2 = round(sum(row["value"] for row in second_half) / len(second_half), 1)
        glucose_change = round(avg_glucose_period2 - avg_glucose_period1, 1)
        if glucose_change < -5:
            glucose_trend = "Downward"
        elif glucose_change > 5:
            glucose_trend = "Upward"
        else:
            glucose_trend = "Stable"

    return {
        "range_days": range_days,
        "total_records": len(glucose_records) + len(meal_records),
        "total_readings": len(glucose_records),
        "average_glucose": average_glucose,
        "time_in_range": time_in_range,
        "avg_glucose_period1": avg_glucose_period1,
        "avg_glucose_period2": avg_glucose_period2,
        "glucose_change": glucose_change,
        "glucose_trend": glucose_trend,
        "glucose_readings": [
            {
                "document_id": record["document_id"],
                "timestamp": display_timestamp(record["timestamp"]),
                "label": record["timestamp"].strftime("%b %d %H:%M"),
                "value": record["value"],
            }
            for record in glucose_records
        ],
        "meal_carbs": [
            {
                "document_id": record["document_id"],
                "timestamp": display_timestamp(record["timestamp"]),
                "label": record["timestamp"].strftime("%b %d %H:%M"),
                "carbs": record["carbs"],
                "items": record["items"],
            }
            for record in meal_records
        ],
        "note": "Trend direction compares recorded glucose values over the selected period; it does not identify a cause.",
        "label": "Based on your own logged history",
    }
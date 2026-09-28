from datetime import datetime, timedelta

INSULIN_ACTIVITY_WINDOW_HOURS = 4
INSULIN_ACTIVITY_WINDOW_MINUTES = INSULIN_ACTIVITY_WINDOW_HOURS * 60


def calculate_insulin_active_percent(
    time_since_last_dose_minutes,
    insulin_duration_minutes=INSULIN_ACTIVITY_WINDOW_MINUTES,
):
    """
    Rapid-acting insulin is typically active for about 4 hours (240 minutes).
    This estimates how much is still 'active' in the body using a simple linear decay.
    """
    if insulin_duration_minutes <= 0:
        return 0.0
    elapsed_minutes = max(0.0, float(time_since_last_dose_minutes))
    remaining_percentage = (insulin_duration_minutes - elapsed_minutes) / insulin_duration_minutes * 100
    return round(max(0.0, min(100.0, remaining_percentage)), 1)


def get_medication_awareness(
    last_dose_time: datetime,
    next_scheduled_dose_time: datetime,
    meal_carbs: float | None,
    current_time: datetime = None,
    meal_context: dict | None = None,
):
    if current_time is None:
        current_time = datetime.now(last_dose_time.tzinfo) if last_dose_time.tzinfo else datetime.now()
    elif last_dose_time.tzinfo is None and current_time.tzinfo is not None:
        current_time = current_time.replace(tzinfo=None)
    elif last_dose_time.tzinfo is not None:
        current_time = (
            current_time.replace(tzinfo=last_dose_time.tzinfo)
            if current_time.tzinfo is None
            else current_time.astimezone(last_dose_time.tzinfo)
        )

    if last_dose_time.tzinfo is None and next_scheduled_dose_time.tzinfo is not None:
        next_scheduled_dose_time = next_scheduled_dose_time.replace(tzinfo=None)
    elif last_dose_time.tzinfo is not None:
        next_scheduled_dose_time = (
            next_scheduled_dose_time.replace(tzinfo=last_dose_time.tzinfo)
            if next_scheduled_dose_time.tzinfo is None
            else next_scheduled_dose_time.astimezone(last_dose_time.tzinfo)
        )

    minutes_since_last_dose = max(
        0.0,
        (current_time - last_dose_time).total_seconds() / 60,
    )
    insulin_active_percent = calculate_insulin_active_percent(minutes_since_last_dose)

    minutes_until_next_dose = max(
        0.0,
        (next_scheduled_dose_time - current_time).total_seconds() / 60,
    )

    risk_note = "Insulin may still be active. Follow your prescribed care plan and monitor your glucose."
    if minutes_until_next_dose <= 0:
        timing_note = "Your scheduled dose time has passed. Follow your prescribed care plan."
    elif minutes_until_next_dose < 30:
        timing_note = "Your next scheduled dose is coming up soon."
    else:
        timing_note = f"Your next scheduled dose is in about {int(minutes_until_next_dose)} minutes."

    return {
        "insulin_active_percent": insulin_active_percent,
        "insulin_duration_minutes": INSULIN_ACTIVITY_WINDOW_MINUTES,
        "minutes_since_last_dose": round(minutes_since_last_dose, 1),
        "minutes_until_next_dose": round(minutes_until_next_dose, 1),
        "meal_carbs_logged": meal_carbs,
        "meal_context": meal_context,
        "risk_note": risk_note,
        "timing_note": timing_note,
        "disclaimer": "This is situational awareness only. It does not calculate or recommend any insulin dose. Always follow your doctor's prescribed schedule."
    }


# Quick test
if __name__ == "__main__":
    last_dose = datetime.now() - timedelta(minutes=90)
    next_dose = datetime.now() + timedelta(minutes=150)

    result = get_medication_awareness(last_dose, next_dose, meal_carbs=83.4)
    for key, value in result.items():
        print(f"{key}: {value}")
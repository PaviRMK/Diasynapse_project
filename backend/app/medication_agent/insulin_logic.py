from datetime import datetime, timedelta

def calculate_insulin_active_percent(time_since_last_dose_minutes, insulin_duration_minutes=240):
    """
    Rapid-acting insulin is typically active for about 4 hours (240 minutes).
    This estimates how much is still 'active' in the body using a simple linear decay.
    """
    if time_since_last_dose_minutes >= insulin_duration_minutes:
        return 0.0
    remaining_fraction = 1 - (time_since_last_dose_minutes / insulin_duration_minutes)
    return round(remaining_fraction * 100, 1)


def get_medication_awareness(last_dose_time: datetime, next_scheduled_dose_time: datetime, meal_carbs: float, current_time: datetime = None):
    if last_dose_time.tzinfo is not None:
        if current_time is None:
            current_time = datetime.now(last_dose_time.tzinfo)
        elif current_time.tzinfo is None:
            last_dose_time = last_dose_time.replace(tzinfo=None)
        if next_scheduled_dose_time.tzinfo is None and last_dose_time.tzinfo is not None:
            next_scheduled_dose_time = next_scheduled_dose_time.replace(tzinfo=last_dose_time.tzinfo)
    else:
        if current_time is None:
            current_time = datetime.now()
        if next_scheduled_dose_time.tzinfo is not None:
            next_scheduled_dose_time = next_scheduled_dose_time.replace(tzinfo=None)

    minutes_since_last_dose = (current_time - last_dose_time).total_seconds() / 60
    insulin_active_percent = calculate_insulin_active_percent(minutes_since_last_dose)

    minutes_until_next_dose = (next_scheduled_dose_time - current_time).total_seconds() / 60

    # Rule-based situational awareness (NO dose calculation, NO schedule changes)
    if insulin_active_percent > 50:
        risk_note = "High insulin still active — extra caution advised if eating a carb-heavy meal."
    elif insulin_active_percent > 0:
        risk_note = "Some insulin still active from your last dose."
    else:
        risk_note = "No significant insulin remaining from your last dose."
    if minutes_until_next_dose < 0:
        timing_note = "Your scheduled dose time has passed — please follow up as per your doctor's plan."
    elif minutes_until_next_dose < 30:
        timing_note = "Your next scheduled dose is coming up soon."
    else:
        timing_note = f"Your next scheduled dose is in about {int(minutes_until_next_dose)} minutes."

    return {
        "insulin_active_percent": insulin_active_percent,
        "minutes_since_last_dose": round(minutes_since_last_dose, 1),
        "minutes_until_next_dose": round(minutes_until_next_dose, 1),
        "meal_carbs_logged": meal_carbs,
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
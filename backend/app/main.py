from app.orchestration.care_crew import run_care_crew
from app.firebase_config import db
from datetime import datetime
from app.progress_agent.progress_logic import get_progress_report_from_firebase
from datetime import datetime
from app.medication_agent.insulin_logic import get_medication_awareness
import json
from app.meal_agent.search_nutrition import search_dish

from fastapi import UploadFile, File, Depends
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI()

from app.auth import auth_router, get_current_user
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model once, when the server starts
model_path = r"E:\DiaSynapse\backend\models\glucose_xgboost_model.pkl"
model = joblib.load(model_path)

class MealItemContext(BaseModel):
    food_name: str
    estimated_carbs_g: float
    matched_database_dish: str | None = None
    source: str | None = None

class MealAgentContext(BaseModel):
    items: list[MealItemContext] = Field(default_factory=list)
    gemini_confidence: str | None = None
    timestamp: datetime | None = None

# This defines what data the frontend must send us
class GlucoseInput(BaseModel):
    glucose: float
    carbs: float | None = None
    insulin_dose: float
    hour: int
    day_of_week: int
    glucose_lag_1: float
    glucose_lag_6: float
    meal_context: MealAgentContext | None = None

class GlucoseReading(BaseModel):
    glucose: float

@app.get("/")
def home():
    return {"message": "DiaSynapse Glucose Agent API is running"}

@app.post("/predict-glucose")
def predict_glucose(data: GlucoseInput, current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]
    user_id = current_user.get("uid")
    existing_logs = [
        log.to_dict()
        for log in db.collection("glucose_logs").where("user_email", "==", user_email).stream()
    ]
    has_glucose_history = any(
        log.get("input_glucose") is not None
        for log in existing_logs
    )

    input_df = pd.DataFrame([{
        "glucose": data.glucose,
        "carbs": data.carbs,
        "insulin_dose": data.insulin_dose,
        "hour": data.hour,
        "day_of_week": data.day_of_week,
        "glucose_lag_1": data.glucose_lag_1,
        "glucose_lag_6": data.glucose_lag_6
    }])

    prediction = model.predict(input_df)[0]

    result = {
        "predicted_glucose_30min": round(float(prediction), 1),
        "label": "AI-Estimated"
    }

    # Save this glucose prediction to Firebase
    log_entry = dict(result)
    log_entry["input_glucose"] = data.glucose
    log_entry["input_carbs"] = data.carbs
    log_entry["insulin_dose"] = data.insulin_dose
    log_entry["meal_context"] = data.meal_context.dict() if data.meal_context else None
    log_entry["user_email"] = user_email
    if not has_glucose_history:
        baseline_logged_at = datetime.now().isoformat()
        for sequence, glucose_value in enumerate((data.glucose_lag_6, data.glucose_lag_1)):
            db.collection("glucose_logs").add({
                "input_glucose": glucose_value,
                "logged_at": baseline_logged_at,
                "history_sequence": sequence,
                "record_type": "initial_history",
                "user_email": user_email,
                "user_id": user_id,
            })
        log_entry["history_sequence"] = 2
    else:
        log_entry["history_sequence"] = len(existing_logs)
    log_entry["logged_at"] = datetime.now().isoformat()
    log_entry["user_id"] = user_id
    db.collection("glucose_logs").add(log_entry)

    return result

@app.post("/log-glucose")
def log_glucose(data: GlucoseReading, current_user: dict = Depends(get_current_user)):
    log_entry = {
        "input_glucose": data.glucose,
        "logged_at": datetime.now().isoformat(),
        "user_email": current_user["email"],
        "user_id": current_user.get("uid"),
    }
    db.collection("glucose_logs").add(log_entry)
    return log_entry

@app.post("/analyze-meal")
async def analyze_meal(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    image_bytes = await file.read()

    prompt = """
    You are a nutrition assistant. Look at this meal photo and identify the food items.
    Respond ONLY with valid JSON in this exact format, nothing else, no markdown:

    {
      "items": [
        {"food_name": "<name>", "estimated_carbs_g": <number>, "portion_grams": <number>}
      ],
      "confidence": "<low/medium/high>"
    }
    """

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=file.content_type)
        ]
    )

    # Clean up response text in case Gemini wraps it in markdown code blocks
    raw_text = response.text.strip()
    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    gemini_result = json.loads(raw_text)

    # For each food item, cross-check against the real nutrition database (RAG)
    final_items = []
    total_carbs = 0

    for item in gemini_result["items"]:
        db_match = search_dish(item["food_name"], top_k=1, min_similarity=0.75)[0]

        if db_match["reliable_match"]:
            # Use real database value, scaled to the estimated portion size
            carbs_per_100g = db_match["carbs_per_100g"]
            portion = item["portion_grams"]
            verified_carbs = round((carbs_per_100g / 100) * portion, 1)
            source = "nutrition_database"
            matched_dish = db_match["dish_name"]
        else:
            # No reliable DB match, fall back to Gemini's own estimate
            verified_carbs = item["estimated_carbs_g"]
            source = "ai_estimate"
            matched_dish = None

        final_items.append({
            "food_name": item["food_name"],
            "matched_database_dish": matched_dish,
            "estimated_carbs_g": verified_carbs,
            "source": source
        })
        total_carbs += verified_carbs
        # Save this meal log to Firebase
    meal_timestamp = datetime.now().isoformat()
    meal_log = {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1),
        "gemini_confidence": gemini_result["confidence"],
        "label": "AI-Estimated",
        "timestamp": meal_timestamp
    }
    meal_log["user_email"] = current_user["email"]
    meal_log["user_id"] = current_user.get("uid")
    db.collection("meal_logs").add(meal_log)

    return {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1),
        "gemini_confidence": gemini_result["confidence"],
        "label": "AI-Estimated",
        "timestamp": meal_timestamp,
    }
class MedicationInput(BaseModel):
    last_dose_time: datetime
    next_scheduled_dose_time: datetime
    meal_carbs: float | None = None
    dose_units: float | None = None
    meal_context: MealAgentContext | None = None

@app.post("/medication-awareness")
def medication_awareness(data: MedicationInput, current_user: dict = Depends(get_current_user)):
    result = get_medication_awareness(
        last_dose_time=data.last_dose_time,
        next_scheduled_dose_time=data.next_scheduled_dose_time,
        meal_carbs=data.meal_carbs,
        meal_context=data.meal_context.dict() if data.meal_context else None,
    )

    # Save this medication check to Firebase
    log_entry = dict(result)
    log_entry["logged_at"] = datetime.now().isoformat()
    log_entry["last_dose_time"] = data.last_dose_time.isoformat()
    log_entry["next_scheduled_dose_time"] = data.next_scheduled_dose_time.isoformat()
    log_entry["meal_carbs"] = data.meal_carbs
    log_entry["dose_units"] = data.dose_units
    log_entry["user_email"] = current_user["email"]
    db.collection("medication_logs").add(log_entry)

    return result
@app.get("/progress-report")
def progress_report(current_user: dict = Depends(get_current_user), range_days: int = 7):
    result = get_progress_report_from_firebase(
        user_email=current_user["email"],
        user_id=current_user.get("uid"),
        range_days=range_days,
    )
    return result

@app.get("/dashboard-data")
def dashboard_data(current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]

    def get_user_logs(collection_name: str) -> list[dict]:
        docs = db.collection(collection_name).where("user_email", "==", user_email).stream()
        return [doc.to_dict() for doc in docs]

    glucose_logs = get_user_logs("glucose_logs")
    meal_logs = get_user_logs("meal_logs")
    medication_logs = get_user_logs("medication_logs")

    glucose_logs.sort(
        key=lambda log: (log.get("logged_at", ""), log.get("history_sequence", 0))
    )
    meal_logs.sort(key=lambda log: log.get("timestamp", ""))
    medication_logs.sort(key=lambda log: log.get("logged_at", ""))

    activities = []
    for log in glucose_logs:
        value = log.get("input_glucose")
        if value is not None:
            activities.append({
                "text": f"Glucose reading: {value} mg/dL",
                "logged_at": log.get("logged_at", ""),
            })
    for log in meal_logs:
        carbs = log.get("total_estimated_carbs_g")
        if carbs is not None:
            activities.append({
                "text": f"Meal logged: {carbs}g carbs",
                "logged_at": log.get("timestamp", ""),
            })
    for log in medication_logs:
        activities.append({
            "text": "Medication dose logged",
            "logged_at": log.get("logged_at", ""),
        })
    activities.sort(key=lambda activity: activity["logged_at"], reverse=True)

    return {
        "glucose": glucose_logs[-1] if glucose_logs else None,
        "glucose_history": [
            log["input_glucose"]
            for log in glucose_logs
            if log.get("input_glucose") is not None
        ],
        "meal": meal_logs[-1] if meal_logs else None,
        "medication": medication_logs[-1] if medication_logs else None,
        "progress": get_progress_report_from_firebase(user_email),
        "recent_activities": activities[:5],
    }
class CareCheckInput(BaseModel):
    last_dose_time: datetime
    next_scheduled_dose_time: datetime

@app.post("/care-check")
async def care_check(
    last_dose_time: datetime,
    next_scheduled_dose_time: datetime,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    # Step 1: Run Meal Agent (reuse the same logic as /analyze-meal)
    image_bytes = await file.read()

    prompt = """
    You are a nutrition assistant. Look at this meal photo and identify the food items.
    Respond ONLY with valid JSON in this exact format, nothing else, no markdown:

    {
      "items": [
        {"food_name": "<name>", "estimated_carbs_g": <number>, "portion_grams": <number>}
      ],
      "confidence": "<low/medium/high>"
    }
    """

    response = gemini_client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[prompt, types.Part.from_bytes(data=image_bytes, mime_type=file.content_type)]
    )

    raw_text = response.text.strip().replace("```json", "").replace("```", "").strip()
    gemini_result = json.loads(raw_text)

    final_items = []
    total_carbs = 0
    for item in gemini_result["items"]:
        db_match = search_dish(item["food_name"], top_k=1, min_similarity=0.75)[0]
        if db_match["reliable_match"]:
            carbs_per_100g = db_match["carbs_per_100g"]
            portion = item["portion_grams"]
            verified_carbs = round((carbs_per_100g / 100) * portion, 1)
            source = "nutrition_database"
            matched_dish = db_match["dish_name"]
        else:
            verified_carbs = item["estimated_carbs_g"]
            source = "ai_estimate"
            matched_dish = None
        final_items.append({
            "food_name": item["food_name"],
            "matched_database_dish": matched_dish,
            "estimated_carbs_g": verified_carbs,
            "source": source
        })
        total_carbs += verified_carbs

    meal_timestamp = datetime.now().isoformat()
    meal_result = {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1),
        "gemini_confidence": gemini_result["confidence"],
        "timestamp": meal_timestamp,
    }

    # Save meal log (same as /analyze-meal)
    meal_log = dict(meal_result)
    meal_log["gemini_confidence"] = gemini_result["confidence"]
    meal_log["label"] = "AI-Estimated"
    meal_log["timestamp"] = meal_timestamp
    meal_log["user_email"] = current_user["email"]
    meal_log["user_id"] = current_user.get("uid")
    db.collection("meal_logs").add(meal_log)

    # Step 2: Run orchestration crew (Medication Agent + CrewAI summary)
    orchestration_result = await run_care_crew(meal_result, last_dose_time, next_scheduled_dose_time)

    # Save the combined care check to Firebase too
    care_log = dict(orchestration_result)
    care_log["logged_at"] = datetime.now().isoformat()
    care_log["user_email"] = current_user["email"]
    db.collection("care_checks").add(care_log)

    return orchestration_result
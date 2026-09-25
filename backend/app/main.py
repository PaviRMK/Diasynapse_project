from app.orchestration.care_crew import run_care_crew
from app.firebase_config import db
from datetime import datetime
from app.progress_agent.progress_logic import get_progress_report_from_firebase
from datetime import datetime
from app.medication_agent.insulin_logic import get_medication_awareness
import json
from app.meal_agent.search_nutrition import search_dish

from fastapi import UploadFile, File
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()

from app.auth import auth_router
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

# This defines what data the frontend must send us
class GlucoseInput(BaseModel):
    glucose: float
    carbs: float
    insulin_dose: float
    hour: int
    day_of_week: int
    glucose_lag_1: float
    glucose_lag_6: float

@app.get("/")
def home():
    return {"message": "DiaSynapse Glucose Agent API is running"}

@app.post("/predict-glucose")
def predict_glucose(data: GlucoseInput):
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
    log_entry["logged_at"] = datetime.now().isoformat()
    db.collection("glucose_logs").add(log_entry)

    return result
@app.post("/analyze-meal")
async def analyze_meal(file: UploadFile = File(...)):
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
    meal_log = {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1),
        "gemini_confidence": gemini_result["confidence"],
        "label": "AI-Estimated",
        "timestamp": datetime.now().isoformat()
    }
    db.collection("meal_logs").add(meal_log)

    return {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1),
        "gemini_confidence": gemini_result["confidence"],
        "label": "AI-Estimated"
    }
class MedicationInput(BaseModel):
    last_dose_time: datetime
    next_scheduled_dose_time: datetime
    meal_carbs: float

@app.post("/medication-awareness")
def medication_awareness(data: MedicationInput):
    result = get_medication_awareness(
        last_dose_time=data.last_dose_time,
        next_scheduled_dose_time=data.next_scheduled_dose_time,
        meal_carbs=data.meal_carbs
    )

    # Save this medication check to Firebase
    log_entry = dict(result)
    log_entry["logged_at"] = datetime.now().isoformat()
    db.collection("medication_logs").add(log_entry)

    return result
@app.get("/progress-report")
def progress_report():
    result = get_progress_report_from_firebase()
    return result
class CareCheckInput(BaseModel):
    last_dose_time: datetime
    next_scheduled_dose_time: datetime

@app.post("/care-check")
async def care_check(
    last_dose_time: datetime,
    next_scheduled_dose_time: datetime,
    file: UploadFile = File(...)
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

    meal_result = {
        "items": final_items,
        "total_estimated_carbs_g": round(total_carbs, 1)
    }

    # Save meal log (same as /analyze-meal)
    meal_log = dict(meal_result)
    meal_log["gemini_confidence"] = gemini_result["confidence"]
    meal_log["label"] = "AI-Estimated"
    meal_log["timestamp"] = datetime.now().isoformat()
    db.collection("meal_logs").add(meal_log)

    # Step 2: Run orchestration crew (Medication Agent + CrewAI summary)
    orchestration_result = await run_care_crew(meal_result, last_dose_time, next_scheduled_dose_time)

    # Save the combined care check to Firebase too
    care_log = dict(orchestration_result)
    care_log["logged_at"] = datetime.now().isoformat()
    db.collection("care_checks").add(care_log)

    return orchestration_result
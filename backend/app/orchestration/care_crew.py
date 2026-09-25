import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM
from datetime import datetime

from app.medication_agent.insulin_logic import get_medication_awareness

load_dotenv()

gemini_llm = LLM(
    model="gemini/gemini-3.6-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

async def run_care_crew(meal_result: dict, last_dose_time: datetime, next_scheduled_dose_time: datetime):
    """
    Takes the Meal Agent's output (already computed) and the patient's dose timing,
    runs the Medication Agent, then uses a CrewAI agent to combine both into
    one clear, friendly summary for the patient.
    """
    meal_carbs = meal_result["total_estimated_carbs_g"]

    # Run Medication Agent (existing rule-based logic, not AI)
    medication_result = get_medication_awareness(
        last_dose_time=last_dose_time,
        next_scheduled_dose_time=next_scheduled_dose_time,
        meal_carbs=meal_carbs
    )

    # CrewAI agent combines both results into one patient-friendly message
    summarizer_agent = Agent(
        role="DiaSynapse Care Coordinator",
        goal="Combine meal and medication information into one short, clear, supportive message for a diabetic patient",
        backstory=(
            "You are the coordinating voice of DiaSynapse. You never give medical advice, "
            "never suggest insulin doses, and always remind the patient this is AI-estimated, "
            "informational support — not a replacement for their doctor."
        ),
        llm=gemini_llm,
        verbose=True
    )

    summary_task = Task(
        description=f"""
        Combine this information into ONE short, warm paragraph (3-4 sentences max) for the patient:

        Meal just logged: {meal_result['items']}
        Total estimated carbs: {meal_carbs}g

        Medication status: {medication_result['risk_note']}
        Timing: {medication_result['timing_note']}

        Rules: Do NOT suggest any insulin dose or amount. Do NOT give medical advice.
        End with a brief reminder to consult their doctor for any dosing decisions.
        """,
        expected_output="A short, warm, 3-4 sentence patient-facing summary.",
        agent=summarizer_agent
    )

    crew = Crew(agents=[summarizer_agent], tasks=[summary_task], verbose=False)
    summary_result = await crew.kickoff_async()

    return {
        "meal_analysis": meal_result,
        "medication_status": medication_result,
        "combined_summary": str(summary_result)
    }
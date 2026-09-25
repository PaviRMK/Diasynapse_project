import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM

load_dotenv()

# Configure CrewAI to use Gemini instead of OpenAI
gemini_llm = LLM(
    model="gemini/gemini-3.6-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

# A simple test agent
test_agent = Agent(
    role="Diabetes Care Assistant",
    goal="Give a short, friendly summary of a patient's meal and glucose status",
    backstory="You are part of DiaSynapse, an AI system that helps diabetic patients understand their daily readings.",
    llm=gemini_llm,
    verbose=True
)

test_task = Task(
    description="Write one short sentence summarizing: a patient just logged a meal with 83.4g carbs and their predicted glucose in 30 minutes is 164 mg/dL.",
    expected_output="A single short, friendly sentence for the patient.",
    agent=test_agent
)

crew = Crew(
    agents=[test_agent],
    tasks=[test_task],
    verbose=True
)

result = crew.kickoff()
print("\n--- FINAL RESULT ---")
print(result)
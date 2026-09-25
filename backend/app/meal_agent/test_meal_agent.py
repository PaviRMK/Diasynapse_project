import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()  # reads the .env file
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Test with a sample meal image
image_path = r"E:\DiaSynapse\backend\data\sample_meal.jpg"

with open(image_path, "rb") as f:
    image_bytes = f.read()

prompt = """
You are a nutrition assistant. Look at this meal photo and identify the food items.
For each item, estimate the approximate carbohydrate content in grams.
Respond ONLY in this exact format, nothing else:

Food items: <comma separated list>
Estimated total carbs: <number> g
Confidence: <low/medium/high>
"""

response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=[
        prompt,
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
    ]
)

print(response.text)
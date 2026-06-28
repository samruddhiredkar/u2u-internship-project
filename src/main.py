import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

app = FastAPI()

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Define request models for better validation
class ChatRequest(BaseModel):
    message: str

class FeedbackRequest(BaseModel):
    incident_id: str
    rating: int

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Call the Groq API
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a helpful cybersecurity incident response assistant."},
            {"role": "user", "content": request.message}
        ],
        model="llama3-8b-8192",
    )
    
    # Extract the response from Groq
    ai_response = chat_completion.choices[0].message.content
    
    return {
        "response": ai_response, 
        "incident_type": "analyzed_by_ai"
    }

@app.get("/api/history")
def history():
    return {"history": []}

@app.get("/api/users")
def users():
    return {"users": ["Analyst_1", "Analyst_2"]}

@app.post("/api/feedback")
def feedback(payload: FeedbackRequest):
    # Logic to store the feedback would go here
    return {"status": "logged", "received_rating": payload.rating}
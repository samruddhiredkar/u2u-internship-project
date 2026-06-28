import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Middleware (Essential for browser-based frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific domains in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client with error checking
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY not found in environment variables.")
client = Groq(api_key=api_key)

# Models
class ChatRequest(BaseModel):
    prompt: str

class FeedbackRequest(BaseModel):
    incident_id: str
    rating: int

# Utility to load knowledge base
def load_data(filename):
    try:
        with open(f'data/{filename}', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Load your knowledge base
        playbooks = load_data('playbooks.json')
        
        # Build System Prompt with injected context
        system_instructions = (
            f"You are a Cybersecurity Assistant. Use these playbooks for reference: {json.dumps(playbooks)}. "
            "Provide specific, actionable steps. If the incident is not covered, provide general best practice guidance."
        )
        
        # API Call
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": request.prompt}
            ],
            model="llama3-8b-8192",
        )
        
        return {
            "response": chat_completion.choices[0].message.content, 
            "incident_type": "analyzed_by_ai"
        }
        
    except Exception as e:
        # Professional Error Handling
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Error communicating with AI service.")

@app.get("/api/history")
def history():
    return {"history": []}

@app.get("/api/users")
def users():
    return {"users": ["Analyst_1", "Analyst_2"]}

@app.post("/api/feedback")
def feedback(payload: FeedbackRequest):
    # Log logic here
    return {"status": "logged", "received_rating": payload.rating}

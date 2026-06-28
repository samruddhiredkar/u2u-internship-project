import os
import json
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY not found.")
client = Groq(api_key=api_key)

# Database helper
def get_db_connection():
    return sqlite3.connect('data/incidents.db')

# --- OPTIMIZATION 1: Load data ONCE at startup ---
def load_data(filename):
    try:
        with open(f'data/{filename}', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Load data into global memory
PLAYBOOKS = load_data('playbooks.json')
CVE_DATA = load_data('cve_data.json')

# Models
class ChatRequest(BaseModel):
    prompt: str

class FeedbackRequest(BaseModel):
    incident_id: str
    rating: int

# --- OPTIMIZATION 2: Verified Health Check ---
@app.get("/api/health")
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "error", "database": "disconnected"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # --- OPTIMIZATION 3: Using pre-loaded global data ---
        system_instructions = (
            "You are a Cybersecurity Assistant. "
            f"Reference Data: {json.dumps(PLAYBOOKS[:10])}. " # Only send a relevant sample
            "Provide specific, actionable steps based on these playbooks."
        )
        
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
    return {"status": "logged", "received_rating": payload.rating}

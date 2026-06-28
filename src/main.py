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

# --- FIX 1: Corrected Database Path ---
def get_db_connection():
    return sqlite3.connect('deployment/incident_response.db')

# Utility to load knowledge base
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
        # --- FIX 2 & 3: Proper JSON Slicing and CVE Re-injection ---
        # Access the list inside the 'playbooks' key and include CVEs
        playbook_list = PLAYBOOKS.get("playbooks", []) if isinstance(PLAYBOOKS, dict) else PLAYBOOKS
        
        system_instructions = (
            "You are a Cybersecurity Assistant. "
            f"Reference Playbooks: {json.dumps(playbook_list[:10])}. " 
            f"Reference CVE Data: {json.dumps(CVE_DATA)}. "
            "Provide specific, actionable steps based on these data sources."
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

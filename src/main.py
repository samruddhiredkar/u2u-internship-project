import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

app = FastAPI()

# 1. Add CORS Middleware (Essential for Frontend-Backend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Update Request Model to match Frontend ({ prompt: ... })
class ChatRequest(BaseModel):
    prompt: str

class FeedbackRequest(BaseModel):
    incident_id: str
    rating: int

# Load your local knowledge base for RAG
def load_playbooks():
    try:
        with open('data/playbooks.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Playbooks not found"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # 3. Inject Domain Knowledge (The "RAG" approach)
    playbooks = load_playbooks()
    system_instructions = (
        f"You are a Cybersecurity Assistant. Use these playbooks for reference: {json.dumps(playbooks)}. "
        "Provide specific, actionable steps based on these playbooks. If the incident is not covered, "
        "provide general best practice guidance."
    )
    
    # Call the Groq API
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_instructions},
            {"role": "user", "content": request.prompt}
        ],
        model="llama3-8b-8192",
    )
    
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
    return {"status": "logged", "received_rating": payload.rating}

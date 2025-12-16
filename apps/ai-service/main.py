from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import shutil
import os
from typing import List

from models.speech_analysis import analyze_audio_fluency
from models.progress_predictor import predict_score_improvement
from models.chatbot import ask_chatbot, initialize_knowledge_base

app = FastAPI(title="Cognicare AI Service (Local/Free)")

# Ensure temp directory exists
os.makedirs("temp_uploads", exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Cognicare AI Service (Local Mode) Running"}

# --- Speech Analysis ---
@app.post("/analyze/speech")
async def analyze_speech(file: UploadFile = File(...), target_text: str = Form(None)):
    temp_path = f"temp_uploads/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    result = analyze_audio_fluency(temp_path, target_text)
    
    # Cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    return result

# --- Progress Prediction ---
class ProgressInput(BaseModel):
    recent_scores: List[int]
    days_active: int

@app.post("/predict/progress")
def predict_progress(data: ProgressInput):
    return predict_score_improvement(data.recent_scores, data.days_active)

# --- Chatbot ---
class ChatInput(BaseModel):
    question: str

@app.post("/chat")
def chat_with_ai(data: ChatInput):
    return ask_chatbot(data.question)

@app.post("/chat/index-document")
async def index_document(file: UploadFile = File(...)):
    temp_path = f"temp_uploads/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    result = initialize_knowledge_base(temp_path)
    return result

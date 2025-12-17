from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
from typing import List

# Add FFmpeg to PATH (for local Windows execution if installed via Winget)
ffmpeg_path = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages", "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe", "ffmpeg-8.0.1-full_build", "bin")
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] += os.pathsep + ffmpeg_path

from models.speech_analysis import analyze_audio_fluency
from models.progress_predictor import predict_score_improvement
from models.chatbot import ask_chatbot, initialize_knowledge_base
from models.video_analysis import video_analyzer
import requests
import tempfile

app = FastAPI(title="Cognicare AI Service (Local/Free)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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

# --- Video Analysis ---
import urllib.request

class VideoAnalysisInput(BaseModel):
    video_url: str

@app.post("/analyze/video-url")
async def analyze_video_url(data: VideoAnalysisInput):
    try:
        # Download the video to a temporary file
        print(f"Downloading video from: {data.video_url}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
            # Use urllib to download
            urllib.request.urlretrieve(data.video_url, temp_video.name)
            temp_video_path = temp_video.name
            
        print(f"Video saved to: {temp_video_path}")
        
        # Analyze the video
        result = await video_analyzer.analyze_video(temp_video_path)
        
        # Cleanup
        os.remove(temp_video_path)
        
        return {"analysis": result}
        
    except Exception as e:
        print(f"Error in /analyze/video-url: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Implementation - Free & Open Source Guide

This implementation uses **local, free, and open-source** tools as requested. No paid APIs are required.

## 1. Prerequisites (Crucial)

### A. Install Python
Ensure Python 3.10 or 3.11 is installed.

### B. Install Ollama (For Chatbot)
The Chatbot uses **Ollama** to run large language models locally.
1.  Download and install Ollama from [ollama.com](https://ollama.com).
2.  Open a terminal and run:
    ```bash
    ollama run llama3
    ```
    (Or `ollama run mistral` if your PC has less RAM). Keep this terminal open or ensure Ollama is running in the background.

### C. Install FFmpeg (For Speech Analysis)
OpenAI Whisper requires FFmpeg to process audio files.
*   **Windows**: 
    1.  Download from [ffmpeg.org](https://ffmpeg.org/download.html).
    2.  Extract the folder.
    3.  Add the `bin` folder to your System PATH environment variable.
    *   *Alternatively*, if you have `winget`: `winget install ffmpeg`

## 2. Setup

1.  Navigate to the directory:
    ```bash
    cd apps/ai-service
    ```

2.  Activate Virtual Environment:
    ```bash
    # Windows
    .venv\Scripts\activate
    ```

3.  Install Python Dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: This downloads PyTorch and other large libraries. It may take a while.*

## 3. Running the Service

Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The API will be available at: `http://localhost:8000`

## 4. Features & Endpoints

### A. Speech Therapy Assistant (Free / Local Whisper)
*   **Endpoint**: `POST /analyze/speech`
*   **Input**: Audio file (upload), Optional `target_text`.
*   **Logic**: Uses local `openai-whisper` model (base size) to transcribe audio. Calculates Words Per Minute (fluency) and compares with target text for accuracy.

### B. Progress Prediction (Free / Scikit-learn)
*   **Endpoint**: `POST /predict/progress`
*   **Input**: JSON `{ "recent_scores": [10, 20, 30], "days_active": 5 }`
*   **Logic**: Uses a simple Linear Regression model (trained locally) to predict the next score trend.

### C. Parenting Chatbot (Free / Ollama + LangChain)
*   **Endpoint**: `POST /chat`
*   **Input**: JSON `{ "question": "How do I help my child focus?" }`
*   **Logic**: Connects to your local Ollama instance (Llama 3).
*   **RAG (Document Search)**:
    *   Upload a PDF via `POST /chat/index-document`.
    *   The chatbot will search this document before answering questions.

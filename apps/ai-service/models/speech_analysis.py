import whisper
import os
import torch

# Load model once at startup (using 'base' for speed/cpu compatibility, 'small' or 'medium' for better accuracy)
# Check if CUDA is available
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading Whisper model on {device}...")
model = whisper.load_model("base", device=device)

def analyze_audio_fluency(file_path: str, target_text: str = None):
    """
    Transcribes audio and calculates fluency metrics.
    If target_text is provided, calculates pronunciation accuracy.
    """
    try:
        # Transcribe
        result = model.transcribe(file_path)
        transcribed_text = result["text"].strip()
        segments = result["segments"]

        # Calculate duration and speech rate
        duration = segments[-1]["end"] - segments[0]["start"] if segments else 0
        word_count = len(transcribed_text.split())
        words_per_minute = (word_count / duration) * 60 if duration > 0 else 0

        response = {
            "transcription": transcribed_text,
            "duration_seconds": round(duration, 2),
            "words_per_minute": round(words_per_minute, 2),
            "fluency_score": min(100, max(0, (words_per_minute / 150) * 100)) # Rough heuristic: 150 wpm is normal conversational
        }

        # If target text is provided, compare for accuracy (Pronunciation check)
        if target_text:
            from difflib import SequenceMatcher
            similarity = SequenceMatcher(None, transcribed_text.lower(), target_text.lower()).ratio()
            response["accuracy_score"] = round(similarity * 100, 2)
            response["target_text"] = target_text

        return response

    except Exception as e:
        return {"error": str(e)}

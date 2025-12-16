import numpy as np
from sklearn.linear_model import LinearRegression
import pickle
import os

MODEL_PATH = "models/progress_model.pkl"

def train_dummy_model():
    """
    Trains a simple linear regression model on dummy data if one doesn't exist.
    In a real app, you would train this on your database data.
    """
    # Dummy data: [days_practicing, games_played] -> [improvement_score]
    X = np.array([
        [1, 2], [2, 4], [3, 6], [4, 8], [5, 10], 
        [10, 20], [15, 30], [20, 40], [30, 60]
    ])
    y = np.array([5, 10, 15, 20, 25, 50, 65, 80, 95]) # Linear improvement

    model = LinearRegression()
    model.fit(X, y)
    
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    
    print("Dummy progress model trained and saved.")

def predict_score_improvement(recent_scores: list[int], days_active: int):
    """
    Predicts the next score based on recent history.
    """
    if not os.path.exists(MODEL_PATH):
        train_dummy_model()
    
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    
    # Feature engineering: Use average score and days active
    avg_score = sum(recent_scores) / len(recent_scores) if recent_scores else 0
    games_count = len(recent_scores)
    
    # Simple prediction based on trend
    # Input features must match training: [days_practicing, games_played]
    # This is a simplified example.
    prediction = model.predict([[days_active, games_count]])
    
    return {
        "current_avg": round(avg_score, 2),
        "predicted_improvement_score": round(prediction[0], 2),
        "trend": "upward" if prediction[0] > avg_score else "stable"
    }

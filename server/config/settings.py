"""
Configuration settings for the Agricultural ML API
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# Model paths
MODELS_DIR = BASE_DIR / "src" / "ml-models"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# Model file paths
CROP_MODEL_PATH = MODELS_DIR / "crop_recommendation_model.pkl"
CROP_SCALER_PATH = MODELS_DIR / "StandardScaler.pkl"
DISEASE_MODEL_PATH = MODELS_DIR / "trained_model.h5"
DISEASE_CLASSES_PATH = MODELS_DIR / "plant_disease.json"
YIELD_MODEL_PATH = MODELS_DIR / "dtr.pkl"
YIELD_PREPROCESSOR_PATH = MODELS_DIR / "preprocesser.pkl"

# Data file paths
FERTILIZER_DATA_PATH = DATA_DIR / "fertilizer.csv"
PLANT_DISEASE_DATA_PATH = DATA_DIR / "plant_disease_updated.json"

# API Configuration
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))

# Logging configuration
LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'INFO')
LOG_FILE = LOGS_DIR / "api.log"

# Crop mapping
CROP_CLASSES = {
    0: "apple", 1: "banana", 2: "blackgram", 3: "chickpea", 4: "coconut", 5: "coffee",
    6: "cotton", 7: "grapes", 8: "jute", 9: "kidneybeans", 10: "lentil", 11: "maize",
    12: "mango", 13: "mothbeans", 14: "mungbean", 15: "muskmelon", 16: "orange",
    17: "papaya", 18: "pigeonpeas", 19: "pomegranate", 20: "rice", 21: "watermelon"
}
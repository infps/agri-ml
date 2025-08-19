"""
Main Flask application for Agricultural ML API
"""
import logging
import os
from flask import Flask
from flask_cors import CORS
from pathlib import Path
import sys

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config.settings import DEBUG, HOST, PORT, LOGS_DIR, LOG_FILE
from src.utils.model_loader import ModelLoader
from src.api.routes import create_routes

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Configure logging
    setup_logging()
    
    # Initialize model loader
    model_loader = ModelLoader()
    print(model_loader.get_model_status())
    
    # Create routes
    create_routes(app, model_loader)
    
    return app

def setup_logging():
    """Setup logging configuration"""
    # Create logs directory if it doesn't exist
    LOGS_DIR.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler()
        ]
    )
    
    # Reduce tensorflow logging
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    logging.getLogger('tensorflow').setLevel(logging.ERROR)

if __name__ == "__main__":
    app = create_app()
    logging.info(f"Starting Agricultural ML API on {HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
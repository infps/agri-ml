"""
Model loading utilities
"""
import logging
import joblib
import tensorflow as tf
import json
from pathlib import Path
from config.settings import (
    CROP_MODEL_PATH, CROP_SCALER_PATH, DISEASE_MODEL_PATH, 
    DISEASE_CLASSES_PATH, YIELD_MODEL_PATH, YIELD_PREPROCESSOR_PATH
)

class ModelLoader:
    """Handles loading and managing ML models"""
    
    def __init__(self):
        self.models = {}
        self.load_all_models()
    
    def load_crop_models(self):
        """Load crop recommendation models"""
        try:
            self.models['crop_model'] = joblib.load(CROP_MODEL_PATH)
            self.models['crop_scaler'] = joblib.load(CROP_SCALER_PATH)
            logging.info("Crop recommendation models loaded successfully")
            return True
        except Exception as e:
            logging.error(f"Error loading crop models: {e}")
            self.models['crop_model'] = None
            self.models['crop_scaler'] = None
            return False
    
    def load_disease_models(self):
        """Load disease detection models"""
        try:
            # Try loading with compile=False first to avoid shape issues
            model = tf.keras.models.load_model(DISEASE_MODEL_PATH, compile=False)
            
            # Check if input shape needs fixing
            if model.input.shape[-1] == 1:
                logging.info("Fixing model input shape from grayscale to RGB")
                # Create new input layer with RGB shape
                new_input = tf.keras.layers.Input(shape=(161, 161, 3), name='input_layer')
                
                # Convert grayscale to RGB by repeating channels
                rgb_input = tf.keras.layers.Lambda(
                    lambda x: tf.repeat(x, 3, axis=-1), 
                    name='grayscale_to_rgb'
                )(new_input)
                
                # Get the output from the original model starting from the second layer
                x = rgb_input
                for i, layer in enumerate(model.layers[1:]):
                    if hasattr(layer, '__call__'):
                        x = layer(x)
                
                # Create new model with fixed input
                fixed_model = tf.keras.Model(inputs=new_input, outputs=x)
                self.models['disease_model'] = fixed_model
            else:
                self.models['disease_model'] = model
            
            with open(DISEASE_CLASSES_PATH, "r") as f:
                self.models['disease_classes'] = json.load(f)
            logging.info("Disease detection model loaded successfully")
            return True
        except Exception as e:
            logging.error(f"Error loading disease model: {e}")
            # Fallback: try loading with compile=False only
            try:
                self.models['disease_model'] = tf.keras.models.load_model(DISEASE_MODEL_PATH, compile=False)
                with open(DISEASE_CLASSES_PATH, "r") as f:
                    self.models['disease_classes'] = json.load(f)
                logging.info("Disease detection model loaded with compile=False fallback")
                return True
            except Exception as fallback_e:
                logging.error(f"Fallback loading also failed: {fallback_e}")
                self.models['disease_model'] = None
                self.models['disease_classes'] = None
                return False
    
    def load_yield_models(self):
        """Load yield prediction models"""
        try:
            self.models['yield_model'] = joblib.load(YIELD_MODEL_PATH)
            self.models['yield_preprocessor'] = joblib.load(YIELD_PREPROCESSOR_PATH)
            logging.info("Yield prediction models loaded successfully")
            return True
        except Exception as e:
            logging.error(f"Error loading yield models: {e}")
            self.models['yield_model'] = None
            self.models['yield_preprocessor'] = None
            return False
    
    def load_all_models(self):
        """Load all models"""
        self.load_crop_models()
        self.load_disease_models()
        self.load_yield_models()
    
    def get_model(self, model_name):
        """Get a specific model"""
        return self.models.get(model_name)
    
    def is_model_available(self, model_name):
        """Check if a model is available"""
        return self.models.get(model_name) is not None
    
    def get_model_status(self):
        """Get status of all models"""
        return {
            "crop_recommendation": self.is_model_available('crop_model'),
            "disease_detection": self.is_model_available('disease_model'),
            "yield_prediction": self.is_model_available('yield_model')
        }
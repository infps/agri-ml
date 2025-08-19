"""
API route handlers
"""
import logging
import numpy as np
import pandas as pd
import json
import os
from flask import request, jsonify
from PIL import Image
import io
import tensorflow as tf
from markupsafe import Markup
from config.settings import CROP_CLASSES, FERTILIZER_DATA_PATH, PLANT_DISEASE_DATA_PATH

def create_routes(app, model_loader):
    """Create all API routes"""
    
    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "message": "Agricultural ML API",
            "version": "1.0.0",
            "endpoints": {
                "/predict-crop": "POST - Crop recommendation",
                "/predict-fertilizer": "POST - Fertilizer recommendation", 
                "/predict-disease": "POST - Disease detection",
                "/predict-yield": "POST - Yield prediction",
                "/health": "GET - Health check"
            }
        })

    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "models": model_loader.get_model_status()
        })

    @app.route("/predict-crop", methods=["POST"])
    def predict_crop():
        try:
            # Validate input
            required_fields = ['Nitrogen', 'Phosporus', 'Potassium', 'Temperature', 'Humidity', 'pH', 'Rainfall']
            for field in required_fields:
                if field not in request.form:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            # Extract features
            N = float(request.form['Nitrogen'])
            P = float(request.form['Phosporus'])
            K = float(request.form['Potassium'])
            temp = float(request.form['Temperature'])
            humidity = float(request.form['Humidity'])
            ph = float(request.form['pH'])
            rainfall = float(request.form['Rainfall'])

            feature_list = [N, P, K, temp, humidity, ph, rainfall]
            single_pred = np.array(feature_list).reshape(1, -1)

            # Check if models are available
            if not model_loader.is_model_available('crop_model'):
                return jsonify({"error": "Crop recommendation model not available"}), 503
            
            # Make prediction
            scaler = model_loader.get_model('crop_scaler')
            model = model_loader.get_model('crop_model')
            
            sc_mx_features = scaler.transform(single_pred)
            prediction = model.predict(sc_mx_features)

            crop = CROP_CLASSES.get(prediction[0], "Unknown")
            result = f"{crop.capitalize()} is the best crop to be cultivated."
            
            return jsonify({
                "prediction": crop,
                "message": result,
                "confidence": "High",
                "input_features": {
                    "nitrogen": N, "phosphorus": P, "potassium": K,
                    "temperature": temp, "humidity": humidity, "ph": ph, "rainfall": rainfall
                }
            })
            
        except ValueError as e:
            return jsonify({"error": f"Invalid input data: {str(e)}"}), 400
        except Exception as e:
            logging.error(f"Error in crop prediction: {e}")
            return jsonify({"error": "Internal server error"}), 500

    @app.route('/predict-fertilizer', methods=['POST'])
    def predict_fertilizer():
        try:
            # Validate input
            required_fields = ['cropname', 'nitrogen', 'phosphorous', 'pottasium']
            for field in required_fields:
                if field not in request.form:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            crop_name = str(request.form['cropname'])
            N = int(request.form['nitrogen'])
            P = int(request.form['phosphorous'])
            K = int(request.form['pottasium'])

            # Load fertilizer data
            df = pd.read_csv(FERTILIZER_DATA_PATH)
            
            if crop_name not in df['Crop'].values:
                return jsonify({"error": f"Crop '{crop_name}' not found in database"}), 400
                
            nr, pr, kr = df[df['Crop'] == crop_name][['N', 'P', 'K']].iloc[0]

            n, p, k = nr - N, pr - P, kr - K
            temp = {abs(n): "N", abs(p): "P", abs(k): "K"}
            max_value = temp[max(temp.keys())]

            if max_value == "N":
                key = 'NHigh' if n < 0 else "Nlow"
            elif max_value == "P":
                key = 'PHigh' if p < 0 else "Plow"
            else:
                key = 'KHigh' if k < 0 else "Klow"

            # Get fertilizer recommendations
            recommendations = get_fertilizer_recommendations()
            response = recommendations.get(key, "No recommendation available")
            
            return jsonify({
                "recommendation": response,
                "nutrient_analysis": {
                    "required_N": nr, "current_N": N, "N_diff": n,
                    "required_P": pr, "current_P": P, "P_diff": p,
                    "required_K": kr, "current_K": K, "K_diff": k
                },
                "primary_deficiency": max_value,
                "crop": crop_name
            })
            
        except Exception as e:
            logging.error(f"Error in fertilizer prediction: {e}")
            return jsonify({"error": "Error processing fertilizer recommendation"}), 500

    @app.route('/predict-disease', methods=['POST'])
    def predict_disease():
        if 'image' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        try:
            img_bytes = file.read()
            result_index = model_prediction(img_bytes, model_loader)
            
            class_names = [
                'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
                'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 
                'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 
                'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 
                'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 
                'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
                'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 
                'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 
                'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 
                'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 
                'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 
                'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 
                'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
                'Tomato___healthy'
            ]
            
            predicted_class = class_names[result_index]

            # Load disease data and match with predicted class
            disease_info = load_disease_info(predicted_class)
            
            # Extract clean disease name
            clean_disease_name = extract_disease_name(predicted_class)
            
            response = {
                "prediction": predicted_class,
                "disease": clean_disease_name,
                "class_index": int(result_index),
                "total_classes": len(class_names)
            }
            
            # Add detailed disease info if found in database
            if disease_info:
                response.update({
                    "cause": disease_info["cause"],
                    "cure": disease_info["cure"],
                    "html": disease_info.get("html", "")
                })
            
            return jsonify(response)
            
        except Exception as e:
            logging.error(f"Error in disease prediction: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route("/predict-yield", methods=["POST"])
    def predict_yield():
        try:
            # Validate input
            required_fields = ['Year', 'average_rain_fall_mm_per_year', 'pesticides_tonnes', 'avg_temp', 'Area', 'Item']
            for field in required_fields:
                if field not in request.form:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            Year = int(request.form['Year'])
            rainfall = float(request.form['average_rain_fall_mm_per_year'])
            pesticides = float(request.form['pesticides_tonnes'])
            avg_temp = float(request.form['avg_temp'])
            Area = request.form['Area']
            Item = request.form['Item']

            if not model_loader.is_model_available('yield_model'):
                return jsonify({"error": "Yield prediction model not available"}), 503
            
            # Make prediction
            features = np.array([[Year, rainfall, pesticides, avg_temp, Area, Item]], dtype=object)
            preprocessor = model_loader.get_model('yield_preprocessor')
            model = model_loader.get_model('yield_model')
            
            transformed = preprocessor.transform(features)
            prediction = model.predict(transformed)[0]

            return jsonify({
                "prediction": float(prediction),
                "unit": "tonnes per hectare",
                "input_features": {
                    "year": Year, "rainfall": rainfall, "pesticides": pesticides,
                    "avg_temperature": avg_temp, "area": Area, "item": Item
                }
            })
            
        except Exception as e:
            logging.error(f"Error in yield prediction: {e}")
            return jsonify({"error": "Error processing yield prediction"}), 500

def model_prediction(image_bytes, model_loader):
    """Predict disease from image bytes"""
    image = Image.open(io.BytesIO(image_bytes)).resize((128, 128))
    input_arr = tf.keras.preprocessing.image.img_to_array(image)
    input_arr = np.expand_dims(input_arr, axis=0)  # batch dimension
    
    # Load the disease model
    model = model_loader.get_model('disease_model')
    predictions = model.predict(input_arr)
    return np.argmax(predictions)

def get_fertilizer_recommendations():
    """Get fertilizer recommendation dictionary"""
    return {
        'NHigh': """The N value of soil is high and might give rise to weeds.
        Please consider the following suggestions:
        1. Manure – adding manure is one of the simplest ways to amend your soil with nitrogen.
        2. Coffee grounds – use your morning addiction to feed your gardening habit!
        3. Plant nitrogen fixing plants – planting vegetables in Fabaceae family like peas, beans and soybeans.
        4. Plant 'green manure' crops like cabbage, corn and broccoli.
        5. Use mulch (wet grass) while growing crops.""",

        'Nlow': """The N value of your soil is low.
        Please consider the following suggestions:
        1. Add sawdust or fine woodchips to your soil.
        2. Plant heavy nitrogen feeding plants – tomatoes, corn, broccoli, cabbage and spinach.
        3. Water – soaking your soil with water will help leach the nitrogen deeper.
        4. Add composted manure to the soil.
        5. Plant Nitrogen fixing plants like peas or beans.
        6. Use NPK fertilizers with high N value.""",

        'PHigh': """The P value of your soil is high.
        Please consider the following suggestions:
        1. Avoid adding manure – manure contains high levels of phosphorous.
        2. Use only phosphorus-free fertilizer.
        3. Water your soil liberally to drive phosphorous out.
        4. Plant nitrogen fixing vegetables to increase nitrogen without increasing phosphorous.
        5. Use crop rotations to decrease high phosphorous levels.""",

        'Plow': """The P value of your soil is low.
        Please consider the following suggestions:
        1. Bone meal – a fast acting source made from ground animal bones.
        2. Rock phosphate – a slower acting source.
        3. Phosphorus Fertilizers – applying fertilizer with high phosphorous content.
        4. Organic compost – adding quality organic compost.
        5. Manure – excellent source of phosphorous.
        6. Ensure proper soil pH – having pH in 6.0 to 7.0 range.""",

        'KHigh': """The K value of your soil is high.
        Please consider the following suggestions:
        1. Loosen the soil deeply and water thoroughly to dissolve water-soluble potassium.
        2. Remove as many rocks as possible from soil.
        3. Stop applying potassium-rich commercial fertilizer.
        4. Mix crushed eggshells, seashells, wood ash to add calcium.
        5. Use NPK fertilizers with low K levels.""",

        'Klow': """The K value of your soil is low.
        Please consider the following suggestions:
        1. Mix in muricate of potash or sulphate of potash.
        2. Try kelp meal or seaweed.
        3. Try Sul-Po-Mag.
        4. Bury banana peels an inch below the soil surface.
        5. Use Potash fertilizers since they contain high potassium values."""
    }

def load_disease_info(predicted_class):
    """Load disease information from JSON file and match with predicted class"""
    try:
        # Convert class name format to match JSON (handle different naming conventions)
        normalized_class = normalize_class_name(predicted_class)
        
        # Load disease data using the configured path
        with open(PLANT_DISEASE_DATA_PATH, 'r') as f:
            disease_data = json.load(f)
        
        # Find matching disease info
        for disease in disease_data:
            if normalize_class_name(disease['name']) == normalized_class:
                return disease
        
        # If no exact match found, return None
        return None
    except Exception as e:
        logging.error(f"Error loading disease info: {e}")
        return None

def normalize_class_name(class_name):
    """Normalize class names for better matching"""
    # Handle different naming conventions between model output and JSON
    replacements = {
        'Cherry_(including_sour)___Powdery_mildew': 'Cherry___Powdery_mildew',
        'Cherry_(including_sour)___healthy': 'Cherry___healthy',
        'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': 'Corn___Cercospora_leaf_spot Gray_leaf_spot',
        'Corn_(maize)___Common_rust_': 'Corn___Common_rust',
        'Corn_(maize)___Northern_Leaf_Blight': 'Corn___Northern_Leaf_Blight',
        'Corn_(maize)___healthy': 'Corn___healthy',
        'Pepper,_bell___Bacterial_spot': 'Pepper,_bell___Bacterial_spot',
        'Pepper,_bell___healthy': 'Pepper,_bell___healthy'
    }
    
    normalized = replacements.get(class_name, class_name)
    return normalized

def extract_disease_name(class_name):
    """Extract clean disease name from class name (remove fruit/plant prefix)"""
    # Split by ___ and take the disease part
    if '___' in class_name:
        parts = class_name.split('___')
        if len(parts) >= 2:
            disease_name = parts[1]
            # Clean up common patterns
            disease_name = disease_name.replace('_', ' ').strip()
            # Handle special cases
            if disease_name.lower() == 'healthy':
                plant_name = parts[0].replace('_', ' ').replace('(', '').replace(')', '').replace(',', '').strip()
                return f"Healthy {plant_name}"
            return disease_name
    
    # Fallback: just clean up underscores
    return class_name.replace('_', ' ').strip()
# Agricultural ML API

A comprehensive machine learning API for agricultural predictions including crop recommendations, disease detection, fertilizer suggestions, and yield predictions.

## Features

- 🌾 **Crop Recommendation**: Get optimal crop suggestions based on soil and climate conditions
- 🦠 **Disease Detection**: Identify plant diseases from leaf images
- 🌱 **Fertilizer Recommendation**: Get soil nutrient recommendations
- 📊 **Yield Prediction**: Predict crop yields based on various factors

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py          # API route handlers
│   ├── models/                # ML model files
│   │   ├── crop_recommendation_model.pkl
│   │   ├── StandardScaler.pkl
│   │   ├── plant_disease.keras
│   │   ├── plant_disease.json
│   │   ├── dtr.pkl
│   │   └── preprocesser.pkl
│   ├── utils/
│   │   ├── __init__.py
│   │   └── model_loader.py    # Model loading utilities
│   └── app.py                 # Main Flask application
├── config/
│   └── settings.py            # Configuration settings
├── data/
│   └── fertilizer.csv         # Fertilizer recommendation data
├── tests/                     # Test files
├── logs/                      # Application logs
├── blob/                      # Original project files (backup)
├── models/                    # Original models (backup)
├── venv/                      # Virtual environment
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python src/app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health` - Check API health and model status

### Crop Recommendation
- **POST** `/predict-crop`
- **Body**: Form data with:
  - `Nitrogen`: Nitrogen content in soil
  - `Phosporus`: Phosphorus content in soil  
  - `Potassium`: Potassium content in soil
  - `Temperature`: Temperature in Celsius
  - `Humidity`: Relative humidity percentage
  - `pH`: pH value of soil
  - `Rainfall`: Rainfall in mm

**Example Request:**
```bash
curl -X POST http://localhost:5000/predict-crop \
  -F "Nitrogen=90" \
  -F "Phosporus=42" \
  -F "Potassium=43" \
  -F "Temperature=20.87" \
  -F "Humidity=82.00" \
  -F "pH=6.50" \
  -F "Rainfall=202.93"
```

### Fertilizer Recommendation
- **POST** `/predict-fertilizer`
- **Body**: Form data with:
  - `cropname`: Name of the crop
  - `nitrogen`: Current nitrogen content
  - `phosphorous`: Current phosphorus content
  - `pottasium`: Current potassium content

### Disease Detection
- **POST** `/predict-disease`
- **Body**: Multipart form with:
  - `image`: Plant leaf image file

### Yield Prediction
- **POST** `/predict-yield`
- **Body**: Form data with:
  - `Year`: Year of cultivation
  - `average_rain_fall_mm_per_year`: Average rainfall
  - `pesticides_tonnes`: Pesticides used in tonnes
  - `avg_temp`: Average temperature
  - `Area`: Cultivation area
  - `Item`: Crop type

## Configuration

Edit `config/settings.py` to customize:
- Model file paths
- API settings (host, port, debug mode)
- Logging configuration
- Crop class mappings

## Environment Variables

- `DEBUG`: Enable/disable debug mode (default: True)
- `HOST`: API host (default: 0.0.0.0)
- `PORT`: API port (default: 5000)
- `LOGGING_LEVEL`: Logging level (default: INFO)

## Model Information

### Crop Recommendation
- **Algorithm**: Random Forest/SVM Classifier
- **Features**: N, P, K, Temperature, Humidity, pH, Rainfall
- **Output**: 22 crop types

### Disease Detection
- **Algorithm**: Convolutional Neural Network (CNN)
- **Input**: Plant leaf images (160x160 pixels)
- **Output**: Disease classification with confidence

### Fertilizer Recommendation
- **Algorithm**: Rule-based system
- **Input**: Crop type and current NPK values
- **Output**: Fertilizer recommendations

### Yield Prediction
- **Algorithm**: Decision Tree Regressor
- **Features**: Year, Rainfall, Pesticides, Temperature, Area, Item
- **Output**: Yield in tonnes per hectare

## Development

### Adding New Features
1. Create new route handlers in `src/api/routes.py`
2. Add model loading logic in `src/utils/model_loader.py`
3. Update configuration in `config/settings.py`

### Testing
```bash
# Run tests (when implemented)
python -m pytest tests/
```

### Production Deployment

1. **Using Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 src.app:create_app()
   ```

2. **Using Docker** (create Dockerfile)
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 5000
   CMD ["python", "src/app.py"]
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## Changelog

### v1.0.0
- Initial release
- Crop recommendation API
- Disease detection API
- Fertilizer recommendation API
- Yield prediction API
- Structured project organization
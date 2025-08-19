const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Types
export interface CropRecommendationRequest {
  Nitrogen: number;
  Phosporus: number;
  Potassium: number;
  Temperature: number;
  Humidity: number;
  pH: number;
  Rainfall: number;
}

export interface CropRecommendationResponse {
  prediction: string;
  message: string;
  confidence: string;
  input_features: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

export interface FertilizerRecommendationRequest {
  cropname: string;
  nitrogen: number;
  phosphorous: number;
  pottasium: number;
}

export interface FertilizerRecommendationResponse {
  recommendation: string;
  nutrient_analysis: {
    required_N: number;
    current_N: number;
    N_diff: number;
    required_P: number;
    current_P: number;
    P_diff: number;
    required_K: number;
    current_K: number;
    K_diff: number;
  };
  primary_deficiency: string;
  crop: string;
}

export interface DiseaseDetectionResponse {
  prediction: string;
  disease: string;
  cause?: string;
  cure?: string;
  class_index: number;
  total_classes: number;
  html?: string;
}

export interface YieldPredictionRequest {
  Year: number;
  average_rain_fall_mm_per_year: number;
  pesticides_tonnes: number;
  avg_temp: number;
  Area: string;
  Item: string;
}

export interface YieldPredictionResponse {
  prediction: number;
  unit: string;
  input_features: {
    year: number;
    rainfall: number;
    pesticides: number;
    avg_temperature: number;
    area: number;
    item: string;
  };
}

export interface ApiError {
  error: string;
}

export type ApiResponse<T> = T | ApiError;

// API Functions
async function apiCall<T>(
  endpoint: string,
  data: Record<string, any> | File
): Promise<ApiResponse<T>> {
  try {
    const formData = new FormData();

    if (data instanceof File) {
      formData.append("image", data);
    } else {
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, String(value));
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    return { error: "Network error or server unavailable" };
  }
}

export const getCropRecommendation = (
  data: CropRecommendationRequest
): Promise<ApiResponse<CropRecommendationResponse>> =>
  apiCall<CropRecommendationResponse>("/predict-crop", data);

export const getFertilizerRecommendation = (
  data: FertilizerRecommendationRequest
): Promise<ApiResponse<FertilizerRecommendationResponse>> =>
  apiCall<FertilizerRecommendationResponse>("/predict-fertilizer", data);

export const detectDisease = (
  imageFile: File
): Promise<ApiResponse<DiseaseDetectionResponse>> =>
  apiCall<DiseaseDetectionResponse>("/predict-disease", imageFile);

export const predictYield = (
  data: YieldPredictionRequest
): Promise<ApiResponse<YieldPredictionResponse>> =>
  apiCall<YieldPredictionResponse>("/predict-yield", data);

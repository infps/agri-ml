"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { predictYield } from "@/services/api";
import { Label } from "@/components/ui/label";

interface YieldFormData {
  year: string;
  rainfall: string;
  pesticides: string;
  temperature: string;
  area: string;
  crop: string;
}

interface YieldResponse {
  prediction?: number;
  unit?: string;
  input_features?: {
    year: number;
    rainfall: number;
    pesticides: number;
    avg_temperature: number;
    area: number;
    item: string;
  };
  error?: string;
}

export default function YieldPrediction() {
  const [formData, setFormData] = useState<YieldFormData>({
    year: "",
    rainfall: "",
    pesticides: "",
    temperature: "",
    area: "",
    crop: "",
  });
  const [response, setResponse] = useState<YieldResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof YieldFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { year, rainfall, pesticides, temperature, area, crop } = formData;

      console.log(formData);

      if (!year) {
        setResponse({ error: "Missing required field: Year" });
        return;
      }

      if (!rainfall || !pesticides || !temperature || !area || !crop) {
        setResponse({
          error: "Missing required field: Please fill all fields",
        });
        return;
      }

      const requestData = {
        Year: parseInt(year),
        average_rain_fall_mm_per_year: parseFloat(rainfall),
        pesticides_tonnes: parseFloat(pesticides),
        avg_temp: parseFloat(temperature),
        Area: area,
        Item: crop,
      };

      const result = await predictYield(requestData);

      if ("error" in result) {
        setResponse({ error: result.error });
      } else {
        setResponse(result);
      }
    } catch (error) {
      setResponse({ error: "Failed to predict yield. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-scree p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4 w-10 h-10 p-0">
              ←
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-900 uppercase mb-2">
            YIELD PREDICTION
          </h1>
          <p className="text-gray-600">
            Predict crop yields based on environmental and agricultural factors
          </p>
        </div>

        <Card className="bg-white shadow-2xl">
          <CardHeader>
            <CardTitle>Agricultural & Environmental Data</CardTitle>
            <CardDescription>
              Provide information about your farming conditions to predict crop
              yield
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Year
                  </Label>
                  <Input
                    type="number"
                    max="2015"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    placeholder="2010"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Crop
                  </Label>
                  <Input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => handleInputChange("crop", e.target.value)}
                    placeholder="Rice, Wheat, Maize"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Rainfall
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.rainfall}
                    onChange={(e) =>
                      handleInputChange("rainfall", e.target.value)
                    }
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Pesticides
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.pesticides}
                    onChange={(e) =>
                      handleInputChange("pesticides", e.target.value)
                    }
                    placeholder="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Temperature
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) =>
                      handleInputChange("temperature", e.target.value)
                    }
                    placeholder="25.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Area
                  </Label>
                  <Input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="India"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-900 hover:bg-green-950 font-semibold uppercase cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Predicting Yield..." : "Predict Yield"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {response && (
          <Card className="mt-6 bg-white shadow-2xl">
            <CardHeader>
              <CardTitle
                className={response.error ? "text-red-600" : "text-green-600"}
              >
                {response.error ? "Error" : "Yield Prediction Result"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response.error ? (
                <p className="text-red-600">{response.error}</p>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="text-3xl font-bold text-green-800 mb-1">
                      {response.prediction?.toLocaleString()} {response.unit}
                    </h3>
                    <p className="text-green-600">
                      Predicted yield for your farm
                    </p>
                  </div>

                  {response.input_features && (
                    <div>
                      <h4 className="font-medium mb-3">Input Summary:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Farm Details
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Crop:</span>
                              <span className="font-medium">
                                {response.input_features.item}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Year:</span>
                              <span className="font-medium">
                                {response.input_features.year}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Area:</span>
                              <span className="font-medium">
                                {response.input_features.area} ha
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Environmental Conditions
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Rainfall:</span>
                              <span className="font-medium">
                                {response.input_features.rainfall} mm
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Temperature:</span>
                              <span className="font-medium">
                                {response.input_features.avg_temperature}°C
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pesticides:</span>
                              <span className="font-medium">
                                {response.input_features.pesticides} tonnes
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> This prediction is based on
                      historical data and environmental factors. Actual yields
                      may vary due to unforeseen circumstances, farming
                      practices, and local conditions.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

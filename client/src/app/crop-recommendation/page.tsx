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
import { getCropRecommendation } from "@/services/api";
import { Label } from "@/components/ui/label";

interface CropFormData {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  ph: string;
  rainfall: string;
}

interface CropResponse {
  prediction?: string;
  message?: string;
  confidence?: string;
  input_features?: Record<string, number>;
  error?: string;
}

export default function CropRecommendation() {
  const [formData, setFormData] = useState<CropFormData>({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });
  const [response, setResponse] = useState<CropResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof CropFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const hasEmptyFields = Object.values(formData).some(
        (value) => value.trim() === ""
      );

      if (hasEmptyFields) {
        setResponse({
          error: "Missing required field: Please fill all fields",
        });
        return;
      }

      const requestData = {
        Nitrogen: parseFloat(formData.nitrogen),
        Phosporus: parseFloat(formData.phosphorus),
        Potassium: parseFloat(formData.potassium),
        Temperature: parseFloat(formData.temperature),
        Humidity: parseFloat(formData.humidity),
        pH: parseFloat(formData.ph),
        Rainfall: parseFloat(formData.rainfall),
      };

      const result = await getCropRecommendation(requestData);

      if ("error" in result) {
        setResponse({ error: result.error });
      } else {
        setResponse(result);
      }
    } catch (error) {
      setResponse({ error: "Failed to get recommendation. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <Link href="/">
              <Button variant="outline" className="mb-6 border w-10 h-10 p-0">
                ←
              </Button>
            </Link>
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-green-900 uppercase">
                  CROP RECOMMENDATION
                </h1>
              </div>
              <p className="text-slate-600 text-lg max-w-xl mx-auto">
                Enter your soil and environmental conditions to receive
                AI-powered crop recommendations
              </p>
            </div>
          </div>

          <Card className="bg-white backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl text-slate-800">
                Soil & Environmental Data
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Please provide the following information about your soil and
                environmental conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {/* <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Nitrogen (ppm)
                    </label> */}
                    <Label className="font-semibold text-green-950/50">
                      Nitrogen
                    </Label>
                    <Input
                      type="number"
                      value={formData.nitrogen}
                      onChange={(e) =>
                        handleInputChange("nitrogen", e.target.value)
                      }
                      placeholder="90"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-green-950/50">
                      Phosphorus
                    </Label>
                    <Input
                      type="number"
                      value={formData.phosphorus}
                      onChange={(e) =>
                        handleInputChange("phosphorus", e.target.value)
                      }
                      placeholder="42"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-green-950/50">
                      Potassium
                    </Label>
                    <Input
                      type="number"
                      value={formData.potassium}
                      onChange={(e) =>
                        handleInputChange("potassium", e.target.value)
                      }
                      placeholder="43"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
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
                      placeholder="20.8"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-green-950/50">
                      Humidity
                    </Label>
                    <Input
                      type="number"
                      value={formData.humidity}
                      onChange={(e) =>
                        handleInputChange("humidity", e.target.value)
                      }
                      placeholder="82"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-green-950/50">
                      pH
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.ph}
                      onChange={(e) => handleInputChange("ph", e.target.value)}
                      placeholder="6.5"
                      className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-green-950/50">
                    Rainfall
                  </Label>
                  <Input
                    type="number"
                    value={formData.rainfall}
                    onChange={(e) =>
                      handleInputChange("rainfall", e.target.value)
                    }
                    placeholder="202"
                    className="h-12 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-900 cursor-pointer hover:bg-green-950 hover:shadow-lg text-white border-0 h-14 text-lg transition-all duration-300 font-semibold uppercase"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Getting Recommendation...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Get Recommendation
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {response && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle
                  className={response.error ? "text-red-600" : "text-green-600"}
                >
                  {response.error ? "Error" : "Recommendation Result"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response.error ? (
                  <p className="text-red-600">{response.error}</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Recommended Crop: {response.prediction}
                      </h3>
                      <p className="text-gray-600 mt-1">{response.message}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Confidence: {response.confidence}
                      </p>
                    </div>
                    {response.input_features && (
                      <div>
                        <h4 className="font-medium mb-2">Input Summary:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(response.input_features).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span>{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

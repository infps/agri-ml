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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { getFertilizerRecommendation } from "@/services/api";
import { Label } from "@/components/ui/label";

interface FertilizerFormData {
  crop: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
}

interface FertilizerResponse {
  recommendation?: string;
  nutrient_analysis?: {
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
  primary_deficiency?: string;
  crop?: string;
  error?: string;
}

const crops = [
  "rice",
  "maize",
  "chickpea",
  "kidneybeans",
  "pigeonpeas",
  "mothbeans",
  "mungbean",
  "blackgram",
  "lentil",
  "pomegranate",
  "banana",
  "mango",
  "grapes",
  "watermelon",
  "muskmelon",
  "apple",
  "orange",
  "papaya",
  "coconut",
  "cotton",
  "jute",
  "coffee",
];

export default function FertilizerGuide() {
  const [formData, setFormData] = useState<FertilizerFormData>({
    crop: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  });
  const [response, setResponse] = useState<FertilizerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    field: keyof FertilizerFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { crop, nitrogen, phosphorus, potassium } = formData;

      if (!crop) {
        setResponse({ error: "Missing required field: cropname" });
        return;
      }

      if (!nitrogen || !phosphorus || !potassium) {
        setResponse({
          error: "Missing required field: Please fill all nutrient values",
        });
        return;
      }

      const requestData = {
        cropname: crop,
        nitrogen: parseInt(nitrogen),
        phosphorous: parseInt(phosphorus),
        pottasium: parseInt(potassium),
      };

      const result = await getFertilizerRecommendation(requestData);

      if ("error" in result) {
        setResponse({ error: result.error });
      } else {
        setResponse(result);
      }
    } catch (error) {
      setResponse({
        error: "Failed to get fertilizer recommendation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4 w-10 h-10 p-0">
              ←
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-green-900 uppercase mb-2">
            FERTILIZER GUIDE
          </h1>
          <p className="text-gray-600">
            Get personalized fertilizer recommendations for your crops
          </p>
        </div>

        <Card className="bg-white shadow-2xl">
          <CardHeader>
            <CardTitle>Crop & Soil Nutrient Data</CardTitle>
            <CardDescription>
              Provide your crop type and current soil nutrient levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="font-semibold text-green-950/50">Crop</Label>
                <Select
                  value={formData.crop}
                  onValueChange={(value) => handleInputChange("crop", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem
                        key={crop}
                        value={crop}
                        className="capitalize"
                      >
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-900 hover:bg-green-950 font-semibold uppercase"
                disabled={isLoading}
              >
                {isLoading ? "Getting Advice..." : "Get Advice"}
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
                {response.error ? "Error" : "Fertilizer Recommendation"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response.error ? (
                <p className="text-red-600">{response.error}</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Recommendation for {response.crop}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {response.recommendation}
                    </p>
                    {response.primary_deficiency && (
                      <p className="text-sm text-orange-600 mt-2">
                        Primary deficiency: {response.primary_deficiency}
                      </p>
                    )}
                  </div>

                  {response.nutrient_analysis && (
                    <div>
                      <h4 className="font-medium mb-3">Nutrient Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                          <h5 className="font-medium text-blue-800">
                            Nitrogen (N)
                          </h5>
                          <p className="text-sm">
                            Required: {response.nutrient_analysis.required_N}
                          </p>
                          <p className="text-sm">
                            Current: {response.nutrient_analysis.current_N}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              response.nutrient_analysis.N_diff < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            Difference:{" "}
                            {response.nutrient_analysis.N_diff > 0 ? "+" : ""}
                            {response.nutrient_analysis.N_diff}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <h5 className="font-medium text-purple-800">
                            Phosphorus (P)
                          </h5>
                          <p className="text-sm">
                            Required: {response.nutrient_analysis.required_P}
                          </p>
                          <p className="text-sm">
                            Current: {response.nutrient_analysis.current_P}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              response.nutrient_analysis.P_diff < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            Difference:{" "}
                            {response.nutrient_analysis.P_diff > 0 ? "+" : ""}
                            {response.nutrient_analysis.P_diff}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <h5 className="font-medium text-orange-800">
                            Potassium (K)
                          </h5>
                          <p className="text-sm">
                            Required: {response.nutrient_analysis.required_K}
                          </p>
                          <p className="text-sm">
                            Current: {response.nutrient_analysis.current_K}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              response.nutrient_analysis.K_diff < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            Difference:{" "}
                            {response.nutrient_analysis.K_diff > 0 ? "+" : ""}
                            {response.nutrient_analysis.K_diff}
                          </p>
                        </div>
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
  );
}

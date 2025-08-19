"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { detectDisease } from "@/services/api";

interface DiseaseResponse {
  prediction?: string;
  disease?: string;
  cause?: string;
  cure?: string;
  class_index?: number;
  total_classes?: number;
  html?: string;
  error?: string;
}

export default function DiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<DiseaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setResponse(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setResponse({ error: "No file uploaded" });
      return;
    }

    setIsLoading(true);

    try {
      const result = await detectDisease(selectedFile);

      if ("error" in result) {
        setResponse({ error: result.error });
      } else {
        setResponse(result);
      }
    } catch (error) {
      setResponse({ error: "Failed to analyze disease. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
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
            DISEASE DETECTION
          </h1>
          <p className="text-gray-600">
            Upload an image of your plant to detect diseases
          </p>
        </div>

        <Card className="bg-white shadow-2xl">
          <CardHeader>
            <CardTitle>Upload Plant Image</CardTitle>
            <CardDescription>
              Drag and drop an image or browse to select from your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? "border-green-400 bg-green-50"
                    : selectedFile
                    ? "border-green-300 bg-green-25"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-700">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleBrowseClick}
                      className="mt-2"
                    >
                      Choose Different Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Drag & Drop your image here
                      </p>
                      <p className="text-gray-500">or</p>
                      <Button
                        variant="outline"
                        onClick={handleBrowseClick}
                        className="mt-2"
                      >
                        Browse Files
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supports: JPG, PNG, GIF (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-green-900 hover:bg-green-950 font-semibold uppercase"
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? "Analyzing Disease..." : "Analyze Disease"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {response && (
          <Card className="mt-6 bg-white shadow-2xl">
            <CardHeader>
              <CardTitle
                className={response.error ? "text-red-600" : "text-green-600"}
              >
                {response.error ? "Error" : "Disease Analysis Result"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {response.error ? (
                <p className="text-red-600">{response.error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-blue-800 mb-1">
                      {response.disease || "Unknown Disease"}
                    </h3>
                    {response.prediction && (
                      <p className="text-xs text-blue-500">
                        Full Classification: {response.prediction}
                      </p>
                    )}
                  </div>

                  {response.cause && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Cause:
                      </h4>
                      <p className="text-yellow-700">{response.cause}</p>
                    </div>
                  )}

                  {response.cure && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">
                        Treatment:
                      </h4>
                      <p className="text-green-700">{response.cure}</p>
                    </div>
                  )}

                  {!response.cause && !response.cure && response.prediction && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-600">
                        Disease detected: <strong>{response.prediction}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Additional information about cause and treatment is not
                        available for this classification.
                      </p>
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

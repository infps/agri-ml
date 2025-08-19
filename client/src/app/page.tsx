"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const services = [
    {
      title: "Crop Recommendation",
      href: "/crop-recommendation",
      description:
        "Analyze soil conditions and environmental factors for optimal crop selection",
    },
    {
      title: "Fertilizer Guide",
      href: "/fertilizer-guide",
      description:
        "Get customized fertilizer recommendations based on soil nutrient analysis",
    },
    {
      title: "Disease Detection",
      href: "/disease-detection",
      description:
        "Upload plant images to identify diseases and receive treatment suggestions",
    },
    {
      title: "Yield Prediction",
      href: "/yield-prediction",
      description:
        "Forecast agricultural yields using climate data and farming practices",
    },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <h1 className="text-5xl font-bold text-green-900 uppercase">
              ML APPLICATION
            </h1>
          </div>
          <div></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <Link key={index} href={service.href}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white shadow-2xl border-0">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-green-900 uppercase group-hover:text-green-950 transition-colors mb-4">
                    {service.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full bg-green-900 hover:bg-green-950 cursor-pointer text-white font-semibold uppercase h-11 transition-all duration-300">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

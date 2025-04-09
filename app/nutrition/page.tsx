"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { analyzeNutritionText } from "../utils/api";
import Navbar from "../components/navbar";
import AuthGuard from "../utils/authGuard";

interface NutritionResult {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  foodItems: string[];
  healthImpact?: string;
  recommendations?: string[];
}

const NutritionPage = () => {
  const [foodText, setFoodText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // For animation
  const [animatedHealthImpact, setAnimatedHealthImpact] = useState<string>("");
  const [visibleRecommendations, setVisibleRecommendations] = useState<string[]>([]);

  const analyzeFood = async () => {
    if (!foodText.trim()) {
      setError("Please enter food items to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setAnimatedHealthImpact("");
    setVisibleRecommendations([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to analyze food");
        setIsAnalyzing(false);
        return;
      }

      const nutritionData = await analyzeNutritionText(session.access_token, foodText);
      setResult(nutritionData.analysis);
    } catch (err: any) {
      console.error("Error analyzing food:", err);
      setError(err.message || "Failed to analyze food. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFoodText("");
    setResult(null);
    setError(null);
    setAnimatedHealthImpact("");
    setVisibleRecommendations([]);
  };

  // Typewriter effect for healthImpact
  useEffect(() => {
    if (result?.healthImpact) {
      setAnimatedHealthImpact("");
      const text = result.healthImpact;
      let i = 0;
      const interval = setInterval(() => {
        setAnimatedHealthImpact((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 25);
    }
  }, [result?.healthImpact]);

  // Animate recommendations list
  useEffect(() => {
    if (result?.recommendations) {
      setVisibleRecommendations([]);
      let i = 0;
      const interval = setInterval(() => {
        setVisibleRecommendations((prev) => [...prev, result.recommendations![i]]);
        i++;
        if (!result.recommendations || i >= result.recommendations.length) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [result?.recommendations]);

  return (
    <AuthGuard>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-900 text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Nutrition Analysis</h1>

          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Text Input Section */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Enter Food Items</h2>

                <div className="mb-4">
                  <textarea
                    value={foodText}
                    onChange={(e) => setFoodText(e.target.value)}
                    placeholder="Enter food items to analyze (e.g., '2 eggs, 1 slice of toast with butter, 1 cup of orange juice')"
                    className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={analyzeFood}
                    disabled={!foodText.trim() || isAnalyzing}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      !foodText.trim() || isAnalyzing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      "Analyze Nutrition"
                    )}
                  </button>

                  <button
                    onClick={resetAnalysis}
                    className="px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="border-t border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-4">Nutrition Analysis Results</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Macronutrients</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span className="font-semibold">{result.calories} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-semibold">{result.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbohydrates:</span>
                        <span className="font-semibold">{result.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fats:</span>
                        <span className="font-semibold">{result.fats}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span className="font-semibold">{result.fiber}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Detected Food Items</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {result.foodItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.healthImpact && (
                  <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Health Impact</h3>
                    <p className="whitespace-pre-line">{animatedHealthImpact}</p>
                  </div>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {visibleRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> This is an AI-powered estimation and may not be 100% accurate.
                      For precise nutritional information, please consult a nutritionist or use a food scale.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NutritionPage;

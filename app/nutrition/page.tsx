"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { analyzeNutritionText, logNutrition, fetchNutritionLogs, deleteNutritionLog } from "../utils/api";
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

interface NutritionLog {
  id: string;
  date: string;
  meal: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  food_items: string[];
  total_calories: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
  created_at: string;
}

const NutritionPage = () => {
  const [foodText, setFoodText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLogging, setIsLogging] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // For animation
  const [animatedHealthImpact, setAnimatedHealthImpact] = useState<string>("");
  const [visibleRecommendations, setVisibleRecommendations] = useState<string[]>([]);

  useEffect(() => {
    fetchUserLogs();
  }, [dateRange]);

  const fetchUserLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const logs = await fetchNutritionLogs(
        session.access_token, 
        dateRange.start, 
        dateRange.end
      );
      setNutritionLogs(logs || []);
    } catch (err) {
      console.error("Error fetching nutrition logs:", err);
    }
  };

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

  const logNutritionData = async () => {
    if (!result) {
      setError("Please analyze food items first");
      return;
    }

    setIsLogging(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to log nutrition data");
        setIsLogging(false);
        return;
      }

      await logNutrition(session.access_token, {
        date: selectedDate,
        meal: selectedMeal,
        food_items: result.foodItems,
        total_calories: result.calories,
        protein_grams: result.protein,
        carbs_grams: result.carbohydrates,
        fat_grams: result.fats,
        fiber_grams: result.fiber
      });

      // Refresh logs
      fetchUserLogs();
      
      // Reset form
      setFoodText("");
      setResult(null);
      setAnimatedHealthImpact("");
      setVisibleRecommendations([]);
      
    } catch (err: any) {
      console.error("Error logging nutrition data:", err);
      setError(err.message || "Failed to log nutrition data. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await deleteNutritionLog(session.access_token, id);
      fetchUserLogs();
    } catch (err) {
      console.error("Error deleting nutrition log:", err);
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

                {/* Log Nutrition Section */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium mb-4">Log This Meal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Meal Type</label>
                      <select
                        value={selectedMeal}
                        onChange={(e) => setSelectedMeal(e.target.value as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack')}
                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={logNutritionData}
                      disabled={isLogging}
                      className={`px-6 py-3 rounded-lg font-medium ${
                        isLogging
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isLogging ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Logging...
                        </span>
                      ) : (
                        "Log This Meal"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Logs Section */}
          <div className="max-w-4xl mx-auto mt-8 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your Nutrition Logs</h2>
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700"
                >
                  {showLogs ? "Hide Logs" : "Show Logs"}
                </button>
              </div>

              {showLogs && (
                <>
                  <div className="mb-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {nutritionLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No nutrition logs found for the selected date range.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nutritionLogs.map((log) => (
                        <div key={log.id} className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{log.meal} - {new Date(log.date).toLocaleDateString()}</h3>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>Calories: <span className="font-semibold">{log.total_calories} kcal</span></div>
                                {log.protein_grams && <div>Protein: <span className="font-semibold">{log.protein_grams}g</span></div>}
                                {log.carbs_grams && <div>Carbs: <span className="font-semibold">{log.carbs_grams}g</span></div>}
                                {log.fat_grams && <div>Fat: <span className="font-semibold">{log.fat_grams}g</span></div>}
                                {log.fiber_grams && <div>Fiber: <span className="font-semibold">{log.fiber_grams}g</span></div>}
                              </div>
                              <div className="mt-2">
                                <h4 className="font-medium">Food Items:</h4>
                                <ul className="list-disc list-inside text-sm">
                                  {log.food_items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete log"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NutritionPage;

"use client";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { analyzeNutritionText, logNutrition, fetchNutritionLogs, deleteNutritionLog } from "../utils/api";
import Navbar from "../components/navbar";
import AuthGuard from "../utils/authGuard";
import { motion } from "framer-motion";

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
  meal?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  food_items?: string[];
  total_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
  created_at: string;
  analysis?: {
    calories: {
      estimate: number;
      note: string;
    };
    protein?: {
      estimate: number;
      unit: string;
      note: string;
    };
    carbohydrates?: {
      estimate: number;
      unit: string;
      note: string;
    };
    fats?: {
      estimate: number;
      unit: string;
      note: string;
    };
    fiber?: {
      estimate: number;
      unit: string;
      note: string;
    };
    foodItems?: string[];
    healthImpact?: string;
    recommendations?: string[];
  };
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

      const response = await analyzeNutritionText(session.access_token, foodText);
      
      if (!response.success || !response.analysis) {
        throw new Error("Failed to analyze food items");
      }

      const nutritionData = response.analysis;
      
      // Process the data to match our expected format
      const processedAnalysis: NutritionResult = {
        calories: nutritionData.calories || 0,
        protein: nutritionData.protein || 0,
        carbohydrates: nutritionData.carbohydrates || 0,
        fats: nutritionData.fats || 0,
        fiber: nutritionData.fiber || 0,
        foodItems: nutritionData.foodItems || [],
        healthImpact: nutritionData.healthImpact || "",
        recommendations: nutritionData.recommendations || []
      };
      
      setResult(processedAnalysis);
      
      // Animate health impact text
      if (processedAnalysis.healthImpact) {
        const healthImpactText = processedAnalysis.healthImpact;
        setAnimatedHealthImpact("");
        let i = 0;
        const interval = setInterval(() => {
          setAnimatedHealthImpact(prev => prev + healthImpactText.charAt(i));
          i++;
          if (i >= healthImpactText.length) clearInterval(interval);
        }, 25);
      }
      
      // Animate recommendations
      const recommendations = processedAnalysis.recommendations || [];
      setVisibleRecommendations([]);
      setTimeout(() => setVisibleRecommendations(recommendations), 500);
    } catch (err: any) {
      console.error("Error analyzing food:", err);
      setError(err.message || "Failed to analyze food. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const logNutritionData = async () => {
    try {
      setIsLogging(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Create the nutrition data object
      const nutritionData: any = {
        date: selectedDate,
        meal: selectedMeal,
        food_items: result?.foodItems,
        total_calories: result?.calories,
        protein_grams: result?.protein,
        carbs_grams: result?.carbohydrates,
        fat_grams: result?.fats,
        fiber_grams: result?.fiber
      };

      // Add analysis data if available
      if (result) {
        nutritionData.analysis = {
          calories: {
            estimate: result.calories,
            note: "Calorie estimate based on food items"
          },
          protein: {
            estimate: result.protein,
            unit: "grams",
            note: "Protein content estimate"
          },
          carbohydrates: {
            estimate: result.carbohydrates,
            unit: "grams",
            note: "Carbohydrate content estimate"
          },
          fats: {
            estimate: result.fats,
            unit: "grams",
            note: "Fat content estimate"
          },
          fiber: {
            estimate: result.fiber,
            unit: "grams",
            note: "Fiber content estimate"
          },
          foodItems: result.foodItems,
          healthImpact: result.healthImpact,
          recommendations: result.recommendations
        };
      }

      await logNutrition(session.access_token, nutritionData);
      await fetchUserLogs();
      setFoodText("");
      setResult(null);
      setAnimatedHealthImpact("");
      setVisibleRecommendations([]);
    } catch (error) {
      console.error("Error logging nutrition data:", error);
      setError("Failed to log nutrition data. Please try again.");
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-100">Nutrition Analyzer</h1>
            <p className="text-gray-400 mt-2">Analyze your food and track your nutrition intake</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-800"
            >
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Enter Food Items</h2>
              <textarea
                value={foodText}
                onChange={(e) => setFoodText(e.target.value)}
                placeholder="Enter food items (e.g. 2 eggs, 1 banana, 1 cup of oatmeal)"
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 mb-4 min-h-[120px] text-gray-100 placeholder-gray-500"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meal Type</label>
                  <select 
                    value={selectedMeal} 
                    onChange={(e) => setSelectedMeal(e.target.value as any)} 
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-100"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={analyzeFood} 
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : "Analyze"}
                </button>
                <button 
                  onClick={logNutritionData} 
                  disabled={!result || isLogging}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isLogging ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging...
                    </>
                  ) : "Log"}
                </button>
                <button 
                  onClick={resetAnalysis} 
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Reset
                </button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-lg">
                  {error}
                </div>
              )}
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Nutrition Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.calories}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.protein}g</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.carbohydrates}g</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fats</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.fats}g</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Food Items</h3>
                    <ul className="space-y-2">
                      {result.foodItems.map((item: string, index: number) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-center space-x-2"
                        >
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {animatedHealthImpact && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Health Impact</h3>
                    <p className="text-gray-700 dark:text-gray-300">{animatedHealthImpact}</p>
                  </motion.div>
                )}

                {visibleRecommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                    <ul className="space-y-2">
                      {visibleRecommendations.map((rec: string, index: number) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-center space-x-2"
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{rec}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Disclaimer:</p>
                  <p>The nutritional information provided is an estimate based on the food description. Actual values may vary based on portion sizes, preparation methods, and specific ingredients used. This information is for general guidance only and should not be considered as professional medical advice.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Logs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-zinc-900 rounded-xl shadow-md p-6 border border-zinc-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Nutrition Logs</h2>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-violet-400 hover:text-violet-300 font-medium flex items-center"
              >
                {showLogs ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Hide Logs
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Show Logs
                  </>
                )}
              </button>
            </div>

            {showLogs && (
              <div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
                    <input 
                      type="date" 
                      value={dateRange.start} 
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
                      className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
                    <input 
                      type="date" 
                      value={dateRange.end} 
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
                      className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-100"
                    />
                  </div>
                </div>
                
                {nutritionLogs.length === 0 ? (
                  <div className="bg-zinc-800 p-4 rounded-lg text-center text-gray-400 border border-zinc-700">
                    No logs found for the selected date range.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                      <thead className="bg-zinc-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Meal</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Calories</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Food Items</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-zinc-900 divide-y divide-zinc-800">
                        {nutritionLogs.map(log => (
                          <tr key={log.id} className="hover:bg-zinc-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.meal || 'Not specified'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {log.analysis?.calories?.estimate || log.total_calories || 0} cal
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              <div className="max-w-xs truncate">
                                {log.analysis?.foodItems?.join(", ") || (log.food_items && log.food_items.join(", ")) || 'No food items listed'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-rose-400 hover:text-rose-300 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default NutritionPage;

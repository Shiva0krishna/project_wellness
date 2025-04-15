"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import AuthGuard from "../../utils/authGuard";
import MetricsCard from "../../components/metrics_card/metrics_card";
import Modal from "../../components/modal/modal";
import TrackingSections from "../../components/tracking_sections";
import { 
  fetchCalorieData, 
  addCalorieData,
  updateCalorieData,
  fetchNutritionLogs, 
  fetchActivityData
} from "../../utils/api";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";

type CalorieMetric = {
  id?: string;
  day: string;
  consumed: number;
  burned: number;
};

const CaloriesTracking = () => {
  const router = useRouter();
  const [calorieMetrics, setCalorieMetrics] = useState<CalorieMetric[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ 
    id: "",
    date: new Date().toISOString().split('T')[0], 
    calories_consumed: "",
    calories_burned: "",
    isEditing: false
  });
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 0,
    caloriesBurned: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Fetch nutrition logs for today
      const nutritionLogs = await fetchNutritionLogs(session.access_token, today, today);
      const todayNutritionCalories = nutritionLogs
        .filter((log: any) => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === today;
        })
        .reduce((sum: number, log: any) => {
          // Handle both direct calories and analysis structure
          if (log.analysis && log.analysis.calories) {
            return sum + (parseInt(log.analysis.calories.estimate) || 0);
          }
          return sum + (parseInt(log.total_calories) || 0);
        }, 0);

      // Fetch activity data for today
      const activityLogs = await fetchActivityData(session.access_token, today, today);
      const todayBurnedCalories = activityLogs
        .filter((log: any) => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === today;
        })
        .reduce((sum: number, log: any) => sum + (parseInt(log.calories_burned) || 0), 0);

      // Update today's stats
      setTodayStats({
        caloriesConsumed: todayNutritionCalories,
        caloriesBurned: todayBurnedCalories
      });

      // Fetch historical calorie data
      const data = await fetchCalorieData(session.access_token);
      if (data && Array.isArray(data)) {
        // Transform and sort the data by date (most recent first)
        const transformedData = data
          .map(entry => ({
            id: entry.id,
            day: new Date(entry.date).toISOString().split('T')[0],
            consumed: parseInt(entry.calories_consumed) || 0,
            burned: parseInt(entry.calories_burned) || 0
          }))
          .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime());

        // Check if we have an entry for today in the historical data
        const todayEntry = transformedData.find(entry => entry.day === today);
        
        if (!todayEntry && (todayNutritionCalories > 0 || todayBurnedCalories > 0)) {
          // If we have today's stats but no entry, add it to the historical data
          transformedData.unshift({
            id: 'today',
            day: today,
            consumed: todayNutritionCalories,
            burned: todayBurnedCalories
          });
        }

        setCalorieMetrics(transformedData);
      }
    } catch (error) {
      setError("Failed to fetch calorie data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      setError("Please select a date");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // Format data to match backend expectations
      const calorieData = {
        date: formData.date,
        calories_consumed: formData.isEditing ? 
          parseInt(formData.calories_consumed) : 
          todayStats.caloriesConsumed || 0,
        calories_burned: formData.isEditing ? 
          parseInt(formData.calories_burned) : 
          todayStats.caloriesBurned || 0
      };

      // Validate the data before sending
      if (isNaN(calorieData.calories_consumed) || isNaN(calorieData.calories_burned)) {
        throw new Error("Invalid calorie values");
      }

      // Use API functions for both create and update
      if (formData.isEditing) {
        await updateCalorieData(session.access_token, formData.date, {
          calories_consumed: calorieData.calories_consumed,
          calories_burned: calorieData.calories_burned
        });
      } else {
        await addCalorieData(session.access_token, calorieData);
      }

      setIsModalOpen(false);
      setFormData({ 
        id: "",
        date: new Date().toISOString().split('T')[0], 
        calories_consumed: "",
        calories_burned: "",
        isEditing: false
      });
      setError(""); // Clear any existing error messages
      await fetchData();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save calorie data");
      console.error(error);
    }
  };

  const handleEdit = (metric: CalorieMetric) => {
    setFormData({
      id: metric.id || "",
      date: metric.day,
      calories_consumed: metric.consumed.toString(),
      calories_burned: metric.burned.toString(),
      isEditing: true
    });
    setIsModalOpen(true);
  };

  const handleBack = () => {
    router.push("/track_activity");
  };

  useEffect(() => {
    fetchData();
    // Set up an interval to refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-6 pt-20 md:pt-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Calorie Tracking</h1>
          <button 
            onClick={handleBack}
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
        
        {error && (
          <div className="bg-red-600/20 border border-red-500 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4">Today's Calories</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-violet-400">{todayStats.caloriesConsumed.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Consumed (kcal)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">{todayStats.caloriesBurned.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Burned (kcal)</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">Net Calories:</p>
              <p className={`text-xl font-bold ${todayStats.caloriesConsumed - todayStats.caloriesBurned > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(todayStats.caloriesConsumed - todayStats.caloriesBurned).toLocaleString()} kcal
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
            ) : (
              <>
                <MetricsCard
                  title="Calorie History"
                  subtitle="Daily Calorie Metrics"
                  description="Track your calorie intake and burn over time"
                  metrics={calorieMetrics}
                  primaryMetric="consumed"
                  secondaryMetric="burned"
                  unit="kcal"
                />
                {/* History Table */}
                <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4">Detailed History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-700">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Consumed</th>
                          <th className="pb-2">Burned</th>
                          <th className="pb-2">Net</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calorieMetrics.map((metric) => (
                          <tr key={metric.day} className="border-b border-gray-700/50">
                            <td className="py-2">{new Date(metric.day).toLocaleDateString()}</td>
                            <td className="py-2 text-violet-400">{metric.consumed.toLocaleString()} kcal</td>
                            <td className="py-2 text-green-400">{metric.burned.toLocaleString()} kcal</td>
                            <td className={`py-2 ${metric.consumed - metric.burned > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {(metric.consumed - metric.burned).toLocaleString()} kcal
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => handleEdit(metric)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold mb-4">Other Tracking Options</h2>
            <TrackingSections currentSection="calories" />
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              id: "",
              date: new Date().toISOString().split('T')[0],
              calories_consumed: "",
              calories_burned: "",
              isEditing: false
            });
            setIsModalOpen(true);
          }}
          className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          +
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">
              {formData.isEditing ? 'Edit Calorie Data' : 'Save Calorie Data'}
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }))}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                  title="Set to today"
                >
                  Today
                </button>
              </div>
            </div>

            {formData.isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Calories Consumed</label>
                  <input
                    type="number"
                    value={formData.calories_consumed}
                    onChange={e => setFormData(prev => ({ ...prev, calories_consumed: e.target.value }))}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Enter calories consumed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Calories Burned</label>
                  <input
                    type="number"
                    value={formData.calories_burned}
                    onChange={e => setFormData(prev => ({ ...prev, calories_burned: e.target.value }))}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Enter calories burned"
                  />
                </div>
              </>
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Calories Consumed:</p>
                    <p className="text-lg font-bold text-violet-400">{todayStats.caloriesConsumed.toLocaleString()} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Calories Burned:</p>
                    <p className="text-lg font-bold text-green-400">{todayStats.caloriesBurned.toLocaleString()} kcal</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  These values are automatically calculated from your nutrition and activity logs
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 p-2 rounded font-medium hover:bg-blue-700"
            >
              {formData.isEditing ? 'Update Entry' : 'Save Entry'}
            </button>
          </form>
        </Modal>
      </div>
      <Footer />
    </AuthGuard>
  );
};

export default CaloriesTracking;

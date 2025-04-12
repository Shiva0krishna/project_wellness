"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import AuthGuard from "../../utils/authGuard";
import MetricsCard from "../../components/metrics_card/metrics_card";
import Modal from "../../components/modal/modal";
import TrackingSections from "../../components/tracking_sections";
import { fetchCalorieData, addCalorieData } from "../../utils/api";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";

type CalorieMetric = {
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
    date: "", 
    calories_consumed: "", 
    calories_burned: "" 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const data = await fetchCalorieData(session.access_token);
      if (data && Array.isArray(data)) {
        const transformedData = data.map(entry => ({
          day: new Date(entry.date).toISOString().split('T')[0],
          consumed: parseInt(entry.calories_consumed),
          burned: parseInt(entry.calories_burned)
        }));
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
    if (!formData.date || !formData.calories_consumed || !formData.calories_burned) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      await addCalorieData(session.access_token, {
        date: formData.date,
        calories_consumed: parseInt(formData.calories_consumed),
        calories_burned: parseInt(formData.calories_burned)
      });
      setIsModalOpen(false);
      setFormData({ date: "", calories_consumed: "", calories_burned: "" });
      await fetchData();
    } catch (error) {
      setError("Failed to add calorie data");
      console.error(error);
    }
  };

  const handleBack = () => {
    router.push("/track_activity");
  };

  useEffect(() => {
    fetchData();
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
            ) : (
              <MetricsCard
                title="Calorie Tracking"
                subtitle="Daily Calorie Metrics"
                description="Track your calorie intake and burn"
                metrics={calorieMetrics}
                primaryMetric="consumed"
                secondaryMetric="burned"
                unit="kcal"
              />
            )}
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold mb-4">Other Tracking Options</h2>
            <TrackingSections currentSection="calories" />
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          +
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Add Calorie Data</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Calories Consumed</label>
              <input
                type="number"
                required
                min="0"
                value={formData.calories_consumed}
                onChange={e => setFormData(prev => ({ ...prev, calories_consumed: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Calories Burned</label>
              <input
                type="number"
                required
                min="0"
                value={formData.calories_burned}
                onChange={e => setFormData(prev => ({ ...prev, calories_burned: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 p-2 rounded font-medium hover:bg-blue-700"
            >
              Add Entry
            </button>
          </form>
        </Modal>
      </div>
      <Footer />
    </AuthGuard>
  );
};

export default CaloriesTracking;

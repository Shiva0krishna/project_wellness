"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import AuthGuard from "../../utils/authGuard";
import MetricsCard from "../../components/metrics_card/metrics_card";
import Modal from "../../components/modal/modal";
import { fetchWeightData, addWeightData } from "../../utils/api";
import { supabase } from "../../utils/supabaseClient";

type WeightMetric = {
  day: string;
  weight: number;
};

const WeightTracking = () => {
  const [weightMetrics, setWeightMetrics] = useState<WeightMetric[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ date: "", weight: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const data = await fetchWeightData(session.access_token);
      if (data && Array.isArray(data)) {
        const transformedData = data.map(entry => ({
          day: new Date(entry.date).toISOString().split('T')[0],
          weight: parseFloat(entry.weight),
        }));
        setWeightMetrics(transformedData);
      }
    } catch (error) {
      setError("Failed to fetch weight data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.weight) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      await addWeightData(session.access_token, {
        date: formData.date,
        weight: parseFloat(formData.weight),
      });
      setIsModalOpen(false);
      setFormData({ date: "", weight: "" });
      await fetchData();
    } catch (error) {
      setError("Failed to add weight data");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-8">Weight Tracking</h1>
        
        {error && (
          <div className="bg-red-600/20 border border-red-500 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
        ) : (
          <MetricsCard
            title="Weight Tracking"
            subtitle="Body Metrics"
            description="Track your weight changes over time"
            metrics={weightMetrics}
            primaryMetric="weight"
            unit="kg"
          />
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          +
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Add Weight Data</h2>
            
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
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
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

export default WeightTracking;

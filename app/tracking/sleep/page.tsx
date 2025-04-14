"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import AuthGuard from "../../utils/authGuard";
import MetricsCard from "../../components/metrics_card/metrics_card";
import Modal from "../../components/modal/modal";
import TrackingSections from "../../components/tracking_sections";
import { fetchSleepData, addSleepData } from "../../utils/api";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";

type SleepMetric = {
  day: string;
  sleep: number;
  quality: string;
};

const SleepTracking = () => {
  const router = useRouter();
  const [sleepMetrics, setSleepMetrics] = useState<SleepMetric[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    sleep_duration: "", 
    sleep_quality: "" 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const data = await fetchSleepData(session.access_token);
      if (data && Array.isArray(data)) {
        const transformedData = data.map(entry => ({
          day: new Date(entry.date).toISOString().split('T')[0],
          sleep: parseFloat(entry.sleep_duration),
          quality: entry.sleep_quality
        }));
        setSleepMetrics(transformedData);
      }
    } catch (error) {
      setError("Failed to fetch sleep data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.sleep_duration || !formData.sleep_quality) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      await addSleepData(session.access_token, {
        date: formData.date,
        sleep_duration: parseFloat(formData.sleep_duration),
        sleep_quality: formData.sleep_quality
      });
      setIsModalOpen(false);
      setFormData({ date: "", sleep_duration: "", sleep_quality: "" });
      await fetchData();
    } catch (error) {
      setError("Failed to add sleep data");
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
          <h1 className="text-3xl font-bold">Sleep Tracking</h1>
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
                title="Sleep Tracking"
                subtitle="Sleep Metrics"
                description="Track your sleep duration and quality"
                metrics={sleepMetrics}
                primaryMetric="sleep"
                secondaryMetric="quality"
                unit="hours"
              />
            )}
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold mb-4">Other Tracking Options</h2>
            <TrackingSections currentSection="sleep" />
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
            <h2 className="text-xl font-bold mb-4">Add Sleep Data</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }))}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                  title="Set to today"
                >
                  Today
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Defaults to today if not changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sleep Duration (hours)</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                max="24"
                value={formData.sleep_duration}
                onChange={e => setFormData(prev => ({ ...prev, sleep_duration: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sleep Quality</label>
              <select
                required
                value={formData.sleep_quality}
                onChange={e => setFormData(prev => ({ ...prev, sleep_quality: e.target.value }))}
                className="w-full p-2 rounded bg-gray-700 text-white"
              >
                <option value="">Select quality</option>
                <option value="Poor">Poor</option>
                <option value="Fair">Fair</option>
                <option value="Good">Good</option>
                <option value="Excellent">Excellent</option>
              </select>
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

export default SleepTracking;

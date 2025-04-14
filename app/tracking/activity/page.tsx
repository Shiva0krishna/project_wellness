"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../components/navbar";
import { supabase } from "../../utils/supabaseClient";
import { logActivity, fetchActivityData, fetchDailyActivitySummary, sendGeminiQuery, fetchActivitySummary } from "../../utils/api";

interface ActivityData {
  id: string;
  date: string;
  activity_type: string;
  duration_minutes: number;
  intensity: string;
  description?: string;
  calories_burned: number;
  created_at: string;
}

interface ActivitySummary {
  user_id: string;
  date: string;
  total_activities: number;
  total_duration: number;
  total_calories_burned: number;
  activities_performed: string[];
}

const ActivityTrackingPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity_type: '',
    duration: 30,
    intensity: 'moderate',
    description: ''
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const activityTypes = [
    { id: "running", name: "Running", icon: "🏃‍♂️" },
    { id: "walking", name: "Walking", icon: "🚶‍♂️" },
    { id: "cycling", name: "Cycling", icon: "🚴‍♂️" },
    { id: "swimming", name: "Swimming", icon: "🏊‍♂️" },
    { id: "gym", name: "Gym Workout", icon: "💪" },
    { id: "yoga", name: "Yoga", icon: "🧘‍♀️" },
    { id: "dancing", name: "Dancing", icon: "💃" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "hiking", name: "Hiking", icon: "🥾" },
    { id: "other", name: "Other", icon: "🏃‍♀️" }
  ];

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          await Promise.all([
            fetchUserActivityData(session.access_token),
            fetchUserActivitySummary(session.access_token)
          ]);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [dateRange]);

  const fetchUserActivityData = async (token: string) => {
    try {
      const data = await fetchActivityData(token, dateRange.start, dateRange.end);
      setActivityData(data);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      setError("Failed to load your activity data. Please try again.");
    }
  };

  const fetchUserActivitySummary = async (token: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const summary = await fetchActivitySummary(token, today, today);
      if (Array.isArray(summary) && summary.length > 0) {
        setActivitySummary(summary[0]);
      } else {
        setActivitySummary({
          user_id: '',
          date: '',
          total_activities: 0,
          total_duration: 0,
          total_calories_burned: 0,
          activities_performed: []
        });
      }
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      setActivitySummary({
        user_id: '',
        date: '',
        total_activities: 0,
        total_duration: 0,
        total_calories_burned: 0,
        activities_performed: []
      });
    }
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }
    return session.access_token;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityTypeSelect = (type: string) => {
    setFormData(prev => ({
      ...prev,
      activity_type: type
    }));
  };

  const estimateCaloriesBurned = async (activityType: string, duration: number, intensity: string) => {
    try {
      const token = await getToken();
      const prompt = `Estimate the calories burned for the following activity:
        - Activity Type: ${activityType}
        - Duration: ${duration} minutes
        - Intensity: ${intensity}
        Please provide only a number as the response, representing the estimated calories burned.`;
      
      const response = await sendGeminiQuery(token, "activity", prompt);
      const calories = parseInt(response);
      return isNaN(calories) ? 0 : calories;
    } catch (error) {
      console.error("Error estimating calories:", error);
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to log an activity');
      return;
    }

    // Validate required fields
    if (!formData.date) {
      setError('Date is required');
      return;
    }
    
    if (!formData.activity_type) {
      setError('Activity type is required');
      return;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    
    if (!formData.intensity) {
      setError('Intensity is required');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      
      // Estimate calories burned using Gemini API
      const estimatedCalories = await estimateCaloriesBurned(
        formData.activity_type,
        formData.duration,
        formData.intensity
      );
      
      const activityDataToSend = {
        date: formData.date,
        activity_type: formData.activity_type,
        duration_minutes: formData.duration,
        intensity: formData.intensity,
        description: formData.description,
        calories_burned: estimatedCalories
      };
      
      console.log("Sending activity data:", activityDataToSend);
      
      await logActivity(token, activityDataToSend);
      
      // Refresh user activity data
      await fetchActivityData(token);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        activity_type: '',
        duration: 30,
        intensity: 'moderate',
        description: ''
      });
      
      setSuccess('Activity logged successfully!');
      setError('');
    } catch (err) {
      console.error("Error logging activity:", err);
      setError(err instanceof Error ? err.message : 'Failed to log activity');
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Activity Tracking</h1>
          <p className="text-gray-400">
            Log your daily activities to track calories burned and get personalized recommendations.
          </p>
        </motion.div>

        {activitySummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Today's Activities</h3>
              <p className="text-2xl font-bold text-violet-400">{activitySummary.total_activities}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {activitySummary.activities_performed.map((activity, index) => (
                  <span key={index} className="inline-block px-2 py-1 bg-violet-500/20 rounded text-xs">
                    {activityTypes.find(t => t.id === activity)?.icon || "🏃‍♀️"} {activity}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Total Duration</h3>
              <p className="text-2xl font-bold text-violet-400">{activitySummary.total_duration} min</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Calories Burned</h3>
              <p className="text-2xl font-bold text-violet-400">{activitySummary.total_calories_burned} kcal</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
          >
            {success}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Activity Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {activityTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleActivityTypeSelect(type.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      formData.activity_type === type.id
                        ? "border-violet-500 bg-violet-500/20"
                        : "border-gray-600 bg-gray-700/30 hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-2xl mb-1">{type.icon}</span>
                    <span className="text-xs text-center">{type.name}</span>
                  </button>
                ))}
              </div>
              {!formData.activity_type && (
                <p className="mt-1 text-sm text-red-400">Please select an activity type</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="intensity" className="block text-sm font-medium text-gray-300 mb-1">
                  Intensity
                </label>
                <select
                  id="intensity"
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="vigorous">Vigorous</option>
                  <option value="very_vigorous">Very Vigorous</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add details about your activity..."
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving || !formData.activity_type}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Log Activity"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {activityData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Activity History</h2>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(
                activityData.reduce((acc, activity) => {
                  const date = activity.date;
                  if (!acc[date]) {
                    acc[date] = [];
                  }
                  acc[date].push(activity);
                  return acc;
                }, {} as Record<string, ActivityData[]>)
              )
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, activities]) => (
                  <div key={date} className="bg-gray-800/30 rounded-lg overflow-hidden">
                    <div className="bg-gray-800/50 px-6 py-3">
                      <h3 className="text-lg font-semibold">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="text-sm text-gray-400">
                        {activities.length} {activities.length === 1 ? 'activity' : 'activities'} •{' '}
                        Total Duration: {activities.reduce((sum, a) => sum + a.duration_minutes, 0)} min •{' '}
                        Total Calories: {activities.reduce((sum, a) => sum + a.calories_burned, 0)} kcal
                      </div>
                    </div>
                    <div className="divide-y divide-gray-700">
                      {activities.map((activity) => (
                        <div key={activity.id} className="px-6 py-4 hover:bg-gray-800/40 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">
                                {activityTypes.find(t => t.id === activity.activity_type)?.icon || "🏃‍♀️"}
                              </span>
                              <div>
                                <div className="font-medium">
                                  {activityTypes.find(t => t.id === activity.activity_type)?.name || activity.activity_type}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {activity.duration_minutes} minutes • {activity.intensity} intensity • {activity.calories_burned} kcal
                                </div>
                                {activity.description && (
                                  <div className="text-sm text-gray-400 mt-1">
                                    {activity.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(activity.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ActivityTrackingPage; 
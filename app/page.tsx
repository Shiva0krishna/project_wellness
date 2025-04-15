"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/navbar";
import { supabase } from "./utils/supabaseClient";
import { fetchUserProfile, fetchWeightData, fetchSleepData, fetchActivityData, fetchCalorieData, fetchActivitySummary, fetchMedicalHistory, sendGeminiQuery } from "./utils/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import Footer from './components/footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  fitness_goal?: string;
}

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

interface SleepEntry {
  id: string;
  date: string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

interface ActivityEntry {
  id: string;
  date: string;
  activity_type: string;
  duration_minutes: number;
  intensity: string;
  calories_burned: number;
  description?: string;
}

interface TodayStats {
  caloriesConsumed: number;
  caloriesBurned: number;
  sleepHours: number;
  weight: number | null;
  activities: ActivityEntry[];
}

interface CalorieData {
  id: string;
  user_id: string;
  date: string;
  calories_consumed: number;
  calories_burned: number;
  net_calories: number;
  created_at: string;
}

interface ActivitySummary {
  user_id: string;
  date: string;
  total_activities: number;
  total_duration: number;
  total_calories_burned: number;
  activities_performed: ActivityEntry[];
}

const GrainOverlay = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-[0.15]">
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("/background.png")`, 
          backgroundRepeat: "no-repeat", 
          backgroundSize: "150%", 
          backgroundPosition: "left",
          transform: "scale(1.5)", 
          zIndex: 1000,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backdropFilter: "contrast(120%) brightness(95%)", mixBlendMode: "overlay" }}
      />
    </div>
  );
};

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    sleepHours: 0,
    weight: null,
    activities: []
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [calorieData, setCalorieData] = useState<CalorieData[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setLoading(true);
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [profile, activityLogs, calorieData, weightData, sleepData] = await Promise.all([
        fetchUserProfile(session.access_token),
        fetchActivityData(session.access_token, today, today),
        fetchCalorieData(session.access_token),
        fetchWeightData(session.access_token),
        fetchSleepData(session.access_token)
      ]);

      setUserProfile(profile);

      // Calculate calories burned from activity logs
      const todayBurnedCalories = activityLogs
        .filter((log: any) => {
          const logDate = new Date(log.date).toISOString().split('T')[0];
          return logDate === today;
        })
        .reduce((sum: number, log: any) => sum + (parseInt(log.calories_burned) || 0), 0);

      // Find today's calorie entry if it exists
      const todayCalories = Array.isArray(calorieData) && calorieData.find((entry: any) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        return entryDate === today;
      });

      // Get today's weight and sleep data
      const todayWeight = weightData?.find((w: any) => new Date(w.date).toISOString().split('T')[0] === today);
      const todaySleep = sleepData?.find((s: any) => new Date(s.date).toISOString().split('T')[0] === today);

      // Update today's stats
      setTodayStats({
        caloriesConsumed: todayCalories?.calories_consumed || 0,
        caloriesBurned: todayBurnedCalories,
        sleepHours: todaySleep?.hours || 0,
        weight: todayWeight?.weight || null,
        activities: activityLogs
      });

      // Set calorie data for the graph
      setCalorieData(calorieData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const medicalHistoryData = await fetchMedicalHistory(session.access_token);
      setMedicalHistory(medicalHistoryData);
    } catch (error) {
      console.error('Error fetching medical history:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not logged in');

      const response = await sendGeminiQuery(session.access_token, 'recommendations', 'Provide personal recommendations for the user.');
      const recommendationsArray = response.split('\n').filter((rec: string) => rec.trim() !== '');
      setRecommendations(recommendationsArray);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchDashboardData();
          await fetchAdditionalData();
          await fetchRecommendations();
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchDashboardData();
          await fetchAdditionalData();
          await fetchRecommendations();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Prepare chart data for calorie tracking
  const calorieChartData: ChartData<'line'> = {
    labels: calorieData.map(data => {
      const date = new Date(data.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Calories Consumed',
        data: calorieData.map(data => data.calories_consumed),
        borderColor: 'rgb(244, 114, 182)', // pink-400
        backgroundColor: 'rgba(244, 114, 182, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Calories Burned',
        data: calorieData.map(data => data.calories_burned),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      }
    ],
  };

  const calorieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(229, 231, 235)', // text-gray-200
        },
      },
      title: {
        display: true,
        text: 'Calorie Tracking (Past 7 Days)',
        color: 'rgb(229, 231, 235)', // text-gray-200
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // text-gray-400
        },
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)', // gray-600 with opacity
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // text-gray-400
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-4">
        <Navbar/>
        <div className="grid m-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 p-3 rounded-lg shadow-md animate-pulse">
              <div className="h-10 bg-zinc-800 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-zinc-800 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-zinc-900 p-2 rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-zinc-800 rounded w-1/3 mb-10"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col">
      <GrainOverlay />
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow mt-16 relative z-10">
        {user ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Calories Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Calories</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-violet-400 text-2xl font-bold">
                      {todayStats.caloriesConsumed.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Consumed (kcal)</p>
                  </div>
                  <div>
                    <p className="text-green-400 text-2xl font-bold">
                      {todayStats.caloriesBurned.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Burned (kcal)</p>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm">Net Calories:</p>
                    <p className={`text-xl font-bold ${
                      todayStats.caloriesConsumed - todayStats.caloriesBurned > 0 
                        ? 'text-red-400' 
                        : 'text-green-400'
                    }`}>
                      {(todayStats.caloriesConsumed - todayStats.caloriesBurned).toLocaleString()} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* Weight Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Weight</h2>
                <p className="text-violet-400 text-2xl font-bold">{todayStats.weight}</p>
                <p className="text-gray-400 text-sm">Today's Weight</p>
              </div>

              {/* Sleep Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Sleep</h2>
                <p className="text-violet-400 text-2xl font-bold">{todayStats.sleepHours} hours</p>
                <p className="text-gray-400 text-sm">Last Night's Sleep</p>
              </div>

              {/* Activities Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Activities</h2>
                <p className="text-violet-400 text-2xl font-bold">{todayStats.activities.length}</p>
                <p className="text-gray-400 text-sm">Today's Activities</p>
              </div>
            </div>

            {/* Calorie Tracking Graph */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Calorie Tracking</h2>
              <div className="h-80">
                <Line data={calorieChartData} options={calorieChartOptions} />
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p>This graph shows your calories consumed vs burned over the past 7 days.</p>
                <p className="mt-2">
                  Today's calories consumed: <span className="text-pink-400">{todayStats.caloriesConsumed.toLocaleString()} calories</span>
                  <br />
                  Today's calories burned: <span className="text-green-400">{todayStats.caloriesBurned.toLocaleString()} calories</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Activity Summary</h2>
                {activitySummary ? (
                  <div>
                    <p className="text-violet-400 text-2xl font-bold">{activitySummary.total_activities}</p>
                    <p className="text-gray-400 text-sm">Total Activities</p>
                    <p className="text-violet-400 text-2xl font-bold">{activitySummary.total_calories_burned}</p>
                    <p className="text-gray-400 text-sm">Total Calories Burned</p>
                  </div>
                ) : (
                  <p className="text-gray-400">Loading activity summary...</p>
                )}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Medical Information</h2>
                {medicalHistory.length > 0 ? (
                  <ul>
                    {medicalHistory.map((record, index) => (
                      <li key={index} className="mb-2">
                        <strong>Condition:</strong> {record.condition} <br />
                        <strong>Diagnosis Date:</strong> {record.diagnosis_date} <br />
                        {record.treatment && <><strong>Treatment:</strong> {record.treatment} <br /></>}
                        {record.medications && <><strong>Medications:</strong> {record.medications}</>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No medical history available.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Recommendations</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gray-700/30 rounded-lg"
                  >
                    <span className="text-violet-400 text-xl">💡</span>
                    <p className="text-gray-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Activity Goals To Improve Health
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Coaching that fits you. Achieve your fitness goals through customised coaching and 
                actionable tips based on your health and activity history.
              </p>
              <div className="space-y-4">
                <p className="text-gray-400 text-lg">
                  Track your daily activities, monitor your progress, and get personalized recommendations
                </p>
                <ul className="text-gray-400 space-y-2 mb-8">
                  <li>• Track calories burned and consumed</li>
                  <li>• Monitor sleep patterns</li>
                  <li>• Log daily activities</li>
                  <li>• Set and achieve fitness goals</li>
                </ul>
                <Link 
                  href="/login"
                  className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;

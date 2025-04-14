"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/navbar";
import { supabase } from "./utils/supabaseClient";
import { fetchUserProfile, fetchWeightData, fetchSleepData, fetchActivityData, fetchCalorieData } from "./utils/api";
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    sleepHours: 0,
    weight: 'Not logged',
    activities: 0
  });
  const [error, setError] = useState<string | null>(null);
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
        caloriesBurned: todayCalories?.calories_burned || todayBurnedCalories || 0,
        sleepHours: todaySleep?.hours || 0,
        weight: todayWeight ? `${todayWeight.weight} kg` : 'Not logged',
        activities: activityLogs.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchDashboardData();
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
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-violet-400 text-2xl font-bold">{todayStats.activities}</p>
                <p className="text-gray-400 text-sm">Today's Activities</p>
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

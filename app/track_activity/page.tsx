"use client";

import AuthGuard from "../utils/authGuard";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { Weight, Flame, Moon, Activity, User } from 'lucide-react';

const TrackActivity = () => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-gray-200 p-20">
        <h1 className="text-4xl font-bold text-center mb-12">Track Your Activities</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Weight Tracking Section */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleNavigation("/tracking/weight")}
          >
            <Weight className="w-10 h-10 mx-auto text-violet-400 mb-4" />
            <h2 className="text-2xl font-semibold">Weight Tracking</h2>
            <p className="text-gray-400 mt-2">Analyze your weight trends with graphs.</p>
          </div>

          {/* Calorie Tracking Section */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleNavigation("/tracking/calories")}
          >
            <Flame className="w-10 h-10 mx-auto text-violet-400 mb-4" />
            <h2 className="text-2xl font-semibold">Calorie Tracking</h2>
            <p className="text-gray-400 mt-2">Monitor your calorie intake and burn.</p>
          </div>

          {/* Sleep Tracking Section */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleNavigation("/tracking/sleep")}
          >
            <Moon className="w-10 h-10 mx-auto text-violet-400 mb-4" />
            <h2 className="text-2xl font-semibold">Sleep Tracking</h2>
            <p className="text-gray-400 mt-2">Track and analyze your sleep patterns.</p>
          </div>

          {/* Activity Tracking Section */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleNavigation("/tracking/activity")}
          >
            <Activity className="w-10 h-10 mx-auto text-violet-400 mb-4" />
            <h2 className="text-2xl font-semibold">Activity Tracking</h2>
            <p className="text-gray-400 mt-2">Log and monitor your physical activities and exercise.</p>
          </div>

          {/* Get Assistant Section */}
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleNavigation("/assistant")}
          >
            <User className="w-10 h-10 mx-auto text-violet-400 mb-4" />
            <h2 className="text-2xl font-semibold">Get Assistant</h2>
            <p className="text-gray-400 mt-2">Get personalized assistance and recommendations.</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default TrackActivity;

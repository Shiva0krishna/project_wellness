"use client";

import AuthGuard from "../utils/authGuard";
import Navbar from "../components/navbar";
import { useRouter } from "next/navigation";

const TrackActivity = () => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-gray-800 text-gray-200 p-20">
        <h1 className="text-3xl font-semibold text-center mb-8">Track Your Activities</h1>
        <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
          {/* Weight Tracking Section */}
          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition"
            onClick={() => handleNavigation("/tracking/weight")}
          >
            <h2 className="text-xl font-semibold">Weight Tracking</h2>
            <p className="text-gray-400 mt-2 text-sm">Analyze your weight trends with graphs.</p>
          </div>

          {/* Calorie Tracking Section */}
          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition"
            onClick={() => handleNavigation("/tracking/calories")}
          >
            <h2 className="text-xl font-semibold">Calorie Tracking</h2>
            <p className="text-gray-400 mt-2 text-sm">Monitor your calorie intake and burn.</p>
          </div>

          {/* Sleep Tracking Section */}
          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition"
            onClick={() => handleNavigation("/tracking/sleep")}
          >
            <h2 className="text-xl font-semibold">Sleep Tracking</h2>
            <p className="text-gray-400 mt-2 text-sm">Track and analyze your sleep patterns.</p>
          </div>

          {/* Activity Tracking Section */}
          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition"
            onClick={() => handleNavigation("/tracking/activity")}
          >
            <h2 className="text-xl font-semibold">Activity Tracking</h2>
            <p className="text-gray-400 mt-2 text-sm">Log and monitor your physical activities and exercise.</p>
          </div>

          {/* Get Assistant Section */}
          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition"
            onClick={() => handleNavigation("/assistant")}
          >
            <h2 className="text-xl font-semibold">Get Assistant</h2>
            <p className="text-gray-400 mt-2 text-sm">Get personalized assistance and recommendations.</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default TrackActivity;

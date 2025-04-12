"use client";

import { useRouter } from "next/navigation";

interface TrackingSectionsProps {
  currentSection: string;
}

const TrackingSections = ({ currentSection }: TrackingSectionsProps) => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      {/* Weight Tracking Section */}
      <div
        className={`bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition ${
          currentSection === "weight" ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => handleNavigation("/tracking/weight")}
      >
        <h2 className="text-xl font-semibold">Weight Tracking</h2>
        <p className="text-gray-400 mt-2 text-sm">Analyze your weight trends with graphs.</p>
      </div>

      {/* Calorie Tracking Section */}
      <div
        className={`bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition ${
          currentSection === "calories" ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => handleNavigation("/tracking/calories")}
      >
        <h2 className="text-xl font-semibold">Calorie Tracking</h2>
        <p className="text-gray-400 mt-2 text-sm">Monitor your calorie intake and burn.</p>
      </div>

      {/* Sleep Tracking Section */}
      <div
        className={`bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition ${
          currentSection === "sleep" ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => handleNavigation("/tracking/sleep")}
      >
        <h2 className="text-xl font-semibold">Sleep Tracking</h2>
        <p className="text-gray-400 mt-2 text-sm">Track and analyze your sleep patterns.</p>
      </div>

      {/* Get Assistant Section */}
      <div
        className={`bg-gray-700 p-4 rounded-lg shadow-lg text-center cursor-pointer hover:bg-gray-600 transition ${
          currentSection === "assistant" ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => handleNavigation("/assistant")}
      >
        <h2 className="text-xl font-semibold">Get Assistant</h2>
        <p className="text-gray-400 mt-2 text-sm">Get personalized assistance and recommendations.</p>
      </div>
    </div>
  );
};

export default TrackingSections; 
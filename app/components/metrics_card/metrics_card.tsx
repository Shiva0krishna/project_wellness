import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MetricsCardProps {
  title: string;
  subtitle: string;
  description: string;
  metrics: any[];
  primaryMetric: string;
  secondaryMetric?: string;
  unit: string;
}

const MetricsCard = ({ 
  title, 
  subtitle, 
  description, 
  metrics, 
  primaryMetric,
  secondaryMetric,
  unit 
}: MetricsCardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  const filteredMetrics = metrics.filter((entry) => {
    const today = new Date();
    const entryDate = new Date(entry.day);
    
    if (selectedPeriod === "daily") {
      return entryDate.toDateString() === today.toDateString();
    } else if (selectedPeriod === "weekly") {
      const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
      return entryDate >= oneWeekAgo;
    } else {
      const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
      return entryDate >= oneMonthAgo;
    }
  });

  const getLatestValue = () => {
    if (filteredMetrics.length === 0) return null;
    return filteredMetrics[filteredMetrics.length - 1][primaryMetric];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-gray-400">{subtitle}</p>
        <p className="text-gray-300 mt-2">{description}</p>
        
        {getLatestValue() && (
          <div className="mt-4 text-3xl font-bold text-white">
            {getLatestValue()} {unit}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {["daily", "weekly", "monthly"].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as any)}
            className={`px-3 py-1 rounded ${
              selectedPeriod === period 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredMetrics}>
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#374151", border: "none" }}
              labelStyle={{ color: "#9CA3AF" }}
            />
            <Bar dataKey={primaryMetric} fill="#60A5FA" />
            {secondaryMetric && (
              <Bar dataKey={secondaryMetric} fill="#34D399" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default MetricsCard;

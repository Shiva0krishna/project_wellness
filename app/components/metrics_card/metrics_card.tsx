import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type MetricsType = {
  day: string;
  calories: number;
}[];

interface MetricsCardProps {
  title: string;
  subtitle: string;
  description: string;
  period?: string;
  metrics: MetricsType;
}

const MetricsCard = ({
  title,
  subtitle,
  description,
  period,
  metrics,
}: MetricsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <div
        className="bg-gray-900/30 backdrop-blur-md rounded-lg border border-gray-800/30
                    group-hover:border-gray-700/50 transition-all duration-500
                    shadow-[0_0_15px_rgba(0,0,0,0.1)] p-8"
      >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="mono text-sm text-gray-500 tracking-widest">{subtitle}</div>
          {period && <div className="text-sm text-gray-500">{period}</div>}
          <h3 className="text-2xl md:text-3xl font-light tracking-tight">{title}</h3>
          <p className="text-gray-400 max-w-2xl">{description}</p>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="my-6"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fill: "#ccc" }} />
              <YAxis tick={{ fill: "#ccc" }} />
              <Tooltip contentStyle={{ backgroundColor: "#333", borderRadius: "5px" }} />
              <Bar dataKey="calories" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MetricsCard;
export type { MetricsCardProps };

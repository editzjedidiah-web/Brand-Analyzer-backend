"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CompetitorChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-10 bg-gray-900 p-6 rounded">
      <h3 className="text-xl font-bold mb-4">
        Competitive Positioning
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="username" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

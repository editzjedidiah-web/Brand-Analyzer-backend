"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function CompetitorCharts({ competitors = [] }) {
  if (!competitors.length) {
    return (
      <div className="p-6 border border-gray-800 rounded-xl text-gray-400">
        No competitor data available yet.
      </div>
    );
  }

  const data = competitors.map(c => ({
    name: c.username,
    followers: c.followers,
    engagement: c.analysis_reports?.avg_engagement || 0
  }));

  return (
    <div className="space-y-8">
      {/* Followers */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold mb-3">Follower Comparison</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="followers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold mb-3">Engagement Rate (%)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="engagement" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

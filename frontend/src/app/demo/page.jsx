"use client";

import { useEffect, useState } from "react";

export default function DemoPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/demo")
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="p-10">Loading demo...</p>;

  return (
    <main className="p-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">
        Investor Demo — Social Analyzer
      </h1>

      <p className="text-gray-400 mb-6">
        This is a live demonstration of the platform’s capabilities.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Followers" value={data.account.followers} />
        <Stat label="Score" value={data.report.score} />
        <Stat label="Tier" value={data.report.tier} />
        <Stat label="Engagement" value={`${data.report.engagement}%`} />
      </div>

      <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
      <ul className="list-disc pl-5 text-gray-300 mb-6">
        {data.insights.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Competitors</h2>
      <table className="w-full border border-gray-800">
        <tbody>
          {data.competitors.map(c => (
            <tr key={c.username} className="border-t border-gray-800">
              <td className="p-2">#{c.rank}</td>
              <td className="p-2">{c.username}</td>
              <td className="p-2">{c.score}</td>
              <td className="p-2">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function PublicReport({ params }) {
  const { username } = params;
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/public/${username}`)
      .then(res => res.json())
      .then(setData);
  }, [username]);

  if (!data) return <p className="p-10">Loading report...</p>;

  return (
    <main className="p-10 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">@{username} — Public Report</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
        <ul className="list-disc pl-5 text-gray-300">
          {data.insights.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Competitors</h2>
        <table className="w-full border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-2">Rank</th>
              <th className="p-2">Username</th>
              <th className="p-2">Score</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
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
      </section>
    </main>
  );
}

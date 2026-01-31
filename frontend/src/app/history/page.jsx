"use client";

import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/history", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(res => setItems(res.data || []));
  }, []);

  return (
    <main className="p-10 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Analysis History</h1>

      {items.length === 0 && (
        <p className="text-gray-400">No reports yet.</p>
      )}

      <ul className="space-y-4">
        {items.map((r, i) => (
          <li key={i} className="bg-gray-900 p-4 rounded border border-gray-800">
            <p className="font-semibold">@{r.accounts.username}</p>
            <p className="text-sm text-gray-400">
              Score: {r.analysis_reports.score}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}

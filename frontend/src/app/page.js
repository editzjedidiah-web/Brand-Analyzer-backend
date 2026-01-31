"use client";

import { useState } from "react";
import { analyzeAccount } from "@/lib/api";
import { getCompetitors } from "@/lib/competitors";
import { supabase } from "@/lib/supabase";
import CompetitorCharts from "@/components/CompetitorCharts";
import CompetitorInsights from "@/components/CompetitorInsights";
import { exportCompetitorsCSV } from "@/lib/csv";
import Head from "next/head";
// import FlowWave from "@/components/FlowWave";

export default function Home() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const isPro = data?.meta?.plan === "pro";

  function trimCompetitorsList(list, isProFlag) {
    if (!Array.isArray(list)) return [];
    if (isProFlag) return list;
    return list.slice(0, 3);
  }

  const trimmedCompetitors = trimCompetitorsList(competitors, isPro);
  const locked = !isPro && Array.isArray(competitors) && competitors.length > 3;

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setCompetitors([]);

    try {
      const result = await analyzeAccount(username);
      setData(result);

      try {
        const comp = await getCompetitors(username);
        setCompetitors(comp.data || []);
      } catch (err) {
        if (err.message.includes("locked")) {
          setCompetitors(null); // locked state
        } else {
          setCompetitors([]);
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://brandanalyzer.lovable.app/auth/callback",
      },
    });
  }

  async function copyPublicLink() {
    const url = `${window.location.origin}/public/${encodeURIComponent(
      username
    )}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy public link", err);
    }
  }

  return (
    <>
      <Head>
        <title>{username ? `@${username} Social Performance Report` : "Social Analyzer"}</title>
        <meta
          name="description"
          content={
            username
              ? `AI-powered social analytics and competitor insights for @${username}.`
              : "AI-powered social analytics and competitor insights."
          }
        />
      </Head>

      <main className="p-10 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Social Analyzer</h1>

      <div className="mb-6">
        <button
          onClick={signIn}
          className="px-4 py-2 bg-red-600 rounded text-white font-semibold"
        >
          Sign in with Google
        </button>
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mb-6">
        <input
          className="px-4 py-2 text-black rounded w-64"
          placeholder="Instagram username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Upgrade to compare this account against similar brands
      </p>

      {loading && (
        <div className="mt-6 text-gray-400 animate-pulse">
          Analyzing account… this takes ~3 seconds
        </div>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {/* ANALYTICS */}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Stat label="Followers" value={data.data.account.followers} />
            <Stat label="Posts" value={data.data.report.posts_per_account} />
            <Stat
              label="Engagement / Post"
              value={data.data.report.engagement_per_post}
            />
            <Stat label="Growth Score" value={data.data.report.growth_score} />
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Plan: {data.meta.plan || "free"} • Generated{" "}
            {new Date(data.meta.generated_at).toLocaleTimeString()}
          </div>
        </>
      )}

    {/* COMPETITORS */}
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Competitor Comparison</h2>

      {competitors === null ? (
        <LockedFeature />
      ) : (trimmedCompetitors.length || competitors.length > 0) ? (
        <>
          <CompetitorCharts competitors={trimmedCompetitors} />
          <CompetitorInsights competitors={trimmedCompetitors} />

          {/* CSV EXPORT — PRO ONLY */}
          {data?.meta?.plan === "pro" ? (
            <div className="mt-6">
              <button
                onClick={() =>
                  window.open(
                    `http://localhost:4000/public/competitors/${username}`,
                    "_blank"
                  )
                }
                className="px-4 py-2 rounded-lg bg-white text-black font-semibold"
              >
                Export CSV
              </button>
            </div>
          ) : (
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm text-gray-400">
              CSV export is available on the Pro plan
            </div>
          )}

          <table className="w-full mt-6 text-left border border-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-2">Rank</th>
                <th className="p-2">Brand</th>
                <th className="p-2">Score</th>
                <th className="p-2">Tier</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {trimmedCompetitors.map((c, i) => (
                <tr
                  key={c.username}
                  className={`border-t border-gray-800 ${!isPro && i >= 3 ? "blur-sm" : ""}`}
                >
                  <td className="p-2">#{c.rank}</td>
                  <td className="p-2">{c.username}</td>
                  <td className="p-2">{c.score}</td>
                  <td className="p-2">{c.tier}</td>
                  <td
                    className={`p-2 font-bold ${
                      c.status === "Ahead"
                        ? "text-green-400"
                        : c.status === "Behind"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {c.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {user?.plan === "pro" ? (
            <a
              href={`http://localhost:4000/export/competitors/${username}`}
              className="bg-indigo-600 px-4 py-2 rounded font-medium"
            >
              Export CSV
            </a>
          ) : (
            <div className="text-sm text-gray-400">
              CSV export is a <span className="text-indigo-400">Pro feature</span>
           </div>
          )}

          {locked && (
            <div className="mt-4 p-4 border border-yellow-600 bg-yellow-900/20 rounded">
              <p className="text-yellow-400 font-semibold">
                🔒 Upgrade to unlock full competitor analysis
              </p>
              <a
                href="https://whop.com/checkout/YOUR_PRODUCT_ID"
                className="inline-block mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black font-bold"
              >
                Upgrade Now
              </a>
            </div>
          )}

          <div className="mt-4">
            <a
              href={`${window.location.origin}/public/${encodeURIComponent(
                username
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded text-white"
            >
              View Public Report
            </a>

            <a
              href="http://localhost:4000/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 ml-3 px-4 py-2 bg-purple-600 rounded font-semibold text-white"
            >
              View Demo Report
            </a>

            <button
              onClick={copyPublicLink}
              className="ml-3 px-4 py-2 bg-gray-700 rounded"
            >
              {copied ? "Copied!" : "Copy Public Link"}
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-400 mt-4">No competitors found.</p>
      )}
    </div>

      {/* OPTIONAL VISUAL */}
      {/* <FlowWave /> */}
    </main>
    </>
  );
}

/* ===========================
   COMPONENTS
=========================== */

function Stat({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function LockedFeature() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 text-center mt-6">
      <h3 className="text-xl font-bold mb-2">Unlock Competitive Intelligence</h3>
      <p className="text-gray-400 mb-4">
        See trends, charts, insights, and export competitor data.
      </p>
      <button
        type="button"
        onClick={() => (window.location.href = "https://whop.com/checkout/YOUR_PRODUCT")}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}

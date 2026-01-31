import express from "express";
import supabase from "../services/supabase.js";
import requireUser from "../middleware/requireUser.js";
import requirePro from "../middleware/requirePro.js";
import { planGuard } from "../middleware/planGuard.js";
import { usageGuard } from "../middleware/usageGuard.js";
import featureGuard from "../middleware/featureGuard.js";
import { getCompetitorsData } from "../services/competitors.service.js";
import { generateInsights } from "../lib/insights.js";

const router = express.Router();

// PRO-only: fetch competitors by query ?username=
router.get(
  "/competitors",
  requirePro,
  async (req, res) => {
    try {
      const username = req.query.username;
      if (!username) return res.status(400).json({ error: "username required" });

      const result = await getCompetitorsData(username);
      if (!result || !result.competitors) {
        return res.status(404).json({ error: "Account not found" });
      }

      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch competitors" });
    }
  }
);

router.get(
  "/:username/competitors",
  requireUser,
  planGuard,
  usageGuard,
  featureGuard("competitors"),
  async (req, res) => {
    try {
      const { username } = req.params;

      const result = await getCompetitorsData(username);
      if (!result || !result.competitors || result.competitors.length === 0) {
        return res.status(404).json({ error: "Account not found" });
      }

      const { competitors, baseScore } = result;

      // build a report object suitable for insights generation
      const reportData = { competitors, baseScore };
      const insights = generateInsights(reportData);

      return res.json({ competitors, insights });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch competitors" });
    }
  }
);

// CSV EXPORT (FEATURE-GATED)
router.get(
  "/export/competitors/:username",
  requireUser,
  planGuard,
  featureGuard("export"),
  async (req, res) => {
    try {
      const { username } = req.params;

      // 1️⃣ Target account
      const { data: account } = await supabase
        .from("accounts")
        .select("id, followers")
        .eq("username", username)
        .single();

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // 2️⃣ Competitor range
      const minFollowers = Math.floor(account.followers * 0.7);
      const maxFollowers = Math.ceil(account.followers * 1.3);

      // 3️⃣ Fetch competitors
      const { data: rows } = await supabase
        .from("accounts")
        .select(`
            id,
            username,
            followers,
            analysis_reports (
              score,
              tier
            )
          `)
        .gte("followers", minFollowers)
        .lte("followers", maxFollowers)
        .neq("id", account.id)
        .limit(100);

      const baseReport = await supabase
        .from("analysis_reports")
        .select("score")
        .eq("account_id", account.id)
        .single();

      const baseScore = baseReport?.data?.score ?? 0;

      const competitors = (rows || [])
        .map((r) => {
          const score = r.analysis_reports?.score ?? 0;
          return {
            username: r.username,
            score,
            tier: r.analysis_reports?.tier ?? "Unranked",
            status:
              score > baseScore
                ? "Ahead"
                : score < baseScore
                ? "Behind"
                : "Equal",
            followers: r.followers,
          };
        })
        .sort((a, b) => b.score - a.score)
        .map((c, i) => ({ rank: i + 1, ...c }));

      // build CSV
      const headers = ["rank", "username", "score", "tier", "status", "followers"];
      const lines = [headers.join(",")];

      for (const c of competitors) {
        const row = [c.rank, c.username, c.score, c.tier, c.status, c.followers]
          .map((v) => (v === null || v === undefined ? "" : String(v).replace(/"/g, '""')))
          .map((v) => (v.includes(",") || v.includes("\n") ? `"${v}"` : v));
        lines.push(row.join(","));
      }

      const csv = lines.join("\n");

      // log usage
      await supabase.from("usage_logs").insert({
        user_id: req.user.id,
        endpoint: "export_competitors",
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="competitors-${username}.csv"`
      );

      return res.send(csv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;

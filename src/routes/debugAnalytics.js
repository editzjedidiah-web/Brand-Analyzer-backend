import express from "express";
import supabase from "../services/supabase.js";

const router = express.Router();

/**
 * GET /debug/analytics/:username
 * Raw analytics verification (no plan guard)
 */
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  // Fetch account
  const { data: account, error: accErr } = await supabase
    .from("accounts")
    .select("id, username, followers")
    .eq("username", username)
    .limit(1)
    .single();

  if (accErr || !account) {
    return res.status(404).json({ error: "Account not found" });
  }

  // Fetch analysis report
  const { data: report, error: repErr } = await supabase
    .from("analysis_reports")
    .select("*")
    .eq("account_id", account.id)
    .single();

  if (repErr || !report) {
    return res.status(404).json({ error: "Analysis not found" });
  }

  res.json({
    account,
    analytics: {
      avg_engagement: report.avg_engagement,
      posts_per_account: report.posts_per_account,
      engagement_per_post: report.engagement_per_post,
      posting_velocity: report.posting_velocity,
      engagement_trend: report.engagement_trend,
      growth_score: report.growth_score,
      score: report.score,
      tier: report.tier,
      brand_fit_index: report.brand_fit_index,
      brand_tier: report.brand_tier,
      anomaly_flag: report.anomaly_flag
    }
  });
});

export default router;

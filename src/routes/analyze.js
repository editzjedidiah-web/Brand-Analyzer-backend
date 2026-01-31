import express from "express";
import supabase from "../services/supabase.js";
import requireUser from "../middleware/requireUser.js";
import burstGuard from "../middleware/burstGuard.js";
import { planGuard } from "../middleware/planGuard.js";
import { usageGuard } from "../middleware/usageGuard.js";
import featureGuard from "../middleware/featureGuard.js";
import { updateAnomalyFlag } from "../services/analytics.js";
import { getCache, setCache } from "../services/cache.js";
import { generateBrandInsights } from "../services/brandAI.js";
import { getCompetitorsData } from "../services/competitors.service.js";
import { generateInsights } from "../services/insights.service.js";
import { saveReport } from "../services/reportHistory.js";


const router = express.Router();

/* ===========================
   HEALTH CHECK
=========================== */
router.get("/ping", (_, res) => {
  res.json({ alive: true });
});


/* ===========================
   ANALYZE ACCOUNT
=========================== */
router.get(
  "/:username",
  requireUser,
  planGuard,
  burstGuard(5, 10000),
  usageGuard,
  async (req, res) => {
    try {
      const { username } = req.params;
      const plan = req.user.plan;

      // ✅ CACHE CHECK (NOW VALID)
      const cacheKey = `analyze:${username}:${plan}`;
      const cached = getCache(cacheKey);

      if (cached) {
        return res.json({
          success: true,
          cached: true,
          ...cached,
        });
      }

      // TEMP user until Whop auth
      const WHOP_USER_ID = "demo-user";

      // 1️⃣ User
      const { data: user } = await supabase
        .from("users")
        .select("id, plan")
        .eq("whop_user_id", WHOP_USER_ID)
        .single();

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // 2️⃣ Account
      const { data: account } = await supabase
        .from("accounts")
        .select("*")
        .eq("username", username)
        .single();

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // 3️⃣ Update anomaly
      await updateAnomalyFlag(account.id);

      // 4️⃣ Report
      const { data: report } = await supabase
        .from("analysis_reports")
        .select("*")
        .eq("account_id", account.id)
        .single();

      // 4.1️⃣ Persist saved report for the current user
      await supabase.from("saved_reports").insert({
        user_id: req.user.id,
        account_id: account.id,
        report_id: report.id,
      });

      // 5️⃣ Log usage
      await supabase.from("usage_logs").insert({
        user_id: user.id,
        endpoint: "analyze",
      });

      // 6️⃣ Competitors + Insights
      const compResult = await getCompetitorsData(username);
      const competitors = compResult?.competitors ?? [];
      const insights = generateInsights({ account: { score: report?.score ?? 0 }, competitors });

      const response = {
        data: { account, report, competitors, insights },
        meta: {
          plan,
          generated_at: new Date().toISOString(),
        },
      };

      // ✅ STORE CACHE
      setCache(cacheKey, response, 60_000);

      // Persist generated report into history for this user (best-effort)
      try {
        await saveReport({
          userId: req.user?.id,
          username,
          score: report?.score ?? 0,
          tier: report?.tier ?? null,
          insights,
          competitors,
        });
      } catch (e) {
        console.error("Failed to save report history:", e);
      }

      return res.json({ success: true, ...response });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

/* ===========================
   ANOMALY (FEATURE-GATED)
=========================== */
router.get(
  "/:username/anomaly",
  requireUser,
  planGuard,
  usageGuard,
  featureGuard("anomaly"),
  async (req, res) => {
    try {
      const { username } = req.params;
      const plan = req.user.plan;

      // cache key
      const cacheKey = `anomaly:${username}:${plan}`;
      const cached = getCache(cacheKey);
      const insights = generateBrandInsights(report);

      if (cached) {
        return res.json({ success: true, cached: true, ...cached });
      }

      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("username", username)
        .single();

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const { data: report } = await supabase
        .from("analysis_reports")
        .select(
          `anomaly_flag, engagement_per_post, posting_velocity, growth_score, tier, brand_tier, post_count`
        )
        .eq("account_id", account.id)
        .single();

      await supabase.from("usage_logs").insert({
        user_id: req.user.id,
        endpoint: "anomaly",
      });

      const response = {
        data: {
          account,
          analytics: {
            postCount: report?.post_count ?? 0,
            engagementPerPost: report?.engagement_per_post ?? 0,
            postingVelocity: report?.posting_velocity ?? 0,
            growthScore: report?.growth_score ?? 0,
            tier: report?.tier ?? "Unranked",
            brandTier: report?.brand_tier ?? null,
            anomaly: report?.anomaly_flag ?? false,
          },
          plan,
        },
        meta: {
          generated_at: new Date().toISOString(),
        },
      };

      setCache(cacheKey, response, 60_000);
      
      await supabase.from("report_history").insert({
        user_id: req.user.id,
        username,
        report,
      });
      return res.json({ success: true, ...response });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

export default router;

import express from "express";
import supabase from "../services/supabase.js";
import { getCompetitorsData } from "../services/competitors.service.js";
import { generateInsights } from "../services/insights.service.js";
import { getCachedReport, setCachedReport } from "../services/publicCache.js";
import { saveReport } from "../services/reportHistory.js";
import crypto from "crypto";
import {validateUsername} from "../middleware/validateUsername.js";
import publicRateLimit from "../middleware/publicRateLimit.js";
import { trimCompetitors } from "../services/competitorTrim.js";

const router = express.Router();


/**
 * GET /public/:username
 * Public shareable report (NO AUTH)
 */
router.get(
  "/:username",
  publicRateLimit,
  validateUsername,
  async (req, res) => {
    try {
      const { username } = req.params;

      // 1️⃣ Cache check
      const cached = getCachedReport(username);
      if (cached) {
        return res.json(cached);
      }

      // 2️⃣ Get account (SAFE FIELDS ONLY)
      const { data: account } = await supabase
        .from("accounts")
        .select("id, username")
        .eq("username", username)
        .single();

      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // 3️⃣ Competitors
      const competitorResult = await getCompetitorsData(username);
      if (!competitorResult) {
        return res.status(404).json({ error: "No data available" });
      }

      const { competitors } = competitorResult;

      // 4️⃣ AI Insights (PUBLIC SAFE)
      const insights = generateInsights({
        account: { score: competitorResult.baseScore },
        competitors,
      });

      // 5️⃣ Public payload (SANITIZED)
      const payload = {
        username,
        insights,
        competitors,
        generated_at: new Date().toISOString(),
      };

      // 6️⃣ Cache
      setCachedReport(username, payload);

      // 7️⃣ Save history (public) and generate a short share id
      const shareId = crypto.randomBytes(6).toString("hex");
      await saveReport({
        userId: null,
        username,
        score: null,
        tier: null,
        insights,
        competitors,
        isPublic: true,
        shareId,
      });

      // include share id in the public payload
      payload.share_id = shareId;

      return res.json(payload);
    } catch (err) {
      console.error("Public report error:", err);
      return res.status(500).json({ error: "Public report failed" });
    }
  }
);

export default router;

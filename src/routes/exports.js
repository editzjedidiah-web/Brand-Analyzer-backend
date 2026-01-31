import express from "express";
import supabase from "../services/supabase.js";
import requireUser from "../middleware/requireUser.js";
import { planGuard } from "../middleware/planGuard.js";
import requirePro from "../middleware/requirePro.js";
import featureGuard from "../middleware/featureGuard.js";


const router = express.Router();

// PRO-ONLY EXPORT (full dataset)
async function exportCsv(req, res) {
  try {
    const { data: competitors } = await supabase
      .from("accounts")
      .select(`
        username,
        followers,
        analysis_reports (
          brand_fit_index,
          brand_tier
        )
      `)
      .eq("platform", "instagram")
      .limit(1000);

    const rows = (competitors || []).map((c) => ({
      username: c.username,
      followers: c.followers,
      score: c.analysis_reports?.brand_fit_index ?? 0,
      tier: c.analysis_reports?.brand_tier ?? "N/A",
    }));

    const csv =
      "username,followers,score,tier\n" +
      rows
        .map((r) =>
          `${r.username},${r.followers},${r.score},${r.tier}`
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="export.csv"`
    );

    return res.send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

router.get(
  "/csv/:username",
  requireUser,
  planGuard("pro"),
  async (req, res) => {
    const { username } = req.params;

    const { data: competitors } = await supabase
      .from("accounts")
      .select(`
        username,
        followers,
        analysis_reports (
          brand_fit_index,
          brand_tier
        )
      `)
      .eq("platform", "instagram");

    const rows = competitors.map((c) => ({
      username: c.username,
      followers: c.followers,
      score: c.analysis_reports?.brand_fit_index ?? 0,
      tier: c.analysis_reports?.brand_tier ?? "N/A",
    }));

    const csv =
      "username,followers,score,tier\n" +
      rows.map(r =>
        `${r.username},${r.followers},${r.score},${r.tier}`
      ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${username}-competitors.csv"`
    );

    res.send(csv);
  }
);


router.get("/export", requirePro, exportCsv);

export default router;

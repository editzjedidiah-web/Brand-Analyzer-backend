import express from "express";
import supabase from "../services/supabase.js";

const router = express.Router();

router.get("/:shareId", async (req, res) => {
  const { shareId } = req.params;

  const { data } = await supabase
    .from("report_history")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (!data) {
    return res.status(404).json({ error: "Not found" });
  }

  const payload = {
    username: data.username,
    score: data.score,
    tier: data.tier,
    insights: data.insights,
    competitors: data.competitors,
    generated_at: data.created_at,
  };

  res.json({
    ...payload,
    shareId,
  });
});

export default router;

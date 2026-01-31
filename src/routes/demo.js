import express from "express";

const router = express.Router();

/**
 * GET /demo
 * Investor / showcase mode (NO AUTH, NO DB)
 */
router.get("/", (req, res) => {
  return res.json({
    success: true,
    demo: true,
    account: {
      username: "demo_brand",
      followers: 12400,
    },
    report: {
      score: 78,
      tier: "A",
      engagement: 4.6,
      growth: "Strong",
    },
    competitors: [
      { rank: 1, username: "brand_one", score: 82, status: "Ahead" },
      { rank: 2, username: "demo_brand", score: 78, status: "You" },
      { rank: 3, username: "brand_two", score: 71, status: "Behind" },
    ],
    insights: [
      "This account outperforms most competitors in engagement.",
      "Growth potential is high with optimized posting frequency.",
      "Brand positioning is strong within its niche.",
    ],
    generated_at: new Date().toISOString(),
  });
});

export default router;

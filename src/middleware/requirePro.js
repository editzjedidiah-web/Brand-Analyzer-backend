export default function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const planValue = String(
    req.user.plan ?? req.user.whop_plan ?? req.user.whopPlan ?? ""
  ).toLowerCase();

  const isPro = /\b(pro|premium|paid)\b/.test(planValue);

  if (!isPro) {
    return res.status(403).json({
      error: "Pro plan required",
      upgrade: true,
    });
  }

  next();
}

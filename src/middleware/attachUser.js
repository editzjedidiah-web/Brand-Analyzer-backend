export default function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.plan !== "pro") {
    return res.status(403).json({
      error: "Pro plan required",
      upgrade: true,
    });
  }

  next();
}

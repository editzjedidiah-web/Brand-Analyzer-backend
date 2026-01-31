const FEATURES = {
  free: [],
  starter: ["competitors"],
  pro: ["competitors", "anomaly", "charts"],
  enterprise: ["competitors", "anomaly", "charts", "export"],
};

export default function featureGuard(feature) {
  return (req, res, next) => {
    const plan = req.user?.plan;

    if (!plan) {
      return res.status(400).json({ error: "Plan missing" });
    }

    const allowed = FEATURES[plan] || [];

    if (!allowed.includes(feature)) {
      return res.status(403).json({
        error: "Feature locked",
        feature,
        plan,
        upgrade: true,
      });
    }

    next();
  };
}

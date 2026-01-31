const hits = new Map();

export default function burstGuard(limit = 10, windowMs = 10_000) {
  return (req, res, next) => {
    const key = req.user.id;
    const now = Date.now();

    const record = hits.get(key) || { count: 0, time: now };

    if (now - record.time > windowMs) {
      record.count = 0;
      record.time = now;
    }

    record.count++;
    hits.set(key, record);

    if (record.count > limit) {
      return res.status(429).json({
        error: "Too many requests",
        retry_after_ms: windowMs,
      });
    }

    next();
  };
}

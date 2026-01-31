export function trackUsage(req, res, next) {
  req.usage = { competitorsChecked: 1 };
  next();
}

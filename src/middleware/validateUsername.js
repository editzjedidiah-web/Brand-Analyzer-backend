export function validateUsername(req, res, next) {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9._]{2,30}$/.test(username)) {
    return res.status(400).json({ error: "Invalid username" });
  }
  next();
}

export default async function requireUser(req, res, next) {
  const WHOP_USER_ID = "demo-user"; // temp

  const { data: user } = await supabase
    .from("users")
    .select("id, plan")
    .eq("whop_user_id", WHOP_USER_ID)
    .single();

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  next();
}

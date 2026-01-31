router.get("/me", requireUser, async (req, res) => {
  const { count } = await supabase
    .from("usage_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", req.user.id);

  res.json({
    plan: req.user.plan,
    used: count,
  });
});

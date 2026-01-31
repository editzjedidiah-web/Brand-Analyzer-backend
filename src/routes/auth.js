router.post("/sync", async (req, res) => {
  const { user } = req.body;

  await supabase.from("users").upsert({
    id: user.id,
    email: user.email,
    plan: "free",
  });

  res.json({ success: true });
});

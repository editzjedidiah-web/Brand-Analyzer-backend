import supabase from "../services/supabase.js";

export async function usageGuard(req, res, next) {
  try {
    const user = req.user;

    // 1️⃣ Fetch plan
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .select("*")
      .eq("name", user.whop_plan)
      .single();

    if (planErr || !plan) {
      return res.status(403).json({ error: "Invalid plan" });
    }

    // 2️⃣ Count this month’s usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error: usageErr } = await supabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("endpoint", "analyze")
      .gte("created_at", startOfMonth.toISOString());

    if (usageErr) {
      return res.status(500).json({ error: "Usage check failed" });
    }

    // 3️⃣ Enforce limit
    if (count >= plan.max_requests_per_month) {
      return res.status(429).json({
        error: "Usage limit exceeded",
        plan: plan.name,
        limit: plan.max_requests_per_month,
      });
    }

    // 4️⃣ Attach plan info for later use
    req.plan = plan;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Usage guard failed" });
  }
}

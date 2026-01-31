import supabase from "../services/supabase.js";

// planGuard can be used two ways:
// - As middleware factory: `planGuard('pro')` -> returns middleware that enforces the plan
// - As direct middleware: `planGuard` -> attaches user (backwards compatible)
export function planGuard(requiredPlan) {
  const handler = async (req, res, next) => {
    try {
      // 1️⃣ Read Whop user from header
      let whopUserId = req.headers["x-whop-user-id"];

      // 🔧 DEV FALLBACK (local testing only)
      if (!whopUserId && process.env.NODE_ENV !== "production") {
        whopUserId = "dev-user";
      }

      if (!whopUserId) {
        return res.status(401).json({ error: "Missing Whop user ID" });
      }

      // 2️⃣ Find or create user
      let { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("whop_user_id", whopUserId)
        .single();

      if (!user) {
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            whop_user_id: whopUserId,
            whop_plan: "free",
          })
          .select()
          .single();

        user = newUser;
      }

      // 3️⃣ Attach user to request
      req.user = user;

      // 4️⃣ If a required plan was provided, enforce it
      if (requiredPlan && typeof requiredPlan === "string") {
        const planValue = String(
          user.plan ?? user.whop_plan ?? user.whopPlan ?? ""
        ).toLowerCase();

        const allowed = /\b(pro|premium|paid)\b/.test(planValue);
        if (!allowed) {
          return res.status(403).json({ error: "Pro plan required", upgrade: true });
        }
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Plan guard failed" });
    }
  };

  // If used directly as middleware: express will call planGuard(req,res,next)
  // In that case, `requiredPlan` will actually be the `req` object. Detect and delegate.
  if (typeof requiredPlan !== "string") {
    const [req, res, next] = arguments;
    return handler(req, res, next);
  }

  return handler;
}

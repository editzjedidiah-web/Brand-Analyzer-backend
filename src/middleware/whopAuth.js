export async function verifyWhopUser(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("Missing Whop token");

  const res = await fetch("https://api.whop.com/api/v2/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Invalid Whop token");

  const whopUser = await res.json();

  return {
    whopUserId: whopUser.id,
    plan: whopUser.plan?.name?.toLowerCase() || "free"
  };
}

export async function verifyWhop(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new Error("Missing token");

  const res = await fetch("https://api.whop.com/api/v2/me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Invalid Whop access");

  const user = await res.json();
  return { id: user.id, plan: user.plan?.name?.toLowerCase() || "free" };
}

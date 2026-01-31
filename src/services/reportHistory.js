import supabase from "./supabase.js";

export async function saveReport({
  userId,
  username,
  score,
  tier,
  insights,
  competitors,
  isPublic = false,
  shareId = null,
}) {
  await supabase.from("report_history").insert({
    user_id: userId,
    username,
    score,
    tier,
    insights,
    competitors,
    is_public: isPublic,
    share_id: shareId,
  });
}

export async function getHistory(userId) {
  const { data } = await supabase
    .from("report_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data || [];
}

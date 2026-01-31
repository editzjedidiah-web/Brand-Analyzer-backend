import supabase from "./supabase.js";

export async function exportCSV(userId) {
  // NOTE: currently exports public Instagram accounts dataset.
  // `userId` parameter is accepted for future per-user scoping.
  const { data: competitors, error } = await supabase
    .from("accounts")
    .select(`
      username,
      followers,
      analysis_reports (
        brand_fit_index,
        brand_tier
      )
    `)
    .eq("platform", "instagram")
    .limit(1000);

  if (error) throw error;

  const rows = (competitors || []).map((c) => ({
    username: c.username,
    followers: c.followers,
    score: c.analysis_reports?.brand_fit_index ?? 0,
    tier: c.analysis_reports?.brand_tier ?? "N/A",
  }));

  const csv =
    "username,followers,score,tier\n" +
    rows
      .map((r) => `${r.username},${r.followers},${r.score},${r.tier}`)
      .join("\n");

  return csv;
}

export default exportCSV;

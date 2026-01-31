import supabase from "./supabase.js";

export async function getCompetitorsData(username) {
  // 1️⃣ Target account
  const { data: account } = await supabase
    .from("accounts")
    .select("id, followers")
    .eq("username", username)
    .single();

  if (!account) return null;

  // 2️⃣ Base score
  const { data: baseReport } = await supabase
    .from("analysis_reports")
    .select("score")
    .eq("account_id", account.id)
    .single();

  const baseScore = baseReport?.score ?? 0;

  // 3️⃣ Range
  const minFollowers = Math.floor(account.followers * 0.7);
  const maxFollowers = Math.ceil(account.followers * 1.3);

  // 4️⃣ Fetch
  const { data: rows } = await supabase
    .from("accounts")
    .select(`
      id,
      username,
      followers,
      analysis_reports ( score, tier )
    `)
    .gte("followers", minFollowers)
    .lte("followers", maxFollowers)
    .neq("id", account.id)
    .limit(10);

  // 5️⃣ Normalize
  const competitors = (rows || [])
    .map((r) => {
      const score = r.analysis_reports?.score ?? 0;
      return {
        username: r.username,
        score,
        tier: r.analysis_reports?.tier ?? "Unranked",
        status:
          score > baseScore ? "Ahead" :
          score < baseScore ? "Behind" :
          "Equal",
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ rank: i + 1, ...c }));

  return { competitors, baseScore };
}

// Fetch competitors by account id (returns same shape as getCompetitorsData)
export async function getCompetitors(accountId, limit = 3) {
  // 1️⃣ Target account
  const { data: account } = await supabase
    .from("accounts")
    .select("id, followers, username")
    .eq("id", accountId)
    .single();

  if (!account) return null;

  // 2️⃣ Base score
  const { data: baseReport } = await supabase
    .from("analysis_reports")
    .select("score")
    .eq("account_id", account.id)
    .single();

  const baseScore = baseReport?.score ?? 0;

  // 3️⃣ Range
  const minFollowers = Math.floor(account.followers * 0.7);
  const maxFollowers = Math.ceil(account.followers * 1.3);

  // 4️⃣ Fetch
  const { data: rows } = await supabase
    .from("accounts")
    .select(`
      id,
      username,
      followers,
      analysis_reports ( score, tier )
    `)
    .gte("followers", minFollowers)
    .lte("followers", maxFollowers)
    .neq("id", account.id)
    .limit(limit);

  // 5️⃣ Normalize
  const competitors = (rows || [])
    .map((r) => {
      const score = r.analysis_reports?.score ?? 0;
      return {
        username: r.username,
        score,
        tier: r.analysis_reports?.tier ?? "Unranked",
        status:
          score > baseScore ? "Ahead" :
          score < baseScore ? "Behind" :
          "Equal",
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((c, i) => ({ rank: i + 1, ...c }));

  return competitors.slice(0, limit);
}

import supabase from "../services/supabase.js";

/**
 * Detect engagement anomaly
 */
export async function computeAnomaly(accountId) {
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("likes, comments")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!recentPosts || recentPosts.length < 3) {
    return false;
  }

  const recentAvg =
    recentPosts.reduce((s, p) => s + p.likes + p.comments, 0) / 3;

  const { data: allPosts } = await supabase
    .from("posts")
    .select("likes, comments")
    .eq("account_id", accountId);

  if (!allPosts || allPosts.length === 0) {
    return false;
  }

  const historicalAvg =
    allPosts.reduce((s, p) => s + p.likes + p.comments, 0) /
    allPosts.length;

  return recentAvg >= historicalAvg * 2;
}

/**
 * Persist anomaly flag
 */
export async function updateAnomalyFlag(accountId) {
  const isAnomaly = await computeAnomaly(accountId);

  await supabase
    .from("analysis_reports")
    .update({ anomaly_flag: isAnomaly })
    .eq("account_id", accountId);

  return isAnomaly;
}

/**
 * Main analytics recompute
 */
export async function recomputeAnalytics(accountId) {
  const { data: posts } = await supabase
    .from("posts")
    .select("likes, comments, created_at")
    .eq("account_id", accountId);

  if (!posts || posts.length === 0) {
    throw new Error("No posts found");
  }

  const totalPosts = posts.length;

  const engagementPerPost =
    posts.reduce((s, p) => s + p.likes + p.comments, 0) / totalPosts;

  const dates = posts.map((p) => new Date(p.created_at));
  const days =
    (Math.max(...dates) - Math.min(...dates)) / 86400000 || 1;

  const postingVelocity = totalPosts / days;

  const now = Date.now();
  const recent = posts.filter(
    (p) => new Date(p.created_at).getTime() >= now - 7 * 86400000
  );
  const older = posts.filter(
    (p) => new Date(p.created_at).getTime() < now - 7 * 86400000
  );

  const recentAvg =
    recent.reduce((s, p) => s + p.likes + p.comments, 0) /
    (recent.length || 1);

  const olderAvg =
    older.reduce((s, p) => s + p.likes + p.comments, 0) /
    (older.length || 1);

  const engagementTrend = recentAvg - olderAvg;

  const growthScore = Math.min(
    100,
    Math.round(postingVelocity * 20 + engagementTrend * 0.5)
  );

  await supabase
    .from("analysis_reports")
    .update({
      posts_per_account: totalPosts,
      engagement_per_post: engagementPerPost,
      posting_velocity: postingVelocity,
      engagement_trend: engagementTrend,
      growth_score: growthScore,
    })
    .eq("account_id", accountId);

  return {
    posts: totalPosts,
    engagementPerPost,
    postingVelocity,
    engagementTrend,
    growthScore,
  };
}

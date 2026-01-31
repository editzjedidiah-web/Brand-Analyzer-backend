export function generateBrandInsights(report) {
  const insights = [];

  if (report.growth_score > 70)
    insights.push("High growth potential – attractive to emerging brands");

  if (report.avg_engagement < 0.02)
    insights.push("Engagement is low for follower count – risk for sponsors");

  if (report.brand_fit_index > 60)
    insights.push("Strong alignment with premium brand campaigns");

  return insights;
}
  
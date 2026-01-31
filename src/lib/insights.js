export function generateInsights(report) {
  const insights = [];

  if (!report || !report.competitors?.length) {
    return ["Not enough data to generate insights."];
  }

  const scores = report.competitors.map(c => c.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const top = report.competitors[0];
  const bottom = report.competitors[report.competitors.length - 1];

  if (report.baseScore > avg) {
    insights.push("This account is performing above the competitive average.");
  } else {
    insights.push("This account is performing below the competitive average.");
  }

  insights.push(
    `Top competitor @${top.username} is ahead by ${top.score - report.baseScore} points.`
  );

  insights.push(
    `Lowest competitor @${bottom.username} trails significantly, suggesting positioning opportunities.`
  );

  if (report.baseScore < top.score * 0.7) {
    insights.push(
      "There is a significant performance gap — strategic content changes are recommended."
    );
  }

  return insights;
}

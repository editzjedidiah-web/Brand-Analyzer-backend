export function generateInsights({ account, competitors }) {
  if (!competitors || competitors.length === 0) {
    return [
      "No competitor data available yet. Analyze more accounts to unlock insights."
    ];
  }

  const avgScore =
    competitors.reduce((sum, c) => sum + c.score, 0) / competitors.length;

  const insights = [];

  if (account.score < avgScore) {
    insights.push(
      "Your account is currently underperforming compared to similar brands."
    );
  } else {
    insights.push(
      "Your account is performing above the average of your competitors."
    );
  }

  const ahead = competitors.filter(c => c.status === "Ahead").length;
  const behind = competitors.filter(c => c.status === "Behind").length;

  if (ahead > behind) {
    insights.push(
      "More competitors are ahead of you than behind — growth optimization is recommended."
    );
  } else {
    insights.push(
      "You are ahead of most competitors — maintain consistency to keep your edge."
    );
  }

  insights.push(
    "Posting consistently and optimizing engagement can significantly improve your growth score."
  );

  return insights;
}

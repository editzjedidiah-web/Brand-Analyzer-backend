export function trimCompetitors(competitors, limit = 3) {
  return competitors
    .slice(0, limit)
    .map(c => ({
      rank: c.rank,
      username: c.username,
      score: c.score,
      status: c.status
    }));
}

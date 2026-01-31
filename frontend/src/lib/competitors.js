export async function getCompetitors(username) {
  const res = await fetch(
    `http://localhost:4000/${username}/competitors`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Competitors unavailable");
  }

  return res.json();
}

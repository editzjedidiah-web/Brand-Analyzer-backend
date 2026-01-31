const API = process.env.NEXT_PUBLIC_API_URL;

export async function analyzeAccount(username) {
  const res = await fetch(`${API}/analyze/${username}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Analyze failed");
  return res.json();
}

export function exportCompetitorsCSV(competitors = []) {
  if (!competitors.length) return;

  const headers = [
    "Username",
    "Followers",
    "Avg Engagement",
    "Score"
  ];

  const rows = competitors.map(c => [
    c.username,
    c.followers,
    c.analysis_reports?.avg_engagement ?? "",
    c.analysis_reports?.score ?? ""
  ]);

  const csv =
    [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "competitor-analysis.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

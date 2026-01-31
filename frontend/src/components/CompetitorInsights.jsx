import  { generateInsights }  from "@/lib/insights";

export default function CompetitorInsights({ competitors }) {
  const insights = generateInsights(competitors);

  return (
    <div className="bg-gray-900 p-4 rounded-xl mt-4">
      <h3 className="font-bold mb-2">Insights</h3>
      <ul className="list-disc pl-5 text-gray-400">
        {insights.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

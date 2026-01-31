export default function LockedCompetitors() {
  return (
    <div className="relative mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6 overflow-hidden">
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10 flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold mb-2">Competitor Analysis Locked</h3>
        <p className="text-gray-400 mb-4 max-w-sm">
          See how you rank against similar brands, uncover gaps, and identify
          opportunities.
        </p>
        <button className="px-5 py-2 bg-indigo-600 rounded font-semibold">
          Upgrade to Pro
        </button>
      </div>

      {/* Fake Preview */}
      <div className="space-y-3 opacity-40">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex justify-between border border-gray-800 p-3 rounded"
          >
            <span>competitor_{i}</span>
            <span>Score: 82</span>
          </div>
        ))}
      </div>
    </div>
  );
}

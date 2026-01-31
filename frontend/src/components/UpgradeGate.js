export default function UpgradeGate({ feature, plan }) {
  if (!plan || plan === "free") {
    return (
      <div className="mt-6 p-4 border border-yellow-500 rounded bg-yellow-900/20">
        <p className="font-bold text-yellow-400">
          Upgrade required
        </p>
        <p className="text-sm text-gray-300">
          {feature} is available on Pro plans and above.
        </p>

        <a
          href="https://whop.com/checkout/YOUR_PRODUCT_ID"
          className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-black rounded"
        >
          Upgrade to Pro

        <button
          onClick={() => window.location.href =
            `${process.env.NEXT_PUBLIC_API_URL}/exports/csv/${username}`
          }
        >
          
        {user?.plan === "pro" ? (
          <a href="/api/exports/csv" className="btn-primary">
            Download CSV
          </a>
        ) : (
          <UpgradeGate />
        )}

        </button>
        </a>
      </div>
    );
  }

  return null;
}

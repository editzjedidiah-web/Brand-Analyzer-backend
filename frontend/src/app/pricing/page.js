export default function Pricing() {
  return (
    <main className="min-h-screen bg-black text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">Pricing</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Plan
          name="Free"
          price="$0"
          features={[
            "Basic account analysis",
            "Limited usage",
            "No competitors",
          ]}
        />

        <Plan
          name="Pro"
          price="$19/mo"
          highlight
          features={[
            "Full analytics",
            "Competitor comparison",
            "Anomaly detection",
            "CSV exports",
          ]}
        />

        <Plan
          name="Enterprise"
          price="Custom"
          features={[
            "Unlimited usage",
            "Advanced insights",
            "Priority support",
          ]}
        />
      </div>
    </main>
  );
}

function Plan({ name, price, features, highlight }) {
  return (
    <div
      className={`border rounded-xl p-6 ${
        highlight
          ? "border-indigo-500 bg-gray-900"
          : "border-gray-800 bg-gray-950"
      }`}
    >
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      <p className="text-3xl font-bold mb-4">{price}</p>

      <ul className="space-y-2 text-gray-400 mb-6">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>

      <button
        onClick={() =>
          window.location.href = "https://whop.com/checkout/YOUR_PRODUCT"
        }
        className="w-full py-2 bg-indigo-600 rounded font-semibold"
      >
        Get Started
      </button>
    </div>
  );
}

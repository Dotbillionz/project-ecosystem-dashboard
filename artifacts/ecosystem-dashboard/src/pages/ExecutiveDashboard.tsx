const kpis = [
  { label: "Platform Uptime", value: "99.95%", trend: "+0.15%" },
  { label: "Deployment Velocity", value: "24 / week", trend: "+4" },
  { label: "Security Alerts", value: "2 open", trend: "-3" },
  { label: "Innovation Lab", value: "67%", trend: "+8%" },
];

const modules = [
  {
    title: "Engineering Control",
    items: [
      "GitHub repo governance + automated code review",
      "CI/CD workflow dispatch via verified webhooks",
      "Release cadence and rollback command center",
    ],
  },
  {
    title: "Payments & Treasury",
    items: [
      "Stripe Connect, Coinbase Commerce, NowPayments",
      "Binance Pay, SumUp gift cards, SpotX token rails",
      "Live transaction monitor with anomaly tagging",
    ],
  },
  {
    title: "Ops & Compliance",
    items: [
      "Slack + Notion synchronization for decision logs",
      "Telegram incident escalation and responder handoff",
      "PCI DSS, GDPR, and KYC/AML posture tracker",
    ],
  },
];

export function ExecutiveDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">CrownOps</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2">Executive Technology Command Center</h1>
        <p className="text-slate-400 mt-3 max-w-3xl">
          Unified visibility for engineering velocity, payment rails, collaboration systems,
          and compliance readiness.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-400">{kpi.label}</p>
            <p className="text-2xl font-semibold mt-2">{kpi.value}</p>
            <p className="text-xs text-emerald-400 mt-2">{kpi.trend} since last week</p>
          </article>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <article key={module.title} className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-lg font-medium">{module.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
              {module.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}

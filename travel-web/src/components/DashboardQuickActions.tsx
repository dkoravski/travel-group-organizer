import Link from "next/link";

const actions = [
  { label: "Create Group", href: "/groups/create" },
  { label: "Create Trip", href: "/trips/create" },
  { label: "Browse Trips", href: "/trips" },
];

export function DashboardQuickActions() {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="quick-actions-heading"
        className="text-xl font-bold tracking-tight text-slate-950"
      >
        Quick Actions
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

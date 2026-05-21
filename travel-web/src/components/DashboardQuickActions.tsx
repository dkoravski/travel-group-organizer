import Link from "next/link";

export function DashboardQuickActions({
  hasManagerAccess,
}: {
  hasManagerAccess: boolean;
}) {
  const actions = [
    { label: "Създай група", href: "/groups/create" },
    ...(hasManagerAccess
      ? [
          { label: "Мениджърски панел", href: "/manager" },
          { label: "Създай пътуване", href: "/trips/create" },
        ]
      : []),
    { label: "Разгледай пътувания", href: "/trips" },
  ];

  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2
        id="quick-actions-heading"
        className="text-xl font-bold tracking-tight text-slate-950"
      >
        Бързи действия
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

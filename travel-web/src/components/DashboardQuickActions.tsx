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
          { label: "Мениджърски панел", href: "/manager?from=dashboard" },
          { label: "Създай пътуване", href: "/trips/create?from=dashboard" },
        ]
      : []),
    { label: "Разгледай пътувания", href: "/trips" },
  ];

  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-900/5"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="quick-actions-heading"
          className="text-1xl font-black tracking-tight text-slate-950"
        >
          Бързи действия
        </h2>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex h-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-lg hover:shadow-emerald-900/10"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

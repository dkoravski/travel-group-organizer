import Link from "next/link";

export type DashboardGroup = {
  id: number;
  name: string;
  description: string | null;
  membersCount: number;
  currentUserRole: "member" | "manager";
};

type DashboardGroupCardProps = {
  group: DashboardGroup;
  from?: string;
};

export function DashboardGroupCard({ group, from }: DashboardGroupCardProps) {
  const roleLabel = group.currentUserRole === "manager" ? "Мениджър" : "Член";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-950">{group.name}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
            {roleLabel}
          </span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {group.description ?? "Няма добавено описание за тази група."}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-600">
          <span className="text-lg font-black text-slate-950">
            {group.membersCount}
          </span>{" "}
          членове
        </p>
        <Link
          href={`/groups/${group.id}${from ? `?from=${from}` : ""}`}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/20"
        >
          Виж групата
        </Link>
      </div>
    </article>
  );
}

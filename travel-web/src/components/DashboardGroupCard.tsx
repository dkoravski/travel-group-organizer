import Link from "next/link";

export type DashboardGroup = {
  id: number;
  name: string;
  description: string | null;
  membersCount: number;
};

type DashboardGroupCardProps = {
  group: DashboardGroup;
};

export function DashboardGroupCard({ group }: DashboardGroupCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-950">{group.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {group.description ?? "Няма добавено описание за тази група."}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-950">
            {group.membersCount}
          </span>{" "}
          участници
        </p>
        <Link
          href={`/groups/${group.id}`}
          className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Виж групата
        </Link>
      </div>
    </article>
  );
}

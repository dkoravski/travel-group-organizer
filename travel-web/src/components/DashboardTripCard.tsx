export type DashboardTrip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  status: "upcoming" | "current";
};

type DashboardTripCardProps = {
  trip: DashboardTrip;
};

const dateFormatter = new Intl.DateTimeFormat("bg-BG", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function DashboardTripCard({ trip }: DashboardTripCardProps) {
  const statusLabel = trip.status === "current" ? "current" : "upcoming";
  const statusClass =
    trip.status === "current"
      ? "bg-sky-100 text-sky-800"
      : "bg-emerald-100 text-emerald-800";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            {trip.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4">
          <dt>Дати</dt>
          <dd className="font-medium text-slate-950">
            {dateFormatter.format(new Date(trip.startDate))} -{" "}
            {dateFormatter.format(new Date(trip.endDate))}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Участници</dt>
          <dd className="font-medium text-slate-950">
            {trip.participantsCount}
          </dd>
        </div>
      </dl>
    </article>
  );
}

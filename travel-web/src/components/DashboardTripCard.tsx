import Link from "next/link";

export type DashboardTrip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  participantsCount: number;
  status: "upcoming" | "current";
  isJoined?: boolean;
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
  const statusLabel = trip.status === "current" ? "В момента" : "Предстоящо";
  const statusClass =
    trip.status === "current"
      ? "bg-sky-100 text-sky-800 ring-sky-200"
      : "bg-emerald-100 text-emerald-800 ring-emerald-200";

  return (
    <Link
      href={`/trips/${trip.id}`}
      aria-label={`Отвори пътуване ${trip.title}`}
      className="group block rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950 transition group-hover:text-emerald-800">
            {trip.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass}`}
          >
            {statusLabel}
          </span>
          {trip.isJoined ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
              Присъединен
            </span>
          ) : null}
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
          <dt>Дати</dt>
          <dd className="font-bold text-slate-950">
            {dateFormatter.format(new Date(trip.startDate))} -{" "}
            {dateFormatter.format(new Date(trip.endDate))}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
          <dt>Участници</dt>
          <dd className="font-bold text-slate-950">
            {trip.participantsCount}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

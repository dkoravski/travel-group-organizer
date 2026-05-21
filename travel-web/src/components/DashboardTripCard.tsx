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
  const statusLabel = trip.status === "current" ? "в момента" : "предстоящо";
  const statusClass =
    trip.status === "current"
      ? "bg-sky-100 text-sky-800"
      : "bg-emerald-100 text-emerald-800";

  return (
    <Link
      href={`/trips/${trip.id}`}
      aria-label={`Отвори пътуване ${trip.title}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{trip.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
          >
            {statusLabel}
          </span>
          {trip.isJoined ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              присъединен
            </span>
          ) : null}
        </div>
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
    </Link>
  );
}

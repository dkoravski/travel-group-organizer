import Link from "next/link";

import { getNearestPublicUpcomingTrip } from "@/services/tripService";

const features = [
  {
    title: "Туристически групи",
    description:
      "Създавайте групи за приятели, семейство или общност и управлявайте членовете на едно място.",
  },
  {
    title: "Планиране на пътувания",
    description:
      "Подредете дати, дестинация, бюджет, капацитет и място на среща без разпилени чатове.",
  },
  {
    title: "Коментари и предпочитания",
    description:
      "Събирайте идеи, въпроси и лични предпочитания за транспорт, настаняване и важни бележки.",
  },
];

export default async function Home() {
  const upcomingTrip = await getNearestPublicUpcomingTrip();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-emerald-800">
            Организирани пътувания без хаос
          </p>
          <h1 className="max-w-3xl text-xl font-black tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
            Планирайте групови приключения с увереност
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Travel Group Organizer събира групи, пътувания, членове,
            коментари и предпочитания в един ясен работен център за малки
            туристически общности.
          </p>
        </div>

        <UpcomingTripCard trip={upcomingTrip} />
      </section>

      <section aria-labelledby="features-heading">
        <p
          id="features-heading"
          className="text-sm font-bold uppercase tracking-wide text-emerald-700"
        >
          Основни възможности
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div className="mb-3 h-1.5 w-12 rounded-full bg-emerald-500" />
              <h3 className="text-base font-bold text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function UpcomingTripCard({
  trip,
}: {
  trip: Awaited<ReturnType<typeof getNearestPublicUpcomingTrip>>;
}) {
  if (!trip) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-2xl shadow-slate-900/10">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Предстоящо пътуване
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
          Все още няма публични предстоящи пътувания
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Създайте публична група и добавете пътуване, за да се появи тук.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/register"
      className="group block rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-emerald-900/15"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            Най-близко пътуване
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            {trip.title}
          </h2>
          <p className="mt-2 text-xs text-slate-600">{trip.destination}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          Активно
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <InfoTile label="Група" value={trip.groupName} />
        <InfoTile
          label="Дати"
          value={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
        />
        <InfoTile label="Участници" value={String(trip.participantsCount)} />
        <InfoTile
          label="Бюджет"
          value={trip.estimatedBudget ? `${trip.estimatedBudget} €` : "Не е зададен"}
        />
      </dl>
      <p className="mt-6 text-sm font-bold text-emerald-700 transition group-hover:text-emerald-800">
        Регистрирайте се, за да организирате подобно пътуване
      </p>
    </Link>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 text-xs font-bold text-slate-950">{value}</dd>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

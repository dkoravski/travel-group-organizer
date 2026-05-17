import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { getAllTrips } from "@/services/tripService";

export default async function TripsPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const onlyMyGroups = searchParams?.scope !== "all";

  const tripRows = await getAllTrips(currentUser.id, onlyMyGroups);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-4">
        <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Назад към Моето табло
        </Link>
      </div>
      <header className="mb-8">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Разглеждане на пътувания
        </h1>
      </header>

      <main>
        {tripRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            {onlyMyGroups ? (
              <div>
                <p>Няма пътувания за вашите групи.</p>
                <p className="mt-3">
                  Може да разгледате всички пътувания{' '}
                  <Link href="/trips?scope=all" className="font-semibold text-emerald-700 underline">
                    тук
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <p>Няма налични пътувания.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tripRows.map((trip) => (
              <article
                key={trip.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                      <h2 className="text-lg font-semibold text-slate-950">{trip.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
                    </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {trip.canceled ? "отменено" : "активно"}
                    </span>
                    {trip.isJoined ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        присъединен
                      </span>
                    ) : null}
                  </div>
                </div>

                <dl className="mt-5 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Група</dt>
                    <dd className="font-medium text-slate-950">{trip.groupName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Дати</dt>
                    <dd className="font-medium text-slate-950">{trip.startDate} - {trip.endDate}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Участници</dt>
                    <dd className="font-medium text-slate-950">{trip.participantsCount}</dd>
                  </div>
                </dl>

                <Link
                  href={`/trips/${trip.id}`}
                  className="mt-5 flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Виж пътуването
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

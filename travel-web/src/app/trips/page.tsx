import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { getTripsPage } from "@/services/tripService";

const TRIPS_PER_PAGE = 3;

function getPositivePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; scope?: string }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const params = await searchParams;
  const onlyMyGroups = params?.scope !== "all";
  const currentPage = getPositivePage(params?.page);

  const tripsPage = await getTripsPage(currentUser.id, {
    page: currentPage,
    pageSize: TRIPS_PER_PAGE,
    onlyMyGroups,
  });
  const tripRows = tripsPage.data;
  const totalPages = Math.max(1, Math.ceil(tripsPage.total / tripsPage.pageSize));

  if (currentPage > totalPages && tripsPage.total > 0) {
    redirect(getTripsPageHref(totalPages, onlyMyGroups));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-4">
        <Link
          href="/dashboard"
          aria-label="Назад към Моето табло"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
        >
          &larr;
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
                  <div className="flex justify-between gap-4">
                    <dt>Коментари</dt>
                    <dd className="font-medium text-slate-950">{trip.commentsCount}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Предпочитания</dt>
                    <dd className="font-medium text-slate-950">{trip.preferencesCount}</dd>
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
        {tripsPage.total > TRIPS_PER_PAGE ? (
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm sm:flex-row">
            <p className="font-medium">
              Страница {currentPage} от {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={getTripsPageHref(Math.max(1, currentPage - 1), onlyMyGroups)}
                aria-disabled={currentPage === 1}
                className="h-10 rounded-md border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Предишна
              </Link>
              <Link
                href={getTripsPageHref(
                  Math.min(totalPages, currentPage + 1),
                  onlyMyGroups,
                )}
                aria-disabled={currentPage === totalPages}
                className="h-10 rounded-md border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Следваща
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function getTripsPageHref(page: number, onlyMyGroups: boolean) {
  const params = new URLSearchParams();

  if (!onlyMyGroups) {
    params.set("scope", "all");
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/trips?${query}` : "/trips";
}

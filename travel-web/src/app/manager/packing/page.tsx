import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";
import { getManagedTrips } from "@/services/tripService";

export default async function ManagerPackingListsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/manager/packing");
  }

  const [managedGroups, managedTrips] = await Promise.all([
    getManagedGroups(currentUser.id),
    getManagedTrips(currentUser.id),
  ]);

  if (managedGroups.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/manager"
        aria-label="Назад към мениджърския панел"
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
      >
        &larr;
      </Link>

      <header className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          Списъци за багаж по пътувания
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Създавайте и редактирайте списъка за багаж за всяко пътуване, което
          управлявате.
        </p>
      </header>

      {managedTrips.length > 0 ? (
        <main className="grid gap-4 md:grid-cols-2">
          {managedTrips.map((trip) => (
            <article
              key={trip.id}
              className="flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-1 flex-col gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-700">
                    {trip.groupName}
                  </p>
                  <h2 className="mt-2 break-words text-lg font-bold tracking-tight text-slate-950">
                    {trip.title}
                  </h2>
                  <p className="mt-1 break-words text-sm text-slate-600">
                    {trip.destination} · {trip.startDate} - {trip.endDate}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {trip.packingItemsCount} артикула
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/trips/${trip.id}/packing/edit?from=manager`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 hover:shadow-emerald-900/20"
                >
                  {trip.packingItemsCount > 0
                    ? "Редактирай списъка"
                    : "Създай списък с багаж"}
                </Link>
                <Link
                  href={`/trips/${trip.id}/packing?from=manager`}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 text-center text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                >
                  Преглед
                </Link>
              </div>
            </article>
          ))}
        </main>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm font-medium text-slate-600">
          Все още няма пътувания в групите, които управлявате.
        </div>
      )}
    </div>
  );
}

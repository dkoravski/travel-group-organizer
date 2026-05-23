import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { togglePackingItemAction } from "@/app/trips/actions";
import { BackArrowButton } from "@/components/BackArrowButton";
import { getCurrentUser } from "@/lib/auth";
import { getTripDetails, getTripPackingItems } from "@/services/tripService";

type PackingListPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function PackingListPage({
  params,
  searchParams,
}: PackingListPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const [requestHeaders, { id }, { from }] = await Promise.all([
    headers(),
    params,
    searchParams,
  ]);
  const tripId = Number(id);
  const referrer = requestHeaders.get("referer") ?? "";
  const showManagerEditButton =
    from === "manager" ||
    referrer.includes("/manager") ||
    referrer.includes(`/trips/${tripId}/packing/edit`);

  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    notFound();
  }

  const packingItems = await getTripPackingItems(tripId, currentUser.id);
  const checkedCount = packingItems.filter((item) => item.checked).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <BackArrowButton
        fallbackHref={`/trips/${trip.id}`}
        label="Назад към пътуването"
      />

      <header className="mt-6 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700">
            {trip.destination}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Списък за багаж
          </h1>
          <p className="mt-2 break-words text-sm text-slate-600">
            {trip.title} · {checkedCount} от {packingItems.length} подготвени
          </p>
        </div>

        {trip.isGroupManager && showManagerEditButton ? (
          <Link
            href={`/trips/${trip.id}/packing/edit?from=manager`}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Редактирай списъка
          </Link>
        ) : null}
      </header>

      <main className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {packingItems.length > 0 ? (
          <div className="space-y-3">
            {packingItems.map((item) => (
              <form
                key={item.id}
                action={togglePackingItemAction}
                className="flex items-start gap-3 rounded-md bg-slate-50 p-4"
              >
                <input type="hidden" name="tripId" value={trip.id} />
                <input type="hidden" name="packingItemId" value={item.id} />
                {showManagerEditButton ? (
                  <input type="hidden" name="from" value="manager" />
                ) : null}
                <input
                  type="hidden"
                  name="checked"
                  value={item.checked ? "false" : "true"}
                />
                <button
                  type="submit"
                  aria-label={
                    item.checked
                      ? `Маркирай "${item.title}" като неподготвен`
                      : `Маркирай "${item.title}" като подготвен`
                  }
                  className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border text-sm font-bold transition ${
                    item.checked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white text-transparent hover:border-emerald-600"
                  }`}
                >
                  ✓
                </button>
                <div>
                  <div
                    className={`font-semibold ${
                      item.checked
                        ? "text-slate-500 line-through"
                        : "text-slate-950"
                    }`}
                  >
                    {item.title}
                  </div>
                  {item.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </form>
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-slate-50 p-5 text-sm text-slate-600">
            Все още няма добавени артикули в списъка за багаж.
          </div>
        )}
      </main>
    </div>
  );
}

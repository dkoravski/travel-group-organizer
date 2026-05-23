import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { updatePackingListAction } from "@/app/trips/actions";
import { BackArrowButton } from "@/components/BackArrowButton";
import { getCurrentUser } from "@/lib/auth";
import { getTripDetails, getTripPackingItems } from "@/services/tripService";

type EditPackingListPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function EditPackingListPage({
  params,
  searchParams,
}: EditPackingListPageProps) {
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
  const sourceFrom = getNavigationSource(from, referrer);
  const sourceQuery = sourceFrom ? `?from=${sourceFrom}` : "";

  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupManager) {
    notFound();
  }

  const packingItems = await getTripPackingItems(tripId, currentUser.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <BackArrowButton
        fallbackHref={`/trips/${trip.id}/packing${sourceQuery}`}
        label="Назад към списъка за багаж"
      />

      <header className="mt-6 mb-8">
        <p className="text-sm font-semibold text-emerald-700">
          {trip.destination}
        </p>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-950">
          Редакция на списък за багаж
        </h1>
        <p className="mt-2 break-words text-sm text-slate-600">
          Добавете по един артикул на ред за пътуването „{trip.title}“.
        </p>
      </header>

      <form
        action={updatePackingListAction}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="tripId" value={trip.id} />
        {sourceFrom ? (
          <input type="hidden" name="from" value={sourceFrom} />
        ) : null}

        <div className="space-y-4">
          {getEditablePackingRows(packingItems).map((item, index) => (
            <div
              key={item.id ?? `new-${index}`}
              className="grid gap-3 rounded-md bg-slate-50 p-4 md:grid-cols-5"
            >
              <input type="hidden" name="itemId" value={item.id ?? ""} />

              <div className="md:col-span-2">
                <label
                  htmlFor={`title-${index}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  Артикул
                </label>
                <input
                  id={`title-${index}`}
                  name="title"
                  type="text"
                  maxLength={180}
                  defaultValue={item.title}
                  placeholder="Добавете артикул"
                  className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor={`description-${index}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  Описание
                </label>
                <input
                  id={`description-${index}`}
                  name="description"
                  type="text"
                  maxLength={1000}
                  defaultValue={item.description ?? ""}
                  placeholder="Кратка бележка към артикула"
                  className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="h-11 cursor-pointer rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Запази списъка
          </button>
        </div>
      </form>
    </div>
  );
}

function getNavigationSource(from: string | undefined, referrer: string) {
  if (from === "manager" || from === "dashboard") {
    return from;
  }

  if (referrer.includes("from=dashboard") || referrer.includes("/dashboard")) {
    return "dashboard";
  }

  if (referrer.includes("from=manager") || referrer.includes("/manager")) {
    return "manager";
  }

  return undefined;
}

function getEditablePackingRows(
  items: Awaited<ReturnType<typeof getTripPackingItems>>,
) {
  const emptyRows = Array.from({ length: Math.max(3, 8 - items.length) }, () => ({
    id: null,
    title: "",
    description: "",
  }));

  return [...items, ...emptyRows];
}

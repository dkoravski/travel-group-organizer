import { notFound, redirect } from "next/navigation";

import { BackArrowButton } from "@/components/BackArrowButton";
import { TripForm } from "@/components/TripForm";
import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";
import { getTripDetails } from "@/services/tripService";

type EditTripPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function EditTripPage({
  params,
  searchParams,
}: EditTripPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const tripId = Number(id);

  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const [trip, groups] = await Promise.all([
    getTripDetails(tripId, currentUser.id),
    getManagedGroups(currentUser.id),
  ]);

  if (!trip || !trip.isGroupManager) {
    notFound();
  }

  const sourceFrom =
    from === "manager" || from === "dashboard" ? from : undefined;
  const sourceQuery = sourceFrom ? `?from=${sourceFrom}` : "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <BackArrowButton
        fallbackHref={`/trips/${trip.id}${sourceQuery}`}
        label="Назад към предишната страница"
      />

      <header className="mt-6 mb-8">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Редакция на пътуване
        </h1>
      </header>

      <TripForm mode="edit" groups={groups} trip={trip} from={sourceFrom} />
    </div>
  );
}

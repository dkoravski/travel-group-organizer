import { redirect } from "next/navigation";

import {
  cancelTripAction,
  joinTripAction,
  leaveTripAction,
} from "@/app/trips/actions";
import { getCurrentUser } from "@/lib/auth";
import { getAllTrips } from "@/services/tripService";

export default async function TripsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripRows = await getAllTrips(currentUser.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Travel Group Organizer
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Browse Trips
        </h1>
      </header>

      <main className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tripRows.map((trip) => (
          <article
            key={trip.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {trip.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {trip.destination}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {trip.canceled ? "canceled" : "active"}
              </span>
            </div>
            <dl className="mt-5 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt>Group</dt>
                <dd className="font-medium text-slate-950">{trip.groupName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Dates</dt>
                <dd className="font-medium text-slate-950">
                  {trip.startDate} - {trip.endDate}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Participants</dt>
                <dd className="font-medium text-slate-950">
                  {trip.participantsCount}
                </dd>
              </div>
            </dl>
            <div className="mt-5 grid gap-2">
              {trip.isJoined ? (
                <form action={leaveTripAction}>
                  <input type="hidden" name="tripId" value={trip.id} />
                  <button
                    type="submit"
                    className="h-10 w-full cursor-pointer rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Leave Trip
                  </button>
                </form>
              ) : (
                <form action={joinTripAction}>
                  <input type="hidden" name="tripId" value={trip.id} />
                  <button
                    type="submit"
                    disabled={trip.canceled}
                    className="h-10 w-full cursor-pointer rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Choose Trip
                  </button>
                </form>
              )}
              {trip.createdBy === currentUser.id && !trip.canceled ? (
                <form action={cancelTripAction}>
                  <input type="hidden" name="tripId" value={trip.id} />
                  <button
                    type="submit"
                    className="h-10 w-full cursor-pointer rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                  >
                    Cancel
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

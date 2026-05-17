import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  cancelTripAction,
  joinTripAction,
  leaveTripAction,
} from "@/app/trips/actions";
import { ShareTripButton } from "@/components/ShareTripButton";
import { getCurrentUser } from "@/lib/auth";
import { getTripDetails } from "@/services/tripService";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TripPage({ params }: TripPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const tripId = Number(id);

  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/trips"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Назад към пътуванията
      </Link>

      <article className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {trip.title}
            </h1>
            <p className="mt-2 text-lg text-slate-600">{trip.destination}</p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {trip.canceled ? "отменено" : "активно"}
          </span>
        </header>

        <dl className="mt-8 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          <InfoRow label="Група" value={trip.groupName} />
          <InfoRow label="Дати" value={`${trip.startDate} - ${trip.endDate}`} />
          <InfoRow label="Участници" value={String(trip.participantsCount)} />
          <InfoRow
            label="Капацитет"
            value={trip.capacity?.toString() ?? "Без ограничение"}
          />
          <InfoRow
            label="Ориентировъчен бюджет"
            value={trip.estimatedBudget ? `${trip.estimatedBudget} лв.` : "Не е зададен"}
          />
          <InfoRow
            label="Място на среща"
            value={trip.meetingPoint ?? "Не е зададено"}
          />
        </dl>

        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Описание
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {trip.description ?? "Няма добавено описание за това пътуване."}
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {trip.isJoined ? (
            <form action={leaveTripAction}>
              <input type="hidden" name="tripId" value={trip.id} />
              <button
                type="submit"
                className="h-10 w-full cursor-pointer rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto"
              >
                Напусни пътуването
              </button>
            </form>
          ) : (
            <form action={joinTripAction}>
              <input type="hidden" name="tripId" value={trip.id} />
              <button
                type="submit"
                disabled={trip.canceled}
                className="h-10 w-full cursor-pointer rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
              >
                Присъедини се
              </button>
            </form>
          )}

          <ShareTripButton tripId={trip.id} />

          {trip.createdBy === currentUser.id && !trip.canceled ? (
            <form action={cancelTripAction}>
              <input type="hidden" name="tripId" value={trip.id} />
              <button
                type="submit"
                className="h-10 w-full cursor-pointer rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 sm:w-auto"
              >
                Отмени
              </button>
            </form>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-slate-50 p-4">
      <dt>{label}</dt>
      <dd className="text-right font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

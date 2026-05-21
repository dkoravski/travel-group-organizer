import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  cancelTripAction,
  joinTripAction,
  leaveTripAction,
} from "@/app/trips/actions";
import { ShareTripButton } from "@/components/ShareTripButton";
import { TripCommentForm } from "@/components/TripCommentForm";
import { TripGuestsForm } from "@/components/TripGuestsForm";
import { getCurrentUser } from "@/lib/auth";
import {
  getTripComments,
  getTripDetails,
  getTripParticipants,
} from "@/services/tripService";

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

  const [participants, comments] = await Promise.all([
    getTripParticipants(tripId),
    getTripComments(tripId),
  ]);

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

        <section className="mt-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">Участници</h2>
          <div className="mt-3 space-y-2">
            {participants.length > 0 ? (
              participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 p-3">
                  <div>
                    <div className="font-semibold text-slate-950">{p.name}</div>
                    <div className="text-sm text-slate-600">{p.email}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-950">
                    {p.guestsCount > 0 ? (
                      `+ ${p.guestsCount} ${p.guestsCount === 1 ? "приятел" : "приятели"}`
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">Все още няма участници.</div>
            )}
          </div>
        </section>

        {trip.isJoined ? (
          <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Добавени приятели
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Към вашето участие има добавени{" "}
              <span className="font-semibold text-slate-950">
                {trip.userGuestsCount}
              </span>{" "}
              приятели.
            </p>

            <TripGuestsForm
              tripId={trip.id}
              guestsCount={trip.userGuestsCount}
            />
          </section>
        ) : null}

        <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Коментари
              </h2>
              <p className="text-sm text-slate-600">
                Обсъдете детайли, въпроси и идеи с групата.
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {comments.length}
            </span>
          </div>

          <TripCommentForm tripId={trip.id} />

          <div className="mt-6 space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-semibold text-slate-950">
                      {comment.userName}
                    </h3>
                    <time className="text-xs font-medium text-slate-500">
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </header>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {comment.content}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-md bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                Все още няма коментари за това пътуване.
              </div>
            )}
          </div>
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
            <form
              action={joinTripAction}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="tripId" value={trip.id} />
              <div className="sm:w-40">
                <label
                  htmlFor="joinGuestsCount"
                  className="block text-sm font-medium text-slate-700"
                >
                  Приятели
                </label>
                <input
                  id="joinGuestsCount"
                  name="guestsCount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
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

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

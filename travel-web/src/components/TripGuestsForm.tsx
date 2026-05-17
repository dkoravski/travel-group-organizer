"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateTripGuestsFormAction,
  type TripGuestsActionState,
} from "@/app/trips/actions";

type TripGuestsFormProps = {
  tripId: number;
  guestsCount: number;
};

const initialState: TripGuestsActionState = {};

export function TripGuestsForm({ tripId, guestsCount }: TripGuestsFormProps) {
  const [state, formAction] = useActionState(
    updateTripGuestsFormAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="tripId" value={tripId} />
      <div className="sm:w-48">
        <label
          htmlFor="guestsCount"
          className="block text-sm font-medium text-slate-700"
        >
          Брой приятели
        </label>
        <input
          id="guestsCount"
          name="guestsCount"
          type="number"
          min={0}
          defaultValue={guestsCount}
          className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        {state.error ? (
          <p className="mt-2 text-sm text-red-700">{state.error}</p>
        ) : null}
        {state.success && state.message ? (
          <p className="trip-message mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {state.message}
          </p>
        ) : null}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 cursor-pointer rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
    >
      {pending ? "Запазване..." : "Запази промяната"}
    </button>
  );
}

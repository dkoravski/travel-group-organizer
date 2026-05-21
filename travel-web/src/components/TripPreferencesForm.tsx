"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  type TripPreferencesActionState,
  updateTripPreferencesFormAction,
} from "@/app/trips/actions";

type TripPreferencesFormProps = {
  tripId: number;
  transportPreference: string | null;
  accommodationPreference: string | null;
  note: string | null;
};

const initialState: TripPreferencesActionState = {};

export function TripPreferencesForm({
  tripId,
  transportPreference,
  accommodationPreference,
  note,
}: TripPreferencesFormProps) {
  const [state, formAction] = useActionState(
    updateTripPreferencesFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="tripId" value={tripId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transportPreference"
            className="block text-sm font-medium text-slate-700"
          >
            Предпочитан транспорт
          </label>
          <input
            id="transportPreference"
            name="transportPreference"
            type="text"
            maxLength={120}
            defaultValue={transportPreference ?? ""}
            placeholder="Например кола, влак, автобус"
            className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="accommodationPreference"
            className="block text-sm font-medium text-slate-700"
          >
            Предпочитано настаняване
          </label>
          <input
            id="accommodationPreference"
            name="accommodationPreference"
            type="text"
            maxLength={120}
            defaultValue={accommodationPreference ?? ""}
            placeholder="Например двойна стая, апартамент"
            className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="tripPreferenceNote"
          className="block text-sm font-medium text-slate-700"
        >
          Лична бележка
        </label>
        <textarea
          id="tripPreferenceNote"
          name="note"
          rows={4}
          maxLength={1000}
          defaultValue={note ?? ""}
          placeholder="Добавете полезни детайли за вашето участие..."
          className="mt-2 block w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      {state.error ? (
        <p className="text-sm font-medium text-red-700">{state.error}</p>
      ) : null}
      {state.success && state.message ? (
        <p className="trip-message rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}

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
      {pending ? "Запазване..." : "Запази предпочитанията"}
    </button>
  );
}

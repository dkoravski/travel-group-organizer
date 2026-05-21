"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  createTripCommentAction,
  type TripCommentActionState,
} from "@/app/trips/actions";

type TripCommentFormProps = {
  tripId: number;
};

const initialState: TripCommentActionState = {};

export function TripCommentForm({ tripId }: TripCommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    createTripCommentAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="tripId" value={tripId} />
      <div>
        <label
          htmlFor="tripComment"
          className="block text-sm font-medium text-slate-700"
        >
          Нов коментар
        </label>
        <textarea
          id="tripComment"
          name="content"
          rows={4}
          maxLength={1000}
          placeholder="Напишете въпрос, идея или уточнение за пътуването..."
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
      {pending ? "Публикуване..." : "Публикувай коментар"}
    </button>
  );
}

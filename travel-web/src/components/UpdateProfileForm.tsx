"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/app/profile/actions";

const initialState: UpdateProfileActionState = {};

export function UpdateProfileForm({ currentName }: { currentName: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
          Име
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={currentName}
          autoComplete="name"
          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success && state.message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
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
      className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? "Запазване..." : "Запази името"}
    </button>
  );
}
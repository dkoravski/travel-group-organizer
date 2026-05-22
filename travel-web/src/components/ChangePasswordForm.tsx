"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "@/app/profile/actions";

const initialState: ChangePasswordActionState = {};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 min-w-0 space-y-3">
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Текуща парола"
        autoComplete="current-password"
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="Нова парола"
        autoComplete="new-password"
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Потвърдете новата парола"
        autoComplete="new-password"
      />

      {state.error ? (
        <p className="break-words rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success && state.message ? (
        <p className="break-words rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        required
        minLength={6}
        autoComplete={autoComplete}
        className="mt-1.5 block h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
      />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {pending ? "Запазване..." : "Смени паролата"}
    </button>
  );
}

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction, type AuthActionState } from "@/app/(auth)/actions";

const initialAuthState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700"
        >
          Име
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Иван Димитров"
        />
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-slate-700"
        >
          Имейл
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="ivan@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-slate-700"
        >
          Парола
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Минимум 6 символа"
        />
      </div>

      <RegisterSubmitButton />
    </form>
  );
}

function RegisterSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400"
    >
      {pending ? "Създаване..." : "Създаване на профил"}
    </button>
  );
}

"use client";

import { FormEvent, useState } from "react";

type AuthApiResponse = {
  error?: string;
};

type LoginFormProps = {
  redirectTo?: string;
};

function getSafeRedirectPath(redirectTo: string) {
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  if (redirectTo === "/login" || redirectTo === "/register") {
    return "/";
  }

  return redirectTo;
}

export function LoginForm({ redirectTo = "/dashboard" }: LoginFormProps) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setError(undefined);
    setPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      const result = (await response.json()) as AuthApiResponse;

      if (!response.ok) {
        setError(result.error ?? "Входът не беше успешен.");
        return;
      }

      window.location.assign(getSafeRedirectPath(redirectTo));
    } catch {
      setError("Входът не беше успешен.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Имейл
        </label>
        <input
          id="email"
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
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Парола
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          placeholder="Вашата парола"
        />
      </div>

      <LoginSubmitButton pending={pending} />
    </form>
  );
}

function LoginSubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400"
    >
      {pending ? "Влизане..." : "Вход"}
    </button>
  );
}

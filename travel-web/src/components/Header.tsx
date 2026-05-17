import Link from "next/link";

import { logoutAction } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl"
        >
          Travel Group Organizer
        </Link>

        <nav
          aria-label="Основна навигация"
          className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700"
        >
          <Link
            href="/"
            className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Начало
          </Link>
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm leading-tight text-slate-700">
                <span className="block font-semibold text-slate-950">
                  {currentUser.name}
                </span>
                <span className="block text-xs text-slate-500">
                  {currentUser.email}
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Изход
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Вход
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

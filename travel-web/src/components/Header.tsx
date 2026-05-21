import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { userHasManagedGroups } from "@/services/groupService";

const navLinkClass =
  "rounded-full px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 hover:text-white";

export async function Header() {
  const currentUser = await getCurrentUser();
  const hasManagerAccess = currentUser
    ? await userHasManagedGroups(currentUser.id)
    : false;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/20 bg-gradient-to-r from-slate-700 via-slate-600 to-emerald-600 shadow-lg shadow-slate-900/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 text-lg font-bold tracking-tight text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-emerald-700 shadow-lg shadow-slate-900/10 transition group-hover:bg-emerald-50">
            TG
          </span>
          <span>Travel Group Organizer</span>
        </Link>

        <nav
          aria-label="Основна навигация"
          className="flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1"
        >
          <Link href="/" className={navLinkClass}>
            Начало
          </Link>
          <Link href="/about" className={navLinkClass}>
            За приложението
          </Link>
          {currentUser ? (
            <>
              <Link href="/dashboard" className={navLinkClass}>
                Моето табло
              </Link>
              {hasManagerAccess ? (
                <Link href="/manager" className={navLinkClass}>
                  Мениджърски панел
                </Link>
              ) : null}
              <div className="hidden px-3 text-sm leading-tight text-slate-100 sm:block">
                <span className="block font-semibold text-white">
                  {currentUser.name}
                </span>
                <span className="block text-xs text-emerald-50/80">
                  {currentUser.email}
                </span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass}>
                Вход
              </Link>
              <Link
                href="/register"
                className={navLinkClass}
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

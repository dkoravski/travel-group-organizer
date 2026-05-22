import Link from "next/link";

import { MobileHeaderNav, type HeaderNavItem } from "@/components/MobileHeaderNav";
import { getCurrentUser } from "@/lib/auth";
import { userHasManagedGroups } from "@/services/groupService";

export async function Header() {
  const currentUser = await getCurrentUser();
  const hasManagerAccess = currentUser
    ? await userHasManagedGroups(currentUser.id)
    : false;

  const navItems: HeaderNavItem[] = [
    { href: "/", label: "Начало" },
    { href: "/about", label: "За приложението" },
  ];

  if (currentUser) {
    navItems.push({ href: "/dashboard", label: "Моето табло" });

    if (hasManagerAccess) {
      navItems.push({ href: "/manager", label: "Мениджърски панел" });
    }

    navItems.push({ href: "/profile", label: "Профил" });
  } else {
    navItems.push(
      { href: "/login", label: "Вход" },
      { href: "/register", label: "Регистрация" },
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/20 bg-gradient-to-r from-slate-700 via-slate-600 to-emerald-600 shadow-lg shadow-slate-900/10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex min-w-0 items-center gap-3 text-base font-bold tracking-tight text-white sm:text-lg"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-emerald-700 shadow-lg shadow-slate-900/10 transition group-hover:bg-emerald-50">
            TG
          </span>
          <span className="truncate">Travel Group Organizer</span>
        </Link>

        <MobileHeaderNav
          items={navItems}
          user={
            currentUser
              ? { name: currentUser.name, email: currentUser.email }
              : undefined
          }
          showLogout={Boolean(currentUser)}
        />
      </div>
    </header>
  );
}

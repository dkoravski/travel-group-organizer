"use client";

import { useEffect, useState } from "react";

import { ActiveNavLink } from "@/components/ActiveNavLink";
import { LogoutButton } from "@/components/LogoutButton";

export type HeaderNavItem = {
  href: string;
  label: string;
};

type HeaderUser = {
  name: string;
  email: string;
};

export function MobileHeaderNav({
  items,
  user,
  showLogout,
}: {
  items: HeaderNavItem[];
  user?: HeaderUser;
  showLogout: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? "Затвори менюто" : "Отвори менюто"}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70 lg:hidden"
      >
        <span className="relative h-5 w-5" aria-hidden>
          <span
            className={[
              "absolute left-0 top-1 h-0.5 w-5 rounded-full bg-current transition",
              isOpen ? "translate-y-2 rotate-45" : "",
            ].join(" ")}
          />
          <span
            className={[
              "absolute left-0 top-2.5 h-0.5 w-5 rounded-full bg-current transition",
              isOpen ? "opacity-0" : "",
            ].join(" ")}
          />
          <span
            className={[
              "absolute left-0 top-4 h-0.5 w-5 rounded-full bg-current transition",
              isOpen ? "-translate-y-1.5 -rotate-45" : "",
            ].join(" ")}
          />
        </span>
      </button>

      {isOpen ? (
        <button
          type="button"
          aria-label="Затвори менюто"
          className="fixed inset-0 top-[69px] z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <nav
        id="main-navigation"
        aria-label="Основна навигация"
        className={[
          "absolute left-4 right-4 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-white/20 bg-slate-800/95 p-2 shadow-xl shadow-slate-950/20 backdrop-blur lg:static lg:z-auto lg:flex lg:min-w-0 lg:items-center lg:gap-1 lg:rounded-full lg:bg-white/10 lg:p-1 lg:shadow-none lg:backdrop-blur-0 xl:gap-2",
          isOpen ? "block" : "hidden lg:flex",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 lg:min-w-0 lg:flex-row lg:items-center lg:gap-1 xl:gap-2">
          {items.map((item) => (
            <div key={item.href} onClick={() => setIsOpen(false)}>
              <ActiveNavLink href={item.href}>{item.label}</ActiveNavLink>
            </div>
          ))}

          {user ? (
            <div className="min-w-0 border-t border-white/10 px-4 py-3 text-sm leading-tight text-slate-100 lg:max-w-44 lg:border-l lg:border-t-0 lg:px-3 lg:py-1 xl:max-w-56 xl:px-4">
              <span className="block truncate font-semibold text-white">
                {user.name}
              </span>
              <span className="block truncate text-xs text-emerald-50/80">
                {user.email}
              </span>
            </div>
          ) : null}

          {showLogout ? (
            <div onClick={() => setIsOpen(false)}>
              <LogoutButton />
            </div>
          ) : null}
        </div>
      </nav>
    </>
  );
}

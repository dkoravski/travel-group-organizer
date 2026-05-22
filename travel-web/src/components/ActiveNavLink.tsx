"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const baseClass =
  "block rounded-full px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 hover:text-white";
const activeClass = "bg-white/20 text-white";

export function ActiveNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClass} ${isActive ? activeClass : ""}`}
    >
      {children}
    </Link>
  );
}

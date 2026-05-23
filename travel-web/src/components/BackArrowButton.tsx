"use client";

import { useRouter } from "next/navigation";

export function BackArrowButton({
  fallbackHref,
  label = "Назад",
  useHistory = true,
}: {
  fallbackHref: string;
  label?: string;
  useHistory?: boolean;
}) {
  const router = useRouter();

  function handleBack() {
    if (useHistory && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleBack}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
    >
      &larr;
    </button>
  );
}

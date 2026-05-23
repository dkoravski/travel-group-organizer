"use client";

import { useState } from "react";

type ShareTripButtonProps = {
  tripId: number;
};

export function ShareTripButton({ tripId }: ShareTripButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/trips/${tripId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="min-h-11 w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold leading-5 text-slate-800 transition hover:bg-slate-100"
    >
      {copied ? "Копирано" : "Сподели линк"}
    </button>
  );
}

"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/app/(auth)/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full cursor-pointer rounded-full px-3 py-2 text-left text-sm font-semibold whitespace-nowrap text-slate-100 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto xl:px-4"
    >
      {pending ? "Излизане..." : "Изход"}
    </button>
  );
}

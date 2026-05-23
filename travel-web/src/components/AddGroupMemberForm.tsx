"use client";

import { useActionState } from "react";

import {
  addGroupMemberByEmailAction,
  type AddGroupMemberActionState,
} from "@/app/groups/actions";

const initialState: AddGroupMemberActionState = {};

export function AddGroupMemberForm({ groupId }: { groupId: number }) {
  const [state, formAction, isPending] = useActionState(
    addGroupMemberByEmailAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 rounded-md bg-slate-50 p-4">
      <input type="hidden" name="groupId" value={groupId} />
      <label htmlFor="memberEmail" className="block text-sm font-medium text-slate-700">
        Добави към групата регистриран потребител чрез имейл адреса му:
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="memberEmail"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 cursor-pointer rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPending ? "Добавяне..." : "Добави"}
        </button>
      </div>
      {state.error ? (
        <p className="mt-3 text-sm font-medium text-red-700">{state.error}</p>
      ) : null}
      {state.success && state.message ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

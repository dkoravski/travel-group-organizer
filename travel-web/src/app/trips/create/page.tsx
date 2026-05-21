import { redirect } from "next/navigation";

import { createTripAction } from "@/app/trips/actions";
import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";

type CreateTripPageProps = {
  searchParams: Promise<{
    groupId?: string;
  }>;
};

export default async function CreateTripPage({ searchParams }: CreateTripPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips/create");
  }

  const [{ groupId }, groups] = await Promise.all([
    searchParams,
    getManagedGroups(currentUser.id),
  ]);

  if (groups.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Бързо действие
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Създаване на пътуване
        </h1>
      </header>

      <form
        action={createTripAction}
        className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label
            htmlFor="groupId"
            className="block text-sm font-medium text-slate-700"
          >
            Туристическа група
          </label>
          <select
            id="groupId"
            name="groupId"
            required
            defaultValue={groupId ?? ""}
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          >
            <option value="">Изберете група</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700"
          >
            Заглавие
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            placeholder="Уикенд в Солун"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-slate-700"
          >
            Дестинация
          </label>
          <input
            id="destination"
            name="destination"
            required
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            placeholder="Солун, Гърция"
          />
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-slate-700"
          >
            Начална дата
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-slate-700"
          >
            Крайна дата
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700"
          >
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="meetingPoint"
            className="block text-sm font-medium text-slate-700"
          >
            Място на среща
          </label>
          <input
            id="meetingPoint"
            name="meetingPoint"
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-slate-700"
          >
            Капацитет
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="estimatedBudget"
            className="block text-sm font-medium text-slate-700"
          >
            Ориентировъчен бюджет
          </label>
          <input
            id="estimatedBudget"
            name="estimatedBudget"
            type="number"
            min="0"
            step="0.01"
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Създай пътуване
          </button>
        </div>
      </form>
    </div>
  );
}

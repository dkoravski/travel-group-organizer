import { redirect } from "next/navigation";

import { createGroupAction } from "@/app/groups/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function CreateGroupPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/groups/create");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Бързо действие
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Създаване на група
        </h1>
      </header>

      <form
        action={createGroupAction}
        className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Име на групата
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            placeholder="Уикенд пътешественици"
          />
        </div>

        <div>
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
            placeholder="Кратко описание на групата"
          />
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-slate-700"
          >
            URL на изображение
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            placeholder="https://..."
          />
        </div>

        <div>
          <label
            htmlFor="visibility"
            className="block text-sm font-medium text-slate-700"
          >
            Видимост
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue="private"
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          >
            <option value="private">Частна</option>
            <option value="public">Публична</option>
          </select>
        </div>

        <button
          type="submit"
          className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Създай група
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { AddGroupMemberForm } from "@/components/AddGroupMemberForm";
import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";

type ManagerPanelPageProps = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function ManagerPanelPage({
  searchParams,
}: ManagerPanelPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/manager");
  }

  const [{ from }, managedGroups] = await Promise.all([
    searchParams,
    getManagedGroups(currentUser.id),
  ]);
  const showDashboardBack = from === "dashboard";

  if (managedGroups.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {showDashboardBack ? (
        <Link
          href="/dashboard"
          aria-label="Назад към Моето табло"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
        >
          &larr;
        </Link>
      ) : null}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-1xl">
            Мениджърски панел
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Управлявайте групите, в които имате мениджърски права: създаване на
            пътувания, преглед на участници и модериране на груповото съдържание.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/groups/create?from=manager"
            className="inline-flex h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            Създай група
          </Link>
          <Link
            href="/trips/create"
            className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Създай пътуване
          </Link>
        </div>
      </header>

      <main className="grid gap-4 md:grid-cols-2">
        {managedGroups.map((group) => (
          <article
            key={group.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  {group.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {group.description ?? "Няма добавено описание за тази група."}
                </p>
              </div>
              <Link
                href={`/groups/${group.id}`}
                className="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Отвори
              </Link>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-50 p-3">
                <dt className="text-slate-500">Участници</dt>
                <dd className="mt-1 text-lg font-bold text-slate-950">
                  {group.membersCount}
                </dd>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <dt className="text-slate-500">Пътувания</dt>
                <dd className="mt-1 text-lg font-bold text-slate-950">
                  {group.tripsCount}
                </dd>
              </div>
            </dl>

            <AddGroupMemberForm groupId={group.id} />

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/groups/${group.id}`}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Управлявай групата
              </Link>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

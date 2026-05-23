import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { removeGroupMemberAction } from "@/app/groups/actions";
import { AddGroupMemberForm } from "@/components/AddGroupMemberForm";
import { getCurrentUser } from "@/lib/auth";
import {
  getGroupDetails,
  getGroupMembers,
  getGroupTrips,
  userCanManageGroup,
  userCanViewGroup,
} from "@/services/groupService";

type GroupPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function GroupPage({ params, searchParams }: GroupPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { id } = await params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    notFound();
  }

  const canViewGroup = await userCanViewGroup(groupId, currentUser.id);

  if (!canViewGroup) {
    notFound();
  }

  const { from } = await searchParams;
  const showDashboardBack = from === "dashboard";
  const showManagerTools = from === "manager";

  const group = await getGroupDetails(groupId);

  if (!group) {
    notFound();
  }

  const [members, groupTrips, canManageGroup] = await Promise.all([
    getGroupMembers(groupId),
    getGroupTrips(groupId, currentUser.id),
    userCanManageGroup(groupId, currentUser.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href={showDashboardBack ? "/dashboard" : "/manager"}
        aria-label={showDashboardBack ? "Назад към Моето табло" : "Назад към мениджърския панел"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
      >
        &larr;
      </Link>

      <header className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {group.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {group.description ?? "Няма добавено описание за тази група."}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              Организатор:{" "}
              <span className="font-semibold text-slate-950">
                {group.ownerName}
              </span>
            </p>
            <p>
              Участници:{" "}
              <span className="font-semibold text-slate-950">
                {group.membersCount}
              </span>
            </p>
          </div>
        </div>
      </header>

      <main className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section
          aria-labelledby="members-heading"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2
            id="members-heading"
            className="text-xl font-bold tracking-tight text-slate-950"
          >
            Членове на групата
          </h2>
          {canManageGroup && showManagerTools ? (
            <AddGroupMemberForm groupId={group.id} />
          ) : null}
          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex items-center justify-between gap-4 rounded-md bg-slate-50 p-3"
              >
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-600">{member.email}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {formatGroupRole(member.role)}
                </span>
                {canManageGroup && showManagerTools && member.role === "member" ? (
                  <form action={removeGroupMemberAction}>
                    <input type="hidden" name="groupId" value={group.id} />
                    <input type="hidden" name="memberUserId" value={member.id} />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Премахни
                    </button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="trips-heading">
          <h2
            id="trips-heading"
            className="text-xl font-bold tracking-tight text-slate-950"
          >
            Пътувания на групата
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {groupTrips.map((trip) => (
              <article
                key={trip.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {trip.title}
                  </h3>
                  {trip.isJoined ? (
                    <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Присъединен
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {trip.destination}
                </p>
                <dl className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt>Дати</dt>
                    <dd className="font-medium text-slate-950">
                      {trip.startDate} - {trip.endDate}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Участници</dt>
                    <dd className="font-medium text-slate-950">
                      {trip.participantsCount}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/trips/${trip.id}`}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 hover:shadow-emerald-900/20"
                  >
                    Отвори
                  </Link>
                  {canManageGroup && showManagerTools ? (
                    <>
                      <Link
                        href={`/trips/${trip.id}/edit`}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Редактирай
                      </Link>
                      <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                        {trip.canceled ? "Отменено" : "Активно"}
                      </span>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function formatGroupRole(role: "member" | "manager") {
  return role === "manager" ? "Мениджър" : "Член";
}

"use client";

import { useMemo, useState } from "react";

import {
  DashboardGroupCard,
  type DashboardGroup,
} from "@/components/DashboardGroupCard";
import {
  DashboardTripCard,
  type DashboardTrip,
} from "@/components/DashboardTripCard";

type DashboardSearchProps = {
  groups: DashboardGroup[];
  upcomingTrips: DashboardTrip[];
};

const GROUPS_PER_PAGE = 3;

export function DashboardSearch({
  groups,
  upcomingTrips,
}: DashboardSearchProps) {
  const [query, setQuery] = useState("");
  const [groupsPage, setGroupsPage] = useState(1);
  const normalizedQuery = query.trim().toLocaleLowerCase("bg-BG");

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) {
      return groups;
    }

    return groups.filter((group) =>
      [
        group.name,
        group.description ?? "",
        group.currentUserRole === "manager" ? "мениджър" : "член",
      ]
        .join(" ")
        .toLocaleLowerCase("bg-BG")
        .includes(normalizedQuery),
    );
  }, [groups, normalizedQuery]);

  const groupsPageCount = Math.max(
    1,
    Math.ceil(filteredGroups.length / GROUPS_PER_PAGE),
  );
  const currentGroupsPage = Math.min(groupsPage, groupsPageCount);

  const visibleGroups = useMemo(() => {
    const startIndex = (currentGroupsPage - 1) * GROUPS_PER_PAGE;

    return filteredGroups.slice(startIndex, startIndex + GROUPS_PER_PAGE);
  }, [currentGroupsPage, filteredGroups]);

  const filteredTrips = useMemo(() => {
    if (!normalizedQuery) {
      return upcomingTrips;
    }

    return upcomingTrips.filter((trip) =>
      [
        trip.title,
        trip.destination,
        trip.startDate,
        trip.endDate,
        trip.status === "current" ? "в момента" : "предстоящо",
        trip.isJoined ? "присъединен" : "",
      ]
        .join(" ")
        .toLocaleLowerCase("bg-BG")
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, upcomingTrips]);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-900/5">
        <label
          htmlFor="dashboard-search"
          className="block text-sm font-bold text-slate-800"
        >
          Търсене в групи и пътувания
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="dashboard-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setGroupsPage(1);
            }}
            placeholder="Име на група, пътуване, дестинация..."
            className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setGroupsPage(1);
              }}
              className="h-11 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Изчисти
            </button>
          ) : null}
        </div>
        {normalizedQuery ? (
          <p className="mt-2 text-sm text-slate-600">
            Намерени: {filteredGroups.length} групи и {filteredTrips.length}{" "}
            пътувания.
          </p>
        ) : null}
      </div>

      <section aria-labelledby="groups-heading">
        <SectionHeading
          id="groups-heading"
          title="Моите туристически групи"
          description="Групите, в които участвате в момента."
        />
        {filteredGroups.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {visibleGroups.map((group) => (
              <DashboardGroupCard
                key={group.id}
                group={group}
                from="dashboard"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              normalizedQuery
                ? "Няма групи, които отговарят на търсенето."
                : "Все още не участвате в туристически групи."
            }
          />
        )}
        {filteredGroups.length > GROUPS_PER_PAGE ? (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm text-slate-700 shadow-sm shadow-slate-900/5 sm:flex-row">
            <p className="font-medium">
              Страница {currentGroupsPage} от {groupsPageCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setGroupsPage((currentPage) => Math.max(1, currentPage - 1))
                }
                disabled={currentGroupsPage === 1}
                className="h-10 rounded-md border border-slate-300 px-4 font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-700"
              >
                Предишна
              </button>
              <button
                type="button"
                onClick={() =>
                  setGroupsPage((currentPage) =>
                    Math.min(groupsPageCount, currentPage + 1),
                  )
                }
                disabled={currentGroupsPage === groupsPageCount}
                className="h-10 rounded-md border border-slate-300 px-4 font-bold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-transparent disabled:hover:text-slate-700"
              >
                Следваща
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="trips-heading">
        <SectionHeading
          id="trips-heading"
          title="Предстоящи пътувания"
          description="Най-близките активни пътувания от вашите групи."
        />
        {filteredTrips.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {filteredTrips.map((trip) => (
              <DashboardTripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <EmptyState
            message={
              normalizedQuery
                ? "Няма пътувания, които отговарят на търсенето."
                : "Няма предстоящи пътувания за вашите групи."
            }
          />
        )}
      </section>
    </>
  );
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 id={id} className="text-xl font-black tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm font-medium text-slate-600">
      {message}
    </div>
  );
}

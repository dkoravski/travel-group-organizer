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

export function DashboardSearch({
  groups,
  upcomingTrips,
}: DashboardSearchProps) {
  const [query, setQuery] = useState("");
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Име на група, пътуване, дестинация..."
            className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
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
            {filteredGroups.map((group) => (
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

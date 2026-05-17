import { redirect } from "next/navigation";

import { DashboardGroupCard } from "@/components/DashboardGroupCard";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import { DashboardTripCard } from "@/components/DashboardTripCard";
import { DashboardWelcomeCard } from "@/components/DashboardWelcomeCard";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboardService";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/dashboard");
  }

  const { groups, upcomingTrips } = await getDashboardData(currentUser.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Travel Group Organizer
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          My Dashboard
        </h1>
      </header>

      <main className="space-y-8">
        <DashboardWelcomeCard user={currentUser} />

        <section aria-labelledby="groups-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="groups-heading"
                className="text-xl font-bold tracking-tight text-slate-950"
              >
                My Travel Groups
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Групите, в които участвате в момента.
              </p>
            </div>
          </div>
          {groups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {groups.map((group) => (
                <DashboardGroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState message="Все още не участвате в туристически групи." />
          )}
        </section>

        <section aria-labelledby="trips-heading">
          <div className="mb-4">
            <h2
              id="trips-heading"
              className="text-xl font-bold tracking-tight text-slate-950"
            >
              Upcoming Trips
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Най-близките активни пътувания от вашите групи.
            </p>
          </div>
          {upcomingTrips.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <DashboardTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState message="Няма предстоящи пътувания за вашите групи." />
          )}
        </section>

        <DashboardQuickActions />
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
      {message}
    </div>
  );
}

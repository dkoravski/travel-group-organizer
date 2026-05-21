import { redirect } from "next/navigation";

import { DashboardGroupCard } from "@/components/DashboardGroupCard";
import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import { DashboardTripCard } from "@/components/DashboardTripCard";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboardService";
import { userHasManagedGroups } from "@/services/groupService";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [{ groups, upcomingTrips }, hasManagerAccess] = await Promise.all([
    getDashboardData(currentUser.id),
    userHasManagedGroups(currentUser.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
          Работно табло
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Моето табло
        </h1>
      </header>

      <main className="space-y-10">
        <section aria-labelledby="groups-heading">
          <SectionHeading
            id="groups-heading"
            title="Моите туристически групи"
            description="Групите, в които участвате в момента."
          />
          {groups.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {groups.map((group) => (
                <DashboardGroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <EmptyState message="Все още не участвате в туристически групи." />
          )}
        </section>

        <section aria-labelledby="trips-heading">
          <SectionHeading
            id="trips-heading"
            title="Предстоящи пътувания"
            description="Най-близките активни пътувания от вашите групи."
          />
          {upcomingTrips.length > 0 ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <DashboardTripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState message="Няма предстоящи пътувания за вашите групи." />
          )}
        </section>

        <DashboardQuickActions hasManagerAccess={hasManagerAccess} />
      </main>
    </div>
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
      <h2 id={id} className="text-2xl font-black tracking-tight text-slate-950">
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

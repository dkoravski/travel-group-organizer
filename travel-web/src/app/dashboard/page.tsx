import { redirect } from "next/navigation";

import { DashboardQuickActions } from "@/components/DashboardQuickActions";
import { DashboardSearch } from "@/components/DashboardSearch";
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
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Моето табло
        </h1>
      </header>

      <main className="space-y-10">
        <DashboardSearch groups={groups} upcomingTrips={upcomingTrips} />

        <DashboardQuickActions hasManagerAccess={hasManagerAccess} />
      </main>
    </div>
  );
}

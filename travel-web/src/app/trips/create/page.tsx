import Link from "next/link";
import { redirect } from "next/navigation";

import { TripForm } from "@/components/TripForm";
import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";

type CreateTripPageProps = {
  searchParams: Promise<{
    groupId?: string;
    from?: string;
  }>;
};

export default async function CreateTripPage({
  searchParams,
}: CreateTripPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips/create");
  }

  const [{ groupId, from }, groups] = await Promise.all([
    searchParams,
    getManagedGroups(currentUser.id),
  ]);
  const backHref = from === "dashboard" ? "/dashboard" : "/manager";
  const backLabel =
    from === "dashboard"
      ? "Назад към Моето табло"
      : "Назад към мениджърския панел";

  if (groups.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-8">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-700 shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
        >
          &larr;
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Създаване на пътуване
        </h1>
      </header>

      <TripForm mode="create" groups={groups} defaultGroupId={groupId} />
    </div>
  );
}

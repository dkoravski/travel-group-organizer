import { notFound, redirect } from "next/navigation";

import { updateTripAction } from "@/app/trips/actions";
import { BackArrowButton } from "@/components/BackArrowButton";
import { getCurrentUser } from "@/lib/auth";
import { getManagedGroups } from "@/services/groupService";
import { getTripDetails } from "@/services/tripService";

type EditTripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const { id } = await params;
  const tripId = Number(id);

  if (!Number.isInteger(tripId) || tripId <= 0) {
    notFound();
  }

  const [trip, groups] = await Promise.all([
    getTripDetails(tripId, currentUser.id),
    getManagedGroups(currentUser.id),
  ]);

  if (!trip || !trip.isGroupManager) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <BackArrowButton
        fallbackHref={`/trips/${trip.id}`}
        label="Назад към предишната страница"
      />

      <header className="mt-6 mb-8">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Редакция на пътуване
        </h1>
      </header>

      <form
        action={updateTripAction}
        className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <input type="hidden" name="tripId" value={trip.id} />

        <div className="md:col-span-2">
          <label htmlFor="groupId" className="block text-sm font-medium text-slate-700">
            Туристическа група
          </label>
          <select
            id="groupId"
            name="groupId"
            required
            defaultValue={trip.groupId}
            className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <Field id="title" label="Заглавие" defaultValue={trip.title} required />
        <Field
          id="destination"
          label="Дестинация"
          defaultValue={trip.destination}
          required
        />
        <Field id="startDate" label="Начална дата" type="date" defaultValue={trip.startDate} required />
        <Field id="endDate" label="Крайна дата" type="date" defaultValue={trip.endDate} required />

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={trip.description ?? ""}
            className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="md:col-span-2">
          <Field
            id="meetingPoint"
            label="Място на среща"
            defaultValue={trip.meetingPoint ?? ""}
          />
        </div>

        <Field
          id="capacity"
          label="Капацитет"
          type="number"
          min="1"
          defaultValue={trip.capacity?.toString() ?? ""}
        />
        <Field
          id="estimatedBudget"
          label="Ориентировъчен бюджет"
          type="number"
          min="0"
          step="0.01"
          defaultValue={trip.estimatedBudget ?? ""}
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Запази промените
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  defaultValue,
  type = "text",
  required = false,
  min,
  step,
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        min={min}
        step={step}
        defaultValue={defaultValue}
        className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
      />
    </div>
  );
}

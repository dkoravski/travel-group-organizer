"use client";

import { FormEvent, useActionState, useState } from "react";

import {
  createTripAction,
  type TripFormActionState,
  updateTripAction,
} from "@/app/trips/actions";

type TripFormGroup = {
  id: number;
  name: string;
};

type TripFormValues = {
  id?: number;
  groupId?: number;
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  description?: string | null;
  meetingPoint?: string | null;
  capacity?: number | null;
  estimatedBudget?: string | null;
};

type TripFormProps = {
  mode: "create" | "edit";
  groups: TripFormGroup[];
  defaultGroupId?: string;
  trip?: TripFormValues;
  from?: string;
};

const initialState: TripFormActionState = {};

export function TripForm({
  mode,
  groups,
  defaultGroupId,
  trip,
  from,
}: TripFormProps) {
  const action = mode === "create" ? createTripAction : updateTripAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [localError, setLocalError] = useState("");
  const error = localError || state.error;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");

    if (startDate && endDate && endDate < startDate) {
      event.preventDefault();
      setLocalError("Крайната дата не може да е преди началната.");
      return;
    }

    setLocalError("");
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2"
    >
      {trip?.id ? <input type="hidden" name="tripId" value={trip.id} /> : null}
      {from ? <input type="hidden" name="from" value={from} /> : null}

      <div className="md:col-span-2">
        <label
          htmlFor="groupId"
          className="block text-sm font-medium text-slate-700"
        >
          Туристическа група
        </label>
        <select
          id="groupId"
          name="groupId"
          required
          defaultValue={trip?.groupId?.toString() ?? defaultGroupId ?? ""}
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        >
          {mode === "create" ? (
            <option value="">Изберете група</option>
          ) : null}
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <Field
        id="title"
        label="Заглавие"
        defaultValue={trip?.title ?? ""}
        placeholder="Уикенд в Солун"
        required
        className="md:col-span-2"
      />
      <Field
        id="destination"
        label="Дестинация"
        defaultValue={trip?.destination ?? ""}
        placeholder="Солун, Гърция"
        required
        className="md:col-span-2"
      />
      <Field
        id="startDate"
        label="Начална дата"
        type="date"
        defaultValue={trip?.startDate ?? ""}
        required
      />
      <Field
        id="endDate"
        label="Крайна дата"
        type="date"
        defaultValue={trip?.endDate ?? ""}
        required
      />

      <div className="md:col-span-2">
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
          defaultValue={trip?.description ?? ""}
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
        />
      </div>

      <Field
        id="meetingPoint"
        label="Място на среща"
        defaultValue={trip?.meetingPoint ?? ""}
        className="md:col-span-2"
      />
      <Field
        id="capacity"
        label="Капацитет"
        type="number"
        min="1"
        defaultValue={trip?.capacity?.toString() ?? ""}
      />
      <Field
        id="estimatedBudget"
        label="Ориентировъчен бюджет €"
        type="number"
        min="0"
        step="0.01"
        defaultValue={trip?.estimatedBudget ?? ""}
      />

      <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-md bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isPending
            ? "Запазване..."
            : mode === "create"
              ? "Създай пътуване"
              : "Запази промените"}
        </button>
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </form>
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
  placeholder,
  className,
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
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
        placeholder={placeholder}
        className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
      />
    </div>
  );
}

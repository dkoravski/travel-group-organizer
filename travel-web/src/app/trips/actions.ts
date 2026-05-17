"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  cancelTrip,
  createTrip,
  joinTrip,
  leaveTrip,
  userCanCreateTrip,
} from "@/services/tripService";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createTripAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips/create");
  }

  const groupId = Number(getStringValue(formData, "groupId"));
  const title = getStringValue(formData, "title");
  const destination = getStringValue(formData, "destination");
  const description = getStringValue(formData, "description");
  const startDate = getStringValue(formData, "startDate");
  const endDate = getStringValue(formData, "endDate");
  const meetingPoint = getStringValue(formData, "meetingPoint");
  const capacity = getStringValue(formData, "capacity");
  const estimatedBudget = getStringValue(formData, "estimatedBudget");

  if (!groupId || !title || !destination || !startDate || !endDate) {
    throw new Error("Липсват задължителни полета за пътуването.");
  }

  const canCreateTrip = await userCanCreateTrip(groupId, currentUser.id);

  if (!canCreateTrip) {
    throw new Error("Не можете да създадете пътуване за тази група.");
  }

  await createTrip({
    groupId,
    title,
    description: description || null,
    destination,
    startDate,
    endDate,
    meetingPoint: meetingPoint || null,
    capacity: capacity ? Number(capacity) : null,
    estimatedBudget: estimatedBudget || null,
    createdBy: currentUser.id,
  });

  redirect("/trips");
}

export async function joinTripAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("Невалидно пътуване.");
  }

  await joinTrip(tripId, currentUser.id);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}

export async function leaveTripAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("Невалидно пътуване.");
  }

  await leaveTrip(tripId, currentUser.id);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}

export async function cancelTripAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("Невалидно пътуване.");
  }

  await cancelTrip(tripId, currentUser.id);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}

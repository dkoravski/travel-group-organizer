"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  cancelTrip,
  createTripComment,
  createTrip,
  joinTrip,
  leaveTrip,
  updateTripPreferences,
  updateTripGuests,
  userCanCreateTrip,
} from "@/services/tripService";
import { getTripDetails } from "@/services/tripService";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateTripPreferencesFormAction(
  _previousState: TripPreferencesActionState,
  formData: FormData,
): Promise<TripPreferencesActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));
  const transportPreference = getStringValue(formData, "transportPreference");
  const accommodationPreference = getStringValue(
    formData,
    "accommodationPreference",
  );
  const note = getStringValue(formData, "note");

  if (!Number.isInteger(tripId) || tripId <= 0) {
    return { error: "Невалидно пътуване." };
  }

  if (transportPreference.length > 120) {
    return {
      error: "Предпочитаният транспорт не може да е по-дълъг от 120 символа.",
    };
  }

  if (accommodationPreference.length > 120) {
    return {
      error: "Предпочитанията за настаняване не могат да са по-дълги от 120 символа.",
    };
  }

  if (note.length > 1000) {
    return {
      error: "Бележката не може да бъде по-дълга от 1000 символа.",
    };
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip?.isJoined) {
    return {
      error: "Първо трябва да се присъедините към пътуването, за да добавите предпочитания.",
    };
  }

  await updateTripPreferences(tripId, currentUser.id, {
    transportPreference: transportPreference || null,
    accommodationPreference: accommodationPreference || null,
    note: note || null,
  });

  revalidatePath(`/trips/${tripId}`);

  return {
    success: true,
    message: "Предпочитанията са запазени.",
  };
}

export async function createTripCommentAction(
  _previousState: TripCommentActionState,
  formData: FormData,
): Promise<TripCommentActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));
  const content = getStringValue(formData, "content");

  if (!Number.isInteger(tripId) || tripId <= 0) {
    return { error: "Невалидно пътуване." };
  }

  if (content.length < 2) {
    return { error: "Коментарът трябва да съдържа поне 2 символа." };
  }

  if (content.length > 1000) {
    return { error: "Коментарът не може да бъде по-дълъг от 1000 символа." };
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip?.isGroupMember) {
    return { error: "Нямате достъп до коментарите за това пътуване." };
  }

  await createTripComment(tripId, currentUser.id, content);
  revalidatePath(`/trips/${tripId}`);

  return {
    success: true,
    message: "Коментарът е добавен.",
  };
}

export type TripGuestsActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export type TripCommentActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export type TripPreferencesActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

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

  const guestsCountStr = getStringValue(formData, "guestsCount");
  const guestsCount = guestsCountStr ? Number(guestsCountStr) : 0;

  if (!Number.isInteger(guestsCount) || guestsCount < 0) {
    throw new Error("Невалиден брой приятели.");
  }

  const trip = await getTripDetails(tripId, currentUser.id);
  if (!trip) {
    throw new Error("Пътуването не е намерено.");
  }

  if (trip.capacity != null) {
    const desiredAddition = guestsCount + 1;
    const currentTotal = Number(trip.participantsCount || 0);
    if (currentTotal + desiredAddition > Number(trip.capacity)) {
      throw new Error("Няма достатъчно места — капацитетът ще бъде надвишен.");
    }
  }

  await joinTrip(tripId, currentUser.id, guestsCount);
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

export async function updateTripGuestsAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));
  const guestsCount = Number(getStringValue(formData, "guestsCount"));

  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new Error("Невалидно пътуване.");
  }

  if (!Number.isInteger(guestsCount) || guestsCount < 0) {
    throw new Error("Невалиден брой приятели.");
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip?.isJoined) {
    throw new Error("Първо трябва да се присъедините към пътуването.");
  }

  if (trip.capacity != null) {
    const currentUserTotal = (trip.userGuestsCount ?? 0) + 1;
    const newUserTotal = guestsCount + 1;
    const adjustedTotal =
      Number(trip.participantsCount || 0) - currentUserTotal + newUserTotal;

    if (adjustedTotal > Number(trip.capacity)) {
      throw new Error("Няма достатъчно места — капацитетът ще бъде надвишен.");
    }
  }

  await updateTripGuests(tripId, currentUser.id, guestsCount);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");
}

export async function updateTripGuestsFormAction(
  _previousState: TripGuestsActionState,
  formData: FormData,
): Promise<TripGuestsActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/trips");
  }

  const tripId = Number(getStringValue(formData, "tripId"));
  const guestsCount = Number(getStringValue(formData, "guestsCount"));

  if (!Number.isInteger(tripId) || tripId <= 0) {
    return { error: "Невалидно пътуване." };
  }

  if (!Number.isInteger(guestsCount) || guestsCount < 0) {
    return { error: "Невалиден брой приятели." };
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip?.isJoined) {
    return { error: "Първо трябва да се присъедините към пътуването." };
  }

  if (trip.capacity != null) {
    const currentUserTotal = (trip.userGuestsCount ?? 0) + 1;
    const newUserTotal = guestsCount + 1;
    const adjustedTotal =
      Number(trip.participantsCount || 0) - currentUserTotal + newUserTotal;

    if (adjustedTotal > Number(trip.capacity)) {
      return {
        error: "Няма достатъчно места — капацитетът ще бъде надвишен.",
      };
    }
  }

  await updateTripGuests(tripId, currentUser.id, guestsCount);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Промяната е запазена.",
  };
}

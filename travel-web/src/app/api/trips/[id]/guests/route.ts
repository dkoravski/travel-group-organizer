import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getGuestsCountFromJson, parseTripId } from "@/lib/api/trips";
import {
  canReserveSeats,
  getTripDetails,
  updateTripGuests,
} from "@/services/tripService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { id } = await params;
  const tripId = parseTripId(id);

  if (!tripId) {
    return apiError("Invalid trip id.", 400);
  }

  const guestsCount = await getGuestsCountFromJson(request);

  if (guestsCount === null) {
    return apiError("Guests count must be a non-negative integer.", 400);
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    return apiError("Trip not found.", 404);
  }

  if (!trip.isJoined) {
    return apiError("Join the trip before reserving guests.", 409);
  }

  const hasSeats = canReserveSeats({
    capacity: trip.capacity,
    participantsCount: trip.participantsCount,
    currentUserGuestsCount: trip.userGuestsCount,
    requestedGuestsCount: guestsCount,
    isAlreadyJoined: true,
  });

  if (!hasSeats) {
    return apiError("Trip capacity would be exceeded.", 409);
  }

  await updateTripGuests(tripId, currentUser.id, guestsCount);

  const updatedTrip = await getTripDetails(tripId, currentUser.id);
  return apiOk({ data: updatedTrip });
}

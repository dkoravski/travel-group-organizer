import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getJsonBody, getOptionalString, parseTripId } from "@/lib/api/trips";
import {
  getTripDetails,
  updateTripPreferences,
} from "@/services/tripService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getPreferenceString(
  body: Record<string, unknown>,
  keys: string[],
  maxLength: number,
) {
  const key = keys.find((candidate) => candidate in body);
  return getOptionalString(body, key ?? keys[0], maxLength);
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { id } = await params;
  const tripId = parseTripId(id);

  if (!tripId) {
    return apiError("Invalid trip id.", 400);
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    return apiError("Trip not found.", 404);
  }

  if (!trip.isJoined) {
    return apiError("Join the trip before viewing preferences.", 409);
  }

  return apiOk({
    data: {
      tripId: trip.id,
      userId: currentUser.id,
      transportPreference: trip.userTransportPreference,
      accommodationPreference: trip.userAccommodationPreference,
      note: trip.userNote,
    },
  });
}

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

  const body = await getJsonBody(request);

  if (!body) {
    return apiError("Invalid JSON body.", 400);
  }

  const transportPreference = getPreferenceString(
    body,
    ["transportPreference", "TransportPreference"],
    120,
  );
  const accommodationPreference = getPreferenceString(
    body,
    ["accommodationPreference", "AccommodationPreference"],
    120,
  );
  const note = getPreferenceString(body, ["note", "userNote"], 500);

  if (
    transportPreference === null ||
    accommodationPreference === null ||
    note === null
  ) {
    return apiError(
      "Preferences must be text. Transport and accommodation are limited to 120 characters, note to 500.",
      400,
    );
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    return apiError("Trip not found.", 404);
  }

  if (!trip.isJoined) {
    return apiError("Join the trip before saving preferences.", 409);
  }

  await updateTripPreferences(tripId, currentUser.id, {
    transportPreference: transportPreference || null,
    accommodationPreference: accommodationPreference || null,
    note: note || null,
  });

  const updatedTrip = await getTripDetails(tripId, currentUser.id);

  return apiOk({ data: updatedTrip });
}

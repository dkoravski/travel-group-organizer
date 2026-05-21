import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { parseTripId } from "@/lib/api/trips";
import {
  getTripComments,
  getTripDetails,
  getTripParticipants,
} from "@/services/tripService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const [comments, participants] = await Promise.all([
    getTripComments(tripId),
    getTripParticipants(tripId),
  ]);
  const participantPreferences = participants
    .filter(
      (participant) =>
        participant.transportPreference?.trim() ||
        participant.accommodationPreference?.trim() ||
        participant.note?.trim(),
    )
    .map((participant) => ({
      userId: participant.id,
      userName: participant.name,
      transportPreference: participant.transportPreference,
      accommodationPreference: participant.accommodationPreference,
      note: participant.note,
    }));

  return apiOk({
    data: {
      ...trip,
      comments,
      participantPreferences,
    },
  });
}

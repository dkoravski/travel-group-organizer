import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { parseTripId } from "@/lib/api/trips";
import { getTripDetails } from "@/services/tripService";

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

  return apiOk({ data: trip });
}

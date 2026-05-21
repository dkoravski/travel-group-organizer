import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getJsonBody, getOptionalString, parseTripId } from "@/lib/api/trips";
import {
  createTripComment,
  getTripComments,
  getTripDetails,
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

  const comments = await getTripComments(tripId);

  return apiOk({ data: comments });
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

  const content = getOptionalString(body, "content", 2000);

  if (content === null) {
    return apiError("Comment content must be text up to 2000 characters.", 400);
  }

  if (!content) {
    return apiError("Comment content is required.", 400);
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    return apiError("Trip not found.", 404);
  }

  await createTripComment(tripId, currentUser.id, content);

  const [createdComment] = await getTripComments(tripId);

  return apiOk({ data: createdComment }, 201);
}

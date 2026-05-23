import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { parseTripId } from "@/lib/api/trips";
import {
  getTripDetails,
  getTripPackingItems,
  setPackingItemChecked,
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

  if (!trip.isJoined) {
    return apiError("Join the trip to view the packing list.", 403);
  }

  const packingItems = await getTripPackingItems(tripId, currentUser.id);

  return apiOk({ data: packingItems });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { id } = await params;
  const tripId = parseTripId(id);

  if (!tripId) {
    return apiError("Invalid trip id.", 400);
  }

  const body = await request.json().catch(() => null);
  const packingItemId =
    body && typeof body.packingItemId === "number" ? body.packingItemId : null;
  const checked = body && typeof body.checked === "boolean" ? body.checked : null;

  if (!Number.isInteger(packingItemId) || packingItemId <= 0 || checked === null) {
    return apiError("Invalid packing item payload.", 400);
  }

  const trip = await getTripDetails(tripId, currentUser.id);

  if (!trip || !trip.isGroupMember) {
    return apiError("Trip not found.", 404);
  }

  if (!trip.isJoined) {
    return apiError("Join the trip to update the packing list.", 403);
  }

  const updated = await setPackingItemChecked(
    packingItemId,
    tripId,
    currentUser.id,
    checked,
  );

  if (!updated) {
    return apiError("Packing item not found.", 404);
  }

  const packingItems = await getTripPackingItems(tripId, currentUser.id);

  return apiOk({ data: packingItems });
}

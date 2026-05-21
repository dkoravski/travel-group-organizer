import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getJsonBody, getOptionalString, parseTripId } from "@/lib/api/trips";
import {
  getTripComments,
  getTripDetails,
  updateTripComment,
} from "@/services/tripService";

type RouteContext = {
  params: Promise<{
    id: string;
    commentId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { id, commentId } = await params;
  const tripId = parseTripId(id);
  const parsedCommentId = parseTripId(commentId);

  if (!tripId || !parsedCommentId) {
    return apiError("Invalid trip or comment id.", 400);
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

  const updated = await updateTripComment(
    parsedCommentId,
    tripId,
    currentUser.id,
    content,
  );

  if (!updated) {
    return apiError("Comment not found.", 404);
  }

  const comments = await getTripComments(tripId);
  const comment = comments.find((item) => item.id === parsedCommentId);

  if (!comment) {
    return apiError("Comment not found.", 404);
  }

  return apiOk({ data: comment });
}

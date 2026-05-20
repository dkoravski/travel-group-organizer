import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getTripsPage } from "@/services/tripService";

function getPositiveInt(value: string | null, fallback: number, max?: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
}

export async function GET(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const page = getPositiveInt(request.nextUrl.searchParams.get("page"), 1);
  const pageSize = getPositiveInt(
    request.nextUrl.searchParams.get("pageSize"),
    10,
    50,
  );

  const tripsPage = await getTripsPage(currentUser.id, { page, pageSize });

  return apiOk({
    ...tripsPage,
    totalPages: Math.ceil(tripsPage.total / tripsPage.pageSize),
  });
}

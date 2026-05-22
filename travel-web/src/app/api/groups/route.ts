import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { getUserGroupsOverview } from "@/services/groupService";

export async function GET(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Необходим е вход в профила.", 401);
  }

  const groups = await getUserGroupsOverview(currentUser.id);

  return apiOk({ data: groups });
}

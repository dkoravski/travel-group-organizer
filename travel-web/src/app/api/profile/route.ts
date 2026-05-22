import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";

export async function GET(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Необходим е вход в профила.", 401);
  }

  return apiOk({ data: currentUser });
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Необходим е вход в профила.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Невалидни данни за профила.", 400);
  }

  const name =
    typeof body === "object" && body !== null && "name" in body
      ? String(body.name).trim()
      : "";

  if (name.length < 2) {
    return apiError("Името трябва да бъде поне 2 символа.", 400);
  }

  if (name === currentUser.name) {
    return apiError("Въведете различно име.", 400);
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  if (!updatedUser) {
    return apiError("Профилът не е намерен.", 404);
  }

  return apiOk({
    data: {
      ...updatedUser,
      avatarUrl: null,
    },
  });
}

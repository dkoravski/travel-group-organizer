import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Необходим е вход в профила.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Невалидни данни за смяна на паролата.", 400);
  }

  const currentPassword =
    typeof body === "object" && body !== null && "currentPassword" in body
      ? String(body.currentPassword)
      : "";
  const newPassword =
    typeof body === "object" && body !== null && "newPassword" in body
      ? String(body.newPassword)
      : "";
  const confirmPassword =
    typeof body === "object" && body !== null && "confirmPassword" in body
      ? String(body.confirmPassword)
      : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return apiError("Попълнете всички полета за смяна на паролата.", 400);
  }

  if (newPassword.length < 6) {
    return apiError("Новата парола трябва да бъде поне 6 символа.", 400);
  }

  if (newPassword !== confirmPassword) {
    return apiError("Новата парола и потвърждението не съвпадат.", 400);
  }

  if (currentPassword === newPassword) {
    return apiError("Новата парола трябва да бъде различна от текущата.", 400);
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!user) {
    return apiError("Профилът не е намерен.", 404);
  }

  const passwordMatches = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return apiError("Текущата парола е невалидна.", 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id));

  return apiOk({ message: "Паролата е сменена успешно." });
}

import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { apiError, apiOk } from "@/lib/api/responses";
import { createAuthToken, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Невалидни данни за вход.", 400);
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String(body.email).trim().toLowerCase()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String(body.password)
      : "";

  if (!email || !password) {
    return apiError("Въведете имейл и парола.", 400);
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (!user) {
    return apiError("Невалиден имейл или парола.", 401);
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return apiError("Невалиден имейл или парола.", 401);
  }

  const token = await createAuthToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  const response = apiOk({
    token,
    tokenType: "Bearer",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: null,
    },
  });

  return setSessionCookie(response, token);
}

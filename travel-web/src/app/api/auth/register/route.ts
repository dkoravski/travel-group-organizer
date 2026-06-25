import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { apiError, apiOk } from "@/lib/api/responses";
import { createAuthToken, hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Невалидни данни за регистрация.", 400);
  }

  const name =
    typeof body === "object" && body !== null && "name" in body
      ? String(body.name).trim()
      : "";
  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String(body.email).trim().toLowerCase()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String(body.password)
      : "";

  if (name.length < 2) {
    return apiError("Въведете име с поне 2 символа.", 400);
  }

  if (!email.includes("@")) {
    return apiError("Въведете валиден имейл адрес.", 400);
  }

  if (password.length < 6) {
    return apiError("Паролата трябва да е поне 6 символа.", 400);
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (existingUser) {
    return apiError("Вече има регистриран потребител с този имейл.", 409);
  }

  const passwordHash = await hashPassword(password);

  const [createdUser] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  const token = await createAuthToken({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
  });

  const response = apiOk(
    {
      token,
      tokenType: "Bearer",
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        avatarUrl: null,
      },
    },
    201,
  );

  return setSessionCookie(response, token);
}

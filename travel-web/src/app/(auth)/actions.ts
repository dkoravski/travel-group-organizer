"use server";

import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  clearSession,
  createSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthActionState = {
  error?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: string) {
  return email.toLowerCase();
}

function getSafeRedirectPath(formData: FormData) {
  const redirectTo = getStringValue(formData, "redirectTo");

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }

  if (redirectTo === "/login" || redirectTo === "/register") {
    return "/";
  }

  return redirectTo;
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = getStringValue(formData, "name");
  const email = normalizeEmail(getStringValue(formData, "email"));
  const password = getStringValue(formData, "password");

  if (name.length < 2) {
    return { error: "Моля, въведете име с поне 2 символа." };
  }

  if (!email.includes("@")) {
    return { error: "Моля, въведете валиден имейл адрес." };
  }

  if (password.length < 6) {
    return { error: "Паролата трябва да е поне 6 символа." };
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);

  if (existingUser) {
    return { error: "Вече има регистриран потребител с този имейл." };
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

  await createSession({
    userId: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
  });

  redirect("/");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(getStringValue(formData, "email"));
  const password = getStringValue(formData, "password");

  if (!email || !password) {
    return { error: "Моля, въведете имейл и парола." };
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
    return { error: "Невалиден имейл или парола." };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "Невалиден имейл или парола." };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  redirect(getSafeRedirectPath(formData));
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

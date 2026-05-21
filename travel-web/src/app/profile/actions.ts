"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export type ChangePasswordActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export type UpdateProfileActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfileAction(
  _previousState: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/profile");
  }

  const name = getStringValue(formData, "name");

  if (name.length < 2) {
    return { error: "Името трябва да бъде поне 2 символа." };
  }

  if (name === currentUser.name) {
    return { error: "Въведете различно име." };
  }

  await db
    .update(users)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id));

  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/manager");

  return {
    success: true,
    message: "Името е обновено успешно.",
  };
}

export async function changePasswordAction(
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/profile");
  }

  const currentPassword = getStringValue(formData, "currentPassword");
  const newPassword = getStringValue(formData, "newPassword");
  const confirmPassword = getStringValue(formData, "confirmPassword");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Попълнете всички полета за смяна на паролата." };
  }

  if (newPassword.length < 6) {
    return { error: "Новата парола трябва да бъде поне 6 символа." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Новата парола и потвърждението не съвпадат." };
  }

  if (currentPassword === newPassword) {
    return { error: "Новата парола трябва да бъде различна от текущата." };
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
    return { error: "Профилът не е намерен." };
  }

  const passwordMatches = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return { error: "Текущата парола е невалидна." };
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id));

  revalidatePath("/profile");

  return {
    success: true,
    message: "Паролата е сменена успешно.",
  };
}

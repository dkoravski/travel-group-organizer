"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  addGroupMemberByEmail,
  createTravelGroup,
  removeGroupMember,
} from "@/services/groupService";
import { revalidatePath } from "next/cache";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type AddGroupMemberActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function createGroupAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/groups/create");
  }

  const name = getStringValue(formData, "name");
  const description = getStringValue(formData, "description");
  const imageUrl = getStringValue(formData, "imageUrl");
  const visibility = getStringValue(formData, "visibility");

  if (!name) {
    throw new Error("Името на групата е задължително.");
  }

  const group = await createTravelGroup({
    name,
    description,
    imageUrl,
    ownerId: currentUser.id,
    visibility: visibility === "public" ? "public" : "private",
  });

  redirect(`/groups/${group.id}`);
}

export async function removeGroupMemberAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/groups");
  }

  const groupId = Number(getStringValue(formData, "groupId"));
  const memberUserId = Number(getStringValue(formData, "memberUserId"));

  if (
    !Number.isInteger(groupId) ||
    groupId <= 0 ||
    !Number.isInteger(memberUserId) ||
    memberUserId <= 0
  ) {
    throw new Error("Невалиден участник.");
  }

  const removed = await removeGroupMember(
    groupId,
    memberUserId,
    currentUser.id,
  );

  if (!removed) {
    throw new Error("Нямате права да премахнете този участник.");
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/manager");
}

export async function addGroupMemberByEmailAction(
  _previousState: AddGroupMemberActionState,
  formData: FormData,
): Promise<AddGroupMemberActionState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirectTo=/groups");
  }

  const groupId = Number(getStringValue(formData, "groupId"));
  const email = getStringValue(formData, "email").toLowerCase();

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { error: "Невалидна група." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Въведете валиден имейл адрес." };
  }

  const result = await addGroupMemberByEmail(groupId, email, currentUser.id);

  if (!result.ok) {
    if (result.reason === "user-not-found") {
      return { error: "Няма регистриран потребител с този имейл адрес." };
    }

    if (result.reason === "already-member") {
      return { error: "Този потребител вече е член на групата." };
    }

    return { error: "Нямате права да добавяте участници в тази група." };
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/manager");

  return {
    success: true,
    message: `${result.user?.name ?? "Потребителят"} е добавен като участник в групата.`,
  };
}

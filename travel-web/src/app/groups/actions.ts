"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createTravelGroup } from "@/services/groupService";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

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
    throw new Error("Group name is required.");
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

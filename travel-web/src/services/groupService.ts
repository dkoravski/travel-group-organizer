import "server-only";

import { and, asc, count, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  groupMembers,
  travelGroups,
  tripParticipants,
  trips,
  users,
} from "@/db/schema";

type CreateGroupInput = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  visibility: "public" | "private";
  ownerId: number;
};

export async function createTravelGroup(input: CreateGroupInput) {
  const [group] = await db
    .insert(travelGroups)
    .values({
      name: input.name,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      ownerId: input.ownerId,
      visibility: input.visibility,
    })
    .returning({ id: travelGroups.id });

  await db.insert(groupMembers).values({
    groupId: group.id,
    userId: input.ownerId,
    role: "manager",
  });

  return group;
}

export async function userCanViewGroup(groupId: number, userId: number) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
    )
    .limit(1);

  return Boolean(membership);
}

export async function getGroupDetails(groupId: number) {
  const [group] = await db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
      description: travelGroups.description,
      visibility: travelGroups.visibility,
      createdAt: travelGroups.createdAt,
      ownerName: users.name,
      membersCount: count(groupMembers.id),
    })
    .from(travelGroups)
    .innerJoin(users, eq(users.id, travelGroups.ownerId))
    .leftJoin(groupMembers, eq(groupMembers.groupId, travelGroups.id))
    .where(eq(travelGroups.id, groupId))
    .groupBy(travelGroups.id, users.name)
    .limit(1);

  return group
    ? {
        ...group,
        membersCount: Number(group.membersCount),
      }
    : null;
}

export async function getGroupMembers(groupId: number) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(groupMembers.role), asc(users.name));
}

export async function getGroupTrips(groupId: number) {
  const rows = await db
    .select({
      id: trips.id,
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      participantsCount: count(tripParticipants.id),
    })
    .from(trips)
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .where(eq(trips.groupId, groupId))
    .groupBy(trips.id)
    .orderBy(asc(trips.startDate))
    .limit(6);

  return rows.map((row) => ({
    ...row,
    participantsCount: Number(row.participantsCount),
  }));
}

export async function getUserGroups(userId: number) {
  return db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
    })
    .from(groupMembers)
    .innerJoin(travelGroups, eq(travelGroups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
}

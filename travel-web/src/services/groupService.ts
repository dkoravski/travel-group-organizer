import "server-only";

import { and, asc, count, eq, sql } from "drizzle-orm";

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

export async function userCanManageGroup(groupId: number, userId: number) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId),
        eq(groupMembers.role, "manager"),
      ),
    )
    .limit(1);

  return Boolean(membership);
}

export async function userHasManagedGroups(userId: number) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.role, "manager")))
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
      ownerId: travelGroups.ownerId,
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

export async function getGroupTrips(groupId: number, userId: number) {
  const rows = await db
    .select({
      id: trips.id,
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      imageUrl: trips.imageUrl,
      canceled: trips.canceled,
      participantsCount: count(tripParticipants.id),
      isJoined: sql<boolean>`exists (
        select 1
        from ${tripParticipants} user_participation
        where user_participation.trip_id = ${trips.id}
          and user_participation.user_id = ${userId}
      )`,
    })
    .from(trips)
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .where(eq(trips.groupId, groupId))
    .groupBy(trips.id)
    .orderBy(asc(trips.startDate));

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

export async function getUserGroupsOverview(userId: number) {
  return db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
      description: travelGroups.description,
      visibility: travelGroups.visibility,
      role: groupMembers.role,
      createdAt: travelGroups.createdAt,
      membersCount: sql<number>`(
        select count(*)
        from ${groupMembers} all_members
        where all_members.group_id = ${travelGroups.id}
      )`,
      tripsCount: sql<number>`(
        select count(*)
        from ${trips}
        where ${trips.groupId} = ${travelGroups.id}
      )`,
    })
    .from(groupMembers)
    .innerJoin(travelGroups, eq(travelGroups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId))
    .orderBy(asc(travelGroups.name))
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        membersCount: Number(row.membersCount),
        tripsCount: Number(row.tripsCount),
      })),
    );
}

export async function getManagedGroups(userId: number) {
  return db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
      description: travelGroups.description,
      visibility: travelGroups.visibility,
      membersCount: sql<number>`(
        select count(*)
        from ${groupMembers} all_members
        where all_members.group_id = ${travelGroups.id}
      )`,
      tripsCount: sql<number>`(
        select count(*)
        from ${trips}
        where ${trips.groupId} = ${travelGroups.id}
      )`,
    })
    .from(groupMembers)
    .innerJoin(travelGroups, eq(travelGroups.id, groupMembers.groupId))
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.role, "manager")))
    .orderBy(asc(travelGroups.name))
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        membersCount: Number(row.membersCount),
        tripsCount: Number(row.tripsCount),
      })),
    );
}

export async function addGroupMemberByEmail(
  groupId: number,
  email: string,
  managerUserId: number,
) {
  const canManageGroup = await userCanManageGroup(groupId, managerUserId);

  if (!canManageGroup) {
    return { ok: false, reason: "not-manager" as const };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1);

  if (!user) {
    return { ok: false, reason: "user-not-found" as const };
  }

  const [existingMembership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)))
    .limit(1);

  if (existingMembership) {
    return { ok: false, reason: "already-member" as const };
  }

  await db.insert(groupMembers).values({
    groupId,
    userId: user.id,
    role: "member",
  });

  return { ok: true as const, user };
}

export async function removeGroupMember(
  groupId: number,
  memberUserId: number,
  managerUserId: number,
) {
  const [member] = await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, memberUserId),
        eq(groupMembers.role, "member"),
        sql`exists (
          select 1
          from ${groupMembers} manager_membership
          where manager_membership.group_id = ${groupId}
            and manager_membership.user_id = ${managerUserId}
            and manager_membership.role = 'manager'
        )`,
        sql`not exists (
          select 1
          from ${travelGroups}
          where ${travelGroups.id} = ${groupId}
            and ${travelGroups.ownerId} = ${memberUserId}
        )`,
      ),
    )
    .returning({ id: groupMembers.id });

  if (!member) {
    return false;
  }

  await db.delete(tripParticipants).where(
    and(
      eq(tripParticipants.userId, memberUserId),
      sql`exists (
        select 1
        from ${trips}
        where ${trips.id} = ${tripParticipants.tripId}
          and ${trips.groupId} = ${groupId}
      )`,
    ),
  );

  return true;
}

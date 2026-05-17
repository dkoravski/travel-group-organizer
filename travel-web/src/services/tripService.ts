import "server-only";

import { and, asc, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  groupMembers,
  travelGroups,
  tripParticipants,
  trips,
} from "@/db/schema";

type CreateTripInput = {
  groupId: number;
  title: string;
  destination: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  meetingPoint?: string | null;
  capacity?: number | null;
  estimatedBudget?: string | null;
  createdBy: number;
};

export async function userCanCreateTrip(groupId: number, userId: number) {
  const [membership] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);

  return Boolean(membership);
}

export async function createTrip(input: CreateTripInput) {
  await db.insert(trips).values({
    groupId: input.groupId,
    title: input.title,
    description: input.description || null,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    meetingPoint: input.meetingPoint || null,
    capacity: input.capacity ?? null,
    estimatedBudget: input.estimatedBudget || null,
    createdBy: input.createdBy,
  });
}

export async function getAllTrips(userId: number, onlyMyGroups = true) {
  const base = db
    .select({
      id: trips.id,
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      canceled: trips.canceled,
      createdBy: trips.createdBy,
      groupName: travelGroups.name,
      participantsCount: count(tripParticipants.id),
      isJoined: sql<boolean>`exists (
        select 1
        from ${tripParticipants} user_participation
        where user_participation.trip_id = ${trips.id}
          and user_participation.user_id = ${userId}
      )`,
    })
    .from(trips)
    .innerJoin(travelGroups, eq(travelGroups.id, trips.groupId));

  const withOptionalFilter = onlyMyGroups
    ? base.innerJoin(
        groupMembers,
        and(eq(groupMembers.groupId, travelGroups.id), eq(groupMembers.userId, userId)),
      )
    : base;

  const rows = await withOptionalFilter
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .groupBy(trips.id, travelGroups.name)
    .orderBy(asc(trips.startDate));

  return rows.map((row) => ({
    ...row,
    participantsCount: Number(row.participantsCount),
  }));
}

export async function getTripDetails(tripId: number, userId: number) {
  const [trip] = await db
    .select({
      id: trips.id,
      groupId: trips.groupId,
      title: trips.title,
      description: trips.description,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      meetingPoint: trips.meetingPoint,
      capacity: trips.capacity,
      estimatedBudget: trips.estimatedBudget,
      canceled: trips.canceled,
      createdBy: trips.createdBy,
      createdAt: trips.createdAt,
      updatedAt: trips.updatedAt,
      groupName: travelGroups.name,
      participantsCount: count(tripParticipants.id),
      isGroupMember: sql<boolean>`exists (
        select 1
        from ${groupMembers} user_membership
        where user_membership.group_id = ${trips.groupId}
          and user_membership.user_id = ${userId}
      )`,
      isJoined: sql<boolean>`exists (
        select 1
        from ${tripParticipants} user_participation
        where user_participation.trip_id = ${trips.id}
          and user_participation.user_id = ${userId}
      )`,
    })
    .from(trips)
    .innerJoin(travelGroups, eq(travelGroups.id, trips.groupId))
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .where(eq(trips.id, tripId))
    .groupBy(trips.id, travelGroups.name)
    .limit(1);

  return trip
    ? {
        ...trip,
        participantsCount: Number(trip.participantsCount),
      }
    : null;
}

export async function joinTrip(tripId: number, userId: number) {
  await db
    .insert(tripParticipants)
    .values({
      tripId,
      userId,
      guestsCount: 0,
    })
    .onConflictDoNothing();
}

export async function leaveTrip(tripId: number, userId: number) {
  await db
    .delete(tripParticipants)
    .where(
      and(eq(tripParticipants.tripId, tripId), eq(tripParticipants.userId, userId)),
    );
}

export async function cancelTrip(tripId: number, userId: number) {
  await db
    .update(trips)
    .set({
      canceled: true,
      updatedAt: new Date(),
    })
    .where(and(eq(trips.id, tripId), eq(trips.createdBy, userId)));
}

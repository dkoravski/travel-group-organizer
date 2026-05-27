import "server-only";

import { and, asc, count, eq, gte, inArray, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { DashboardGroup } from "@/components/DashboardGroupCard";
import type { DashboardTrip } from "@/components/DashboardTripCard";
import { db } from "@/db";
import {
  groupMembers,
  travelGroups,
  tripParticipants,
  trips,
} from "@/db/schema";

export async function getDashboardData(userId: number) {
  const today = new Date().toISOString().slice(0, 10);
  const memberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, userId));

  const groupIds = memberships.map((membership) => membership.groupId);

  if (groupIds.length === 0) {
    return {
      groups: [],
      upcomingTrips: [],
      searchableTrips: [],
    };
  }

  const [groups, upcomingTrips, searchableTrips] = await Promise.all([
    getDashboardGroups(groupIds, userId),
    getDashboardTrips(groupIds, today, userId, {
      includePastTrips: false,
      limit: 3,
    }),
    getDashboardTrips(groupIds, today, userId, {
      includePastTrips: true,
    }),
  ]);

  return {
    groups,
    upcomingTrips,
    searchableTrips,
  };
}

async function getDashboardGroups(
  groupIds: number[],
  userId: number,
): Promise<DashboardGroup[]> {
  const currentUserMembership = alias(groupMembers, "current_user_membership");

  const rows = await db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
      description: travelGroups.description,
      membersCount: count(groupMembers.id),
      currentUserRole: currentUserMembership.role,
    })
    .from(travelGroups)
    .leftJoin(groupMembers, eq(groupMembers.groupId, travelGroups.id))
    .innerJoin(
      currentUserMembership,
      and(
        eq(currentUserMembership.groupId, travelGroups.id),
        eq(currentUserMembership.userId, userId),
      ),
    )
    .where(inArray(travelGroups.id, groupIds))
    .groupBy(travelGroups.id, currentUserMembership.role)
    .orderBy(asc(travelGroups.name));

  return rows.map((row) => ({
    ...row,
    membersCount: Number(row.membersCount),
  }));
}

async function getDashboardTrips(
  groupIds: number[],
  today: string,
  userId: number,
  {
    includePastTrips,
    limit,
  }: {
    includePastTrips: boolean;
    limit?: number;
  },
): Promise<DashboardTrip[]> {
  const filters: SQL[] = [
    inArray(trips.groupId, groupIds),
    eq(trips.canceled, false),
  ];

  if (!includePastTrips) {
    filters.push(gte(trips.endDate, today));
  }

  const query = db
    .select({
      id: trips.id,
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      participantsCount: sql<number>`coalesce(sum(coalesce(${tripParticipants.guestsCount}, 0) + 1), 0)`,
      isJoined: sql<boolean>`exists (
        select 1
        from ${tripParticipants} user_participation
        where user_participation.trip_id = ${trips.id}
          and user_participation.user_id = ${userId}
      )`,
      status: sql<"upcoming" | "current" | "past">`
        case
          when ${trips.startDate} <= ${today} and ${trips.endDate} >= ${today}
          then 'current'
          when ${trips.endDate} < ${today}
          then 'past'
          else 'upcoming'
        end
      `,
    })
    .from(trips)
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .where(and(...filters))
    .groupBy(trips.id)
    .orderBy(asc(trips.startDate));

  const rows = await (limit ? query.limit(limit) : query);

  return rows.map((row) => ({
    ...row,
    participantsCount: Number(row.participantsCount),
  }));
}

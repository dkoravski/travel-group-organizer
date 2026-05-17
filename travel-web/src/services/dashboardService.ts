import "server-only";

import { and, asc, count, eq, gte, inArray, sql } from "drizzle-orm";

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
    };
  }

  const [groups, upcomingTrips] = await Promise.all([
    getDashboardGroups(groupIds),
    getDashboardTrips(groupIds, today),
  ]);

  return {
    groups,
    upcomingTrips,
  };
}

async function getDashboardGroups(groupIds: number[]): Promise<DashboardGroup[]> {
  const rows = await db
    .select({
      id: travelGroups.id,
      name: travelGroups.name,
      description: travelGroups.description,
      membersCount: count(groupMembers.id),
    })
    .from(travelGroups)
    .leftJoin(groupMembers, eq(groupMembers.groupId, travelGroups.id))
    .where(inArray(travelGroups.id, groupIds))
    .groupBy(travelGroups.id)
    .orderBy(asc(travelGroups.name))
    .limit(3);

  return rows.map((row) => ({
    ...row,
    membersCount: Number(row.membersCount),
  }));
}

async function getDashboardTrips(
  groupIds: number[],
  today: string,
): Promise<DashboardTrip[]> {
  const rows = await db
    .select({
      id: trips.id,
      title: trips.title,
      destination: trips.destination,
      startDate: trips.startDate,
      endDate: trips.endDate,
      participantsCount: count(tripParticipants.id),
      status: sql<"upcoming" | "current">`
        case
          when ${trips.startDate} <= ${today} and ${trips.endDate} >= ${today}
          then 'current'
          else 'upcoming'
        end
      `,
    })
    .from(trips)
    .leftJoin(tripParticipants, eq(tripParticipants.tripId, trips.id))
    .where(
      and(
        inArray(trips.groupId, groupIds),
        eq(trips.canceled, false),
        gte(trips.endDate, today),
      ),
    )
    .groupBy(trips.id)
    .orderBy(asc(trips.startDate))
    .limit(3);

  return rows.map((row) => ({
    ...row,
    participantsCount: Number(row.participantsCount),
  }));
}

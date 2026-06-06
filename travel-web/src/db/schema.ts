import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const groupVisibilityEnum = pgEnum("group_visibility", [
  "public",
  "private",
]);

export const groupMemberRoleEnum = pgEnum("group_member_role", [
  "member",
  "manager",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const travelGroups = pgTable(
  "travel_groups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    visibility: groupVisibilityEnum("visibility").default("private").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("travel_groups_owner_id_idx").on(table.ownerId),
    index("travel_groups_visibility_idx").on(table.visibility),
  ],
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => travelGroups.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: groupMemberRoleEnum("role").default("member").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("group_members_group_id_user_id_unique").on(
      table.groupId,
      table.userId,
    ),
    index("group_members_user_id_idx").on(table.userId),
  ],
);

export const groupInvites = pgTable(
  "group_invites",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => travelGroups.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("group_invites_token_unique").on(table.token),
    index("group_invites_group_id_idx").on(table.groupId),
  ],
);

export const trips = pgTable(
  "trips",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => travelGroups.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    destination: varchar("destination", { length: 180 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    meetingPoint: text("meeting_point"),
    capacity: integer("capacity"),
    estimatedBudget: numeric("estimated_budget", {
      precision: 10,
      scale: 2,
    }),
    imageUrl: text("image_url"),
    canceled: boolean("canceled").default(false).notNull(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("trips_group_id_idx").on(table.groupId),
    index("trips_created_by_idx").on(table.createdBy),
    check("trips_capacity_positive", sql`${table.capacity} is null or ${table.capacity} > 0`),
    check("trips_dates_valid", sql`${table.endDate} >= ${table.startDate}`),
    check(
      "trips_estimated_budget_non_negative",
      sql`${table.estimatedBudget} is null or ${table.estimatedBudget} >= 0`,
    ),
  ],
);

export const tripParticipants = pgTable(
  "trip_participants",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    guestsCount: integer("guests_count").default(0).notNull(),
    transportPreference: varchar("transport_preference", { length: 120 }),
    accommodationPreference: varchar("accommodation_preference", {
      length: 120,
    }),
    note: text("note"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("trip_participants_trip_id_user_id_unique").on(
      table.tripId,
      table.userId,
    ),
    index("trip_participants_user_id_idx").on(table.userId),
    check("trip_participants_guests_count_non_negative", sql`${table.guestsCount} >= 0`),
  ],
);

export const tripComments = pgTable(
  "trip_comments",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("trip_comments_trip_id_idx").on(table.tripId),
    index("trip_comments_user_id_idx").on(table.userId),
  ],
);

export const itineraryItems = pgTable(
  "itinerary_items",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    location: varchar("location", { length: 180 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    estimatedCost: numeric("estimated_cost", {
      precision: 10,
      scale: 2,
    }),
  },
  (table) => [
    index("itinerary_items_trip_id_idx").on(table.tripId),
    check("itinerary_items_sort_order_non_negative", sql`${table.sortOrder} >= 0`),
    check(
      "itinerary_items_estimated_cost_non_negative",
      sql`${table.estimatedCost} is null or ${table.estimatedCost} >= 0`,
    ),
  ],
);

export const packingItems = pgTable(
  "packing_items",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [
    index("packing_items_trip_id_idx").on(table.tripId),
    index("packing_items_created_by_idx").on(table.createdBy),
  ],
);

export const packingItemChecks = pgTable(
  "packing_item_checks",
  {
    id: serial("id").primaryKey(),
    packingItemId: integer("packing_item_id")
      .notNull()
      .references(() => packingItems.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checked: boolean("checked").default(false).notNull(),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("packing_item_checks_item_id_user_id_unique").on(
      table.packingItemId,
      table.userId,
    ),
    index("packing_item_checks_user_id_idx").on(table.userId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  ownedGroups: many(travelGroups),
  groupMemberships: many(groupMembers),
  createdInvites: many(groupInvites),
  createdTrips: many(trips),
  tripParticipants: many(tripParticipants),
  tripComments: many(tripComments),
  packingItems: many(packingItems),
  packingItemChecks: many(packingItemChecks),
}));

export const travelGroupsRelations = relations(travelGroups, ({ one, many }) => ({
  owner: one(users, {
    fields: [travelGroups.ownerId],
    references: [users.id],
  }),
  members: many(groupMembers),
  invites: many(groupInvites),
  trips: many(trips),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(travelGroups, {
    fields: [groupMembers.groupId],
    references: [travelGroups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const groupInvitesRelations = relations(groupInvites, ({ one }) => ({
  group: one(travelGroups, {
    fields: [groupInvites.groupId],
    references: [travelGroups.id],
  }),
  creator: one(users, {
    fields: [groupInvites.createdBy],
    references: [users.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  group: one(travelGroups, {
    fields: [trips.groupId],
    references: [travelGroups.id],
  }),
  creator: one(users, {
    fields: [trips.createdBy],
    references: [users.id],
  }),
  participants: many(tripParticipants),
  comments: many(tripComments),
  itineraryItems: many(itineraryItems),
  packingItems: many(packingItems),
}));

export const tripParticipantsRelations = relations(
  tripParticipants,
  ({ one }) => ({
    trip: one(trips, {
      fields: [tripParticipants.tripId],
      references: [trips.id],
    }),
    user: one(users, {
      fields: [tripParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const tripCommentsRelations = relations(tripComments, ({ one }) => ({
  trip: one(trips, {
    fields: [tripComments.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [tripComments.userId],
    references: [users.id],
  }),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryItems.tripId],
    references: [trips.id],
  }),
}));

export const packingItemsRelations = relations(packingItems, ({ one, many }) => ({
  trip: one(trips, {
    fields: [packingItems.tripId],
    references: [trips.id],
  }),
  creator: one(users, {
    fields: [packingItems.createdBy],
    references: [users.id],
  }),
  checks: many(packingItemChecks),
}));

export const packingItemChecksRelations = relations(
  packingItemChecks,
  ({ one }) => ({
    packingItem: one(packingItems, {
      fields: [packingItemChecks.packingItemId],
      references: [packingItems.id],
    }),
    user: one(users, {
      fields: [packingItemChecks.userId],
      references: [users.id],
    }),
  }),
);

import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

import {
  groupInvites,
  groupMembers,
  itineraryItems,
  packingItemChecks,
  packingItems,
  travelGroups,
  tripComments,
  tripParticipants,
  trips,
  users,
} from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(neon(databaseUrl));

const baseDate = new Date("2026-05-17T09:00:00.000Z");

function daysFromBase(days: number, hour = 9, minute = 0) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

function dateOnly(days: number) {
  return daysFromBase(days).toISOString().slice(0, 10);
}

function money(value: number) {
  return value.toFixed(2);
}

async function main() {
  console.log("Resetting app tables...");

  await db.execute(sql`
    truncate table
      packing_item_checks,
      packing_items,
      itinerary_items,
      trip_comments,
      trip_participants,
      trips,
      group_invites,
      group_members,
      travel_groups,
      users
    restart identity cascade
  `);

  const passwordHash = await hash("pass123", 10);

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Иван Димитров",
        email: "IvanD@gmail.com",
        passwordHash,
        avatarUrl: "https://i.pravatar.cc/150?u=IvanD@gmail.com",
        createdAt: daysFromBase(-180),
        updatedAt: daysFromBase(-12),
      },
      {
        name: "Стоян Стоянов",
        email: "StoyanS@gmail.com",
        passwordHash,
        avatarUrl: "https://i.pravatar.cc/150?u=StoyanS@gmail.com",
        createdAt: daysFromBase(-160),
        updatedAt: daysFromBase(-6),
      },
      {
        name: "Христо Михайлов",
        email: "HristoM@gmail.com",
        passwordHash,
        avatarUrl: "https://i.pravatar.cc/150?u=HristoM@gmail.com",
        createdAt: daysFromBase(-145),
        updatedAt: daysFromBase(-4),
      },
      {
        name: "Георги Георгиев",
        email: "GeorgiG@gmail.com",
        passwordHash,
        avatarUrl: "https://i.pravatar.cc/150?u=GeorgiG@gmail.com",
        createdAt: daysFromBase(-130),
        updatedAt: daysFromBase(-2),
      },
      {
        name: "Николай Николов",
        email: "NikolayN@gmail.com",
        passwordHash,
        avatarUrl: "https://i.pravatar.cc/150?u=NikolayN@gmail.com",
        createdAt: daysFromBase(-120),
        updatedAt: daysFromBase(-1),
      },
      ...Array.from({ length: 9 }, (_, index) => {
        const number = index + 1;

        return {
          name: `Потребител ${number}`,
          email: `user${number}@gmail.com`,
          passwordHash,
          avatarUrl: `https://i.pravatar.cc/150?u=user${number}@gmail.com`,
          createdAt: daysFromBase(-100 + index * 4),
          updatedAt: daysFromBase(-8 + index),
        };
      }),
    ])
    .returning({ id: users.id, email: users.email });

  const userIdByEmail = new Map(
    insertedUsers.map((user) => [user.email, user.id]),
  );

  const userId = (email: string) => {
    const id = userIdByEmail.get(email);

    if (!id) {
      throw new Error(`Missing seeded user: ${email}`);
    }

    return id;
  };

  const insertedGroups = await db
    .insert(travelGroups)
    .values([
      {
        name: "Weekend Travelers",
        description:
          "Кратки уикенд пътувания от София до близки градове, минерални басейни и вкусни ресторанти.",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        ownerId: userId("IvanD@gmail.com"),
        visibility: "public",
        createdAt: daysFromBase(-95),
      },
      {
        name: "Balkan Road Trips",
        description:
          "Пътешествия с коли из Балканите с гъвкав маршрут, споделени разходи и много спирки по пътя.",
        imageUrl:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
        ownerId: userId("StoyanS@gmail.com"),
        visibility: "private",
        createdAt: daysFromBase(-88),
      },
      {
        name: "Hiking Bulgaria",
        description:
          "Планински преходи за хора, които обичат Рила, Пирин, Родопите и ранното тръгване.",
        imageUrl:
          "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
        ownerId: userId("HristoM@gmail.com"),
        visibility: "public",
        createdAt: daysFromBase(-82),
      },
      {
        name: "City Break Crew",
        description:
          "Градски бягства с музеи, кафенета, пазари и добре подбрани квартири близо до центъра.",
        imageUrl:
          "https://images.unsplash.com/photo-1494526585095-c41746248156",
        ownerId: userId("GeorgiG@gmail.com"),
        visibility: "public",
        createdAt: daysFromBase(-76),
      },
      {
        name: "Adventure Seekers",
        description:
          "Рафтинг, ски, къмпинг, пещери и активни преживявания за малки групи приятели.",
        imageUrl:
          "https://images.unsplash.com/photo-1526772662000-3f88f10405ff",
        ownerId: userId("NikolayN@gmail.com"),
        visibility: "private",
        createdAt: daysFromBase(-70),
      },
    ])
    .returning({ id: travelGroups.id, name: travelGroups.name });

  const groupIdByName = new Map(
    insertedGroups.map((group) => [group.name, group.id]),
  );

  const groupId = (name: string) => {
    const id = groupIdByName.get(name);

    if (!id) {
      throw new Error(`Missing seeded group: ${name}`);
    }

    return id;
  };

  await db.insert(groupMembers).values([
    {
      groupId: groupId("Weekend Travelers"),
      userId: userId("IvanD@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-95),
    },
    {
      groupId: groupId("Weekend Travelers"),
      userId: userId("StoyanS@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-90),
    },
    {
      groupId: groupId("Weekend Travelers"),
      userId: userId("user1@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-72),
    },
    {
      groupId: groupId("Weekend Travelers"),
      userId: userId("user2@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-58),
    },
    {
      groupId: groupId("Balkan Road Trips"),
      userId: userId("StoyanS@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-88),
    },
    {
      groupId: groupId("Balkan Road Trips"),
      userId: userId("GeorgiG@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-80),
    },
    {
      groupId: groupId("Balkan Road Trips"),
      userId: userId("user3@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-61),
    },
    {
      groupId: groupId("Balkan Road Trips"),
      userId: userId("user4@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-51),
    },
    {
      groupId: groupId("Hiking Bulgaria"),
      userId: userId("HristoM@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-82),
    },
    {
      groupId: groupId("Hiking Bulgaria"),
      userId: userId("NikolayN@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-70),
    },
    {
      groupId: groupId("Hiking Bulgaria"),
      userId: userId("user5@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-45),
    },
    {
      groupId: groupId("Hiking Bulgaria"),
      userId: userId("user6@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-31),
    },
    {
      groupId: groupId("City Break Crew"),
      userId: userId("GeorgiG@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-76),
    },
    {
      groupId: groupId("City Break Crew"),
      userId: userId("IvanD@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-64),
    },
    {
      groupId: groupId("City Break Crew"),
      userId: userId("user7@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-47),
    },
    {
      groupId: groupId("City Break Crew"),
      userId: userId("user8@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-35),
    },
    {
      groupId: groupId("Adventure Seekers"),
      userId: userId("NikolayN@gmail.com"),
      role: "manager",
      joinedAt: daysFromBase(-70),
    },
    {
      groupId: groupId("Adventure Seekers"),
      userId: userId("HristoM@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-60),
    },
    {
      groupId: groupId("Adventure Seekers"),
      userId: userId("user8@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-36),
    },
    {
      groupId: groupId("Adventure Seekers"),
      userId: userId("user9@gmail.com"),
      role: "member",
      joinedAt: daysFromBase(-21),
    },
  ]);

  await db.insert(groupInvites).values([
    {
      groupId: groupId("Weekend Travelers"),
      token: `invite-${randomUUID()}`,
      createdBy: userId("IvanD@gmail.com"),
      expiresAt: daysFromBase(14, 23, 59),
      createdAt: daysFromBase(-2),
    },
    {
      groupId: groupId("Balkan Road Trips"),
      token: `invite-${randomUUID()}`,
      createdBy: userId("StoyanS@gmail.com"),
      expiresAt: daysFromBase(21, 23, 59),
      createdAt: daysFromBase(-1),
    },
    {
      groupId: groupId("Hiking Bulgaria"),
      token: `invite-${randomUUID()}`,
      createdBy: userId("HristoM@gmail.com"),
      expiresAt: daysFromBase(10, 23, 59),
      usedAt: daysFromBase(-1, 18, 30),
      createdAt: daysFromBase(-8),
    },
    {
      groupId: groupId("City Break Crew"),
      token: `invite-${randomUUID()}`,
      createdBy: userId("GeorgiG@gmail.com"),
      expiresAt: daysFromBase(30, 23, 59),
      createdAt: daysFromBase(-3),
    },
    {
      groupId: groupId("Adventure Seekers"),
      token: `invite-${randomUUID()}`,
      createdBy: userId("NikolayN@gmail.com"),
      expiresAt: daysFromBase(7, 23, 59),
      createdAt: daysFromBase(-4),
    },
  ]);

  const insertedTrips = await db
    .insert(trips)
    .values([
      {
        groupId: groupId("Weekend Travelers"),
        title: "Weekend in Thessaloniki",
        description:
          "Два дни край морето с разходка по крайбрежната алея, таверна и свободно време за пазар.",
        destination: "Thessaloniki, Greece",
        startDate: dateOnly(19),
        endDate: dateOnly(21),
        meetingPoint: "София, паркингът пред Националния стадион",
        capacity: 12,
        estimatedBudget: money(280),
        canceled: false,
        createdBy: userId("IvanD@gmail.com"),
        createdAt: daysFromBase(-20),
        updatedAt: daysFromBase(-4),
      },
      {
        groupId: groupId("Adventure Seekers"),
        title: "Bansko Ski Trip",
        description:
          "Ски уикенд в Банско с ранно тръгване, общ трансфер и вечеря в механа.",
        destination: "Bansko, Bulgaria",
        startDate: dateOnly(-95),
        endDate: dateOnly(-92),
        meetingPoint: "Метростанция Васил Левски, София",
        capacity: 10,
        estimatedBudget: money(420),
        canceled: false,
        createdBy: userId("NikolayN@gmail.com"),
        createdAt: daysFromBase(-135),
        updatedAt: daysFromBase(-90),
      },
      {
        groupId: groupId("Hiking Bulgaria"),
        title: "Hiking the Seven Rila Lakes",
        description:
          "Еднодневен преход до Седемте рилски езера с умерено темпо и пикник до Бъбрека.",
        destination: "Seven Rila Lakes, Bulgaria",
        startDate: dateOnly(34),
        endDate: dateOnly(34),
        meetingPoint: "София, автогара Овча купел",
        capacity: 16,
        estimatedBudget: money(75),
        canceled: false,
        createdBy: userId("HristoM@gmail.com"),
        createdAt: daysFromBase(-16),
        updatedAt: daysFromBase(-2),
      },
      {
        groupId: groupId("Balkan Road Trips"),
        title: "Istanbul Food Tour",
        description:
          "Дълъг уикенд с улична храна, ферибот до Кадъкьой и вечерна разходка около Галата.",
        destination: "Istanbul, Turkey",
        startDate: dateOnly(7),
        endDate: dateOnly(10),
        meetingPoint: "Пловдив, паркинг Метро Тракия",
        capacity: 8,
        estimatedBudget: money(520),
        canceled: false,
        createdBy: userId("StoyanS@gmail.com"),
        createdAt: daysFromBase(-30),
        updatedAt: daysFromBase(-1),
      },
      {
        groupId: groupId("City Break Crew"),
        title: "Vienna Christmas Market",
        description:
          "Коледен базар във Виена, музеи, кафе меланж и вечерна разходка около Rathausplatz.",
        destination: "Vienna, Austria",
        startDate: "2026-12-04",
        endDate: "2026-12-07",
        meetingPoint: "Летище София, Терминал 2",
        capacity: 9,
        estimatedBudget: money(790),
        canceled: false,
        createdBy: userId("GeorgiG@gmail.com"),
        createdAt: daysFromBase(-10),
        updatedAt: daysFromBase(-3),
      },
      {
        groupId: groupId("Weekend Travelers"),
        title: "Spa Weekend in Velingrad",
        description:
          "Релакс уикенд с минерални басейни, кратка разходка до Клептуза и обща вечеря.",
        destination: "Velingrad, Bulgaria",
        startDate: dateOnly(-2),
        endDate: dateOnly(0),
        meetingPoint: "София, Интер Експо Център",
        capacity: 14,
        estimatedBudget: money(240),
        canceled: false,
        createdBy: userId("IvanD@gmail.com"),
        createdAt: daysFromBase(-25),
        updatedAt: daysFromBase(-1),
      },
      {
        groupId: groupId("Balkan Road Trips"),
        title: "Belgrade Music Weekend",
        description:
          "Уикенд в Белград с жива музика, крепостта Калемегдан и вечеря в Скадарлия.",
        destination: "Belgrade, Serbia",
        startDate: dateOnly(55),
        endDate: dateOnly(57),
        meetingPoint: "София, Централна автогара",
        capacity: 10,
        estimatedBudget: money(360),
        canceled: false,
        createdBy: userId("GeorgiG@gmail.com"),
        createdAt: daysFromBase(-9),
        updatedAt: daysFromBase(-2),
      },
      {
        groupId: groupId("Hiking Bulgaria"),
        title: "Rhodope Villages Weekend",
        description:
          "Спокойно пътуване из Широка лъка, Гела и Смолянските езера с фолклорна вечер.",
        destination: "Rhodope Mountains, Bulgaria",
        startDate: dateOnly(-38),
        endDate: dateOnly(-36),
        meetingPoint: "Пловдив, Централна гара",
        capacity: 12,
        estimatedBudget: money(210),
        canceled: false,
        createdBy: userId("HristoM@gmail.com"),
        createdAt: daysFromBase(-70),
        updatedAt: daysFromBase(-34),
      },
      {
        groupId: groupId("City Break Crew"),
        title: "Budapest Thermal Baths",
        description:
          "Термални бани, дунавска панорама, ruin bars и свободно време около централния пазар.",
        destination: "Budapest, Hungary",
        startDate: dateOnly(88),
        endDate: dateOnly(91),
        meetingPoint: "Летище София, Терминал 2",
        capacity: 8,
        estimatedBudget: money(650),
        canceled: false,
        createdBy: userId("GeorgiG@gmail.com"),
        createdAt: daysFromBase(-6),
        updatedAt: daysFromBase(-1),
      },
      {
        groupId: groupId("Adventure Seekers"),
        title: "Kresna Gorge Rafting",
        description:
          "Рафтинг по Струма с инструктор, екипировка на място и обяд след спускането.",
        destination: "Kresna Gorge, Bulgaria",
        startDate: dateOnly(27),
        endDate: dateOnly(27),
        meetingPoint: "София, НДК, пилоните",
        capacity: 18,
        estimatedBudget: money(95),
        canceled: false,
        createdBy: userId("NikolayN@gmail.com"),
        createdAt: daysFromBase(-15),
        updatedAt: daysFromBase(-1),
      },
      {
        groupId: groupId("Weekend Travelers"),
        title: "Plovdiv Art Weekend",
        description:
          "Капана, Стария град, малки галерии и вечеря с резервация за цялата група.",
        destination: "Plovdiv, Bulgaria",
        startDate: dateOnly(-66),
        endDate: dateOnly(-64),
        meetingPoint: "София, Централна гара",
        capacity: 15,
        estimatedBudget: money(180),
        canceled: false,
        createdBy: userId("StoyanS@gmail.com"),
        createdAt: daysFromBase(-100),
        updatedAt: daysFromBase(-63),
      },
      {
        groupId: groupId("Adventure Seekers"),
        title: "Black Sea Camping",
        description:
          "Къмпинг край Синеморец с плаж, огън вечерта и ранно кафе до устието на Велека.",
        destination: "Sinemorets, Bulgaria",
        startDate: dateOnly(45),
        endDate: dateOnly(48),
        meetingPoint: "Бургас, жп гара",
        capacity: 14,
        estimatedBudget: money(230),
        canceled: true,
        createdBy: userId("NikolayN@gmail.com"),
        createdAt: daysFromBase(-18),
        updatedAt: daysFromBase(-5),
      },
    ])
    .returning({ id: trips.id, title: trips.title });

  const tripIdByTitle = new Map(insertedTrips.map((trip) => [trip.title, trip.id]));

  const tripId = (title: string) => {
    const id = tripIdByTitle.get(title);

    if (!id) {
      throw new Error(`Missing seeded trip: ${title}`);
    }

    return id;
  };

  await db.insert(tripParticipants).values([
    {
      tripId: tripId("Weekend in Thessaloniki"),
      userId: userId("IvanD@gmail.com"),
      guestsCount: 1,
      transportPreference: "Споделена кола",
      accommodationPreference: "Двойна стая близо до центъра",
      note: "Мога да карам на връщане.",
      joinedAt: daysFromBase(-18),
    },
    {
      tripId: tripId("Weekend in Thessaloniki"),
      userId: userId("user1@gmail.com"),
      guestsCount: 0,
      transportPreference: "Автобус",
      accommodationPreference: "Самостоятелна стая",
      joinedAt: daysFromBase(-17),
    },
    {
      tripId: tripId("Weekend in Thessaloniki"),
      userId: userId("user2@gmail.com"),
      guestsCount: 1,
      transportPreference: "Споделена кола",
      accommodationPreference: "Апартамент",
      note: "Ще се включа от Благоевград.",
      joinedAt: daysFromBase(-15),
    },
    {
      tripId: tripId("Istanbul Food Tour"),
      userId: userId("StoyanS@gmail.com"),
      guestsCount: 0,
      transportPreference: "Кола",
      accommodationPreference: "Хотел с паркинг",
      joinedAt: daysFromBase(-28),
    },
    {
      tripId: tripId("Istanbul Food Tour"),
      userId: userId("GeorgiG@gmail.com"),
      guestsCount: 1,
      transportPreference: "Кола",
      accommodationPreference: "Двойна стая",
      note: "Искам да минем през Одрин за обяд.",
      joinedAt: daysFromBase(-26),
    },
    {
      tripId: tripId("Istanbul Food Tour"),
      userId: userId("user3@gmail.com"),
      guestsCount: 0,
      transportPreference: "Нямам предпочитания",
      accommodationPreference: "Бюджетен хотел",
      joinedAt: daysFromBase(-23),
    },
    {
      tripId: tripId("Spa Weekend in Velingrad"),
      userId: userId("IvanD@gmail.com"),
      guestsCount: 0,
      transportPreference: "Кола",
      accommodationPreference: "Хотел със СПА",
      joinedAt: daysFromBase(-21),
    },
    {
      tripId: tripId("Spa Weekend in Velingrad"),
      userId: userId("StoyanS@gmail.com"),
      guestsCount: 1,
      transportPreference: "Влак",
      accommodationPreference: "Двойна стая",
      note: "Ще пристигна 30 минути по-късно.",
      joinedAt: daysFromBase(-19),
    },
    {
      tripId: tripId("Hiking the Seven Rila Lakes"),
      userId: userId("HristoM@gmail.com"),
      guestsCount: 0,
      transportPreference: "Микробус",
      accommodationPreference: "Не е нужно",
      joinedAt: daysFromBase(-14),
    },
    {
      tripId: tripId("Hiking the Seven Rila Lakes"),
      userId: userId("NikolayN@gmail.com"),
      guestsCount: 0,
      transportPreference: "Микробус",
      accommodationPreference: "Не е нужно",
      note: "Ще нося аптечка.",
      joinedAt: daysFromBase(-11),
    },
    {
      tripId: tripId("Hiking the Seven Rila Lakes"),
      userId: userId("user5@gmail.com"),
      guestsCount: 1,
      transportPreference: "Микробус",
      accommodationPreference: "Не е нужно",
      joinedAt: daysFromBase(-10),
    },
    {
      tripId: tripId("Vienna Christmas Market"),
      userId: userId("GeorgiG@gmail.com"),
      guestsCount: 0,
      transportPreference: "Самолет",
      accommodationPreference: "Хотел близо до метро",
      joinedAt: daysFromBase(-9),
    },
    {
      tripId: tripId("Vienna Christmas Market"),
      userId: userId("user7@gmail.com"),
      guestsCount: 1,
      transportPreference: "Самолет",
      accommodationPreference: "Двойна стая",
      joinedAt: daysFromBase(-8),
    },
    {
      tripId: tripId("Kresna Gorge Rafting"),
      userId: userId("NikolayN@gmail.com"),
      guestsCount: 0,
      transportPreference: "Кола",
      accommodationPreference: "Не е нужно",
      joinedAt: daysFromBase(-13),
    },
    {
      tripId: tripId("Kresna Gorge Rafting"),
      userId: userId("HristoM@gmail.com"),
      guestsCount: 0,
      transportPreference: "Споделена кола",
      accommodationPreference: "Не е нужно",
      note: "Имам водоустойчива камера.",
      joinedAt: daysFromBase(-12),
    },
    {
      tripId: tripId("Belgrade Music Weekend"),
      userId: userId("StoyanS@gmail.com"),
      guestsCount: 0,
      transportPreference: "Автобус",
      accommodationPreference: "Апартамент",
      joinedAt: daysFromBase(-8),
    },
    {
      tripId: tripId("Belgrade Music Weekend"),
      userId: userId("user4@gmail.com"),
      guestsCount: 1,
      transportPreference: "Кола",
      accommodationPreference: "Апартамент",
      joinedAt: daysFromBase(-7),
    },
    {
      tripId: tripId("Bansko Ski Trip"),
      userId: userId("NikolayN@gmail.com"),
      guestsCount: 0,
      transportPreference: "Микробус",
      accommodationPreference: "Къща за гости",
      joinedAt: daysFromBase(-130),
    },
    {
      tripId: tripId("Bansko Ski Trip"),
      userId: userId("user9@gmail.com"),
      guestsCount: 0,
      transportPreference: "Микробус",
      accommodationPreference: "Къща за гости",
      note: "Ще наема ски на място.",
      joinedAt: daysFromBase(-125),
    },
    {
      tripId: tripId("Black Sea Camping"),
      userId: userId("NikolayN@gmail.com"),
      guestsCount: 0,
      transportPreference: "Кола",
      accommodationPreference: "Палатка",
      note: "Отменено заради затворения къмпинг.",
      joinedAt: daysFromBase(-15),
    },
  ]);

  await db.insert(tripComments).values([
    {
      tripId: tripId("Weekend in Thessaloniki"),
      userId: userId("user2@gmail.com"),
      content: "Can someone pick me up from Plovdiv?",
      createdAt: daysFromBase(-10, 15, 10),
      updatedAt: daysFromBase(-10, 15, 10),
    },
    {
      tripId: tripId("Weekend in Thessaloniki"),
      userId: userId("IvanD@gmail.com"),
      content: "Ще имаме едно свободно място в колата от София.",
      createdAt: daysFromBase(-9, 9, 20),
      updatedAt: daysFromBase(-9, 9, 20),
    },
    {
      tripId: tripId("Istanbul Food Tour"),
      userId: userId("GeorgiG@gmail.com"),
      content: "I found a cheaper hotel option.",
      createdAt: daysFromBase(-7, 18, 5),
      updatedAt: daysFromBase(-7, 18, 5),
    },
    {
      tripId: tripId("Hiking the Seven Rila Lakes"),
      userId: userId("NikolayN@gmail.com"),
      content: "Weather forecast looks great.",
      createdAt: daysFromBase(-4, 12, 45),
      updatedAt: daysFromBase(-4, 12, 45),
    },
    {
      tripId: tripId("Spa Weekend in Velingrad"),
      userId: userId("StoyanS@gmail.com"),
      content: "I will arrive 30 minutes late.",
      createdAt: daysFromBase(-1, 16, 0),
      updatedAt: daysFromBase(-1, 16, 0),
    },
    {
      tripId: tripId("Vienna Christmas Market"),
      userId: userId("user7@gmail.com"),
      content: "Да резервираме ли билети за Шьонбрун предварително?",
      createdAt: daysFromBase(-6, 20, 20),
      updatedAt: daysFromBase(-6, 20, 20),
    },
    {
      tripId: tripId("Kresna Gorge Rafting"),
      userId: userId("HristoM@gmail.com"),
      content: "Ще донеса суха торба за телефони и документи.",
      createdAt: daysFromBase(-5, 10, 30),
      updatedAt: daysFromBase(-5, 10, 30),
    },
    {
      tripId: tripId("Black Sea Camping"),
      userId: userId("NikolayN@gmail.com"),
      content: "Отменям пътуването, защото къмпингът няма да отвори навреме.",
      createdAt: daysFromBase(-5, 8, 15),
      updatedAt: daysFromBase(-5, 8, 15),
    },
  ]);

  await db.insert(itineraryItems).values([
    {
      tripId: tripId("Weekend in Thessaloniki"),
      title: "Тръгване от София",
      description: "Кафе пауза след Благоевград и проверка на документите.",
      startsAt: daysFromBase(19, 7, 0),
      location: "Национален стадион Васил Левски",
      sortOrder: 1,
      estimatedCost: money(0),
    },
    {
      tripId: tripId("Weekend in Thessaloniki"),
      title: "Вечеря в Лададика",
      description: "Резервация за групата в малка таверна.",
      startsAt: daysFromBase(19, 20, 0),
      location: "Ladadika, Thessaloniki",
      sortOrder: 2,
      estimatedCost: money(35),
    },
    {
      tripId: tripId("Istanbul Food Tour"),
      title: "Ферибот до Кадъкьой",
      description: "Обяд с улична храна и разходка по пазара.",
      startsAt: daysFromBase(8, 11, 30),
      location: "Eminonu Ferry Pier",
      sortOrder: 1,
      estimatedCost: money(22),
    },
    {
      tripId: tripId("Hiking the Seven Rila Lakes"),
      title: "Начало на прехода",
      description: "Събиране при лифта, проверка на обувки, вода и якета.",
      startsAt: daysFromBase(34, 9, 30),
      location: "Паничище",
      sortOrder: 1,
      estimatedCost: money(30),
    },
    {
      tripId: tripId("Vienna Christmas Market"),
      title: "Check-in в хотела",
      description: "Оставяме багажа и тръгваме пеша към центъра.",
      startsAt: new Date("2026-12-04T15:00:00.000Z"),
      location: "Wien Mitte",
      sortOrder: 1,
      estimatedCost: money(0),
    },
    {
      tripId: tripId("Kresna Gorge Rafting"),
      title: "Инструктаж и екипировка",
      description: "Разпределяне по лодки и кратък инструктаж за безопасност.",
      startsAt: daysFromBase(27, 10, 0),
      location: "Рафтинг център Кресна",
      sortOrder: 1,
      estimatedCost: money(65),
    },
    {
      tripId: tripId("Belgrade Music Weekend"),
      title: "Разходка в Скадарлия",
      description: "Вечеря и жива музика в резервирано заведение.",
      startsAt: daysFromBase(55, 20, 30),
      location: "Skadarlija, Belgrade",
      sortOrder: 1,
      estimatedCost: money(40),
    },
    {
      tripId: tripId("Bansko Ski Trip"),
      title: "Ски ден",
      description: "Среща при кабинковия лифт и качване към Бъндеришка поляна.",
      startsAt: daysFromBase(-94, 8, 15),
      location: "Bansko Gondola",
      sortOrder: 1,
      estimatedCost: money(95),
    },
    {
      tripId: tripId("Spa Weekend in Velingrad"),
      title: "Настаняване и СПА зона",
      description: "Настаняване в хотела и свободно време в минералния басейн.",
      startsAt: daysFromBase(-2, 16, 0),
      location: "Велинград",
      sortOrder: 1,
      estimatedCost: money(0),
    },
    {
      tripId: tripId("Rhodope Villages Weekend"),
      title: "Разходка в Широка лъка",
      description: "Кратка обиколка на селото и посещение на етнографската къща.",
      startsAt: daysFromBase(-38, 14, 30),
      location: "Широка лъка",
      sortOrder: 1,
      estimatedCost: money(8),
    },
    {
      tripId: tripId("Budapest Thermal Baths"),
      title: "Посещение на Szechenyi Baths",
      description: "Сутрешен вход за термалните бани и обяд наблизо.",
      startsAt: daysFromBase(89, 10, 0),
      location: "Szechenyi Thermal Bath",
      sortOrder: 1,
      estimatedCost: money(38),
    },
    {
      tripId: tripId("Plovdiv Art Weekend"),
      title: "Галерии в Капана",
      description: "Маршрут през няколко малки галерии и кафе пауза.",
      startsAt: daysFromBase(-65, 11, 0),
      location: "Капана, Пловдив",
      sortOrder: 1,
      estimatedCost: money(12),
    },
    {
      tripId: tripId("Black Sea Camping"),
      title: "Планирано пристигане на къмпинга",
      description: "Първоначален план за разпъване на палатки преди отмяната.",
      startsAt: daysFromBase(45, 17, 30),
      location: "Синеморец",
      sortOrder: 1,
      estimatedCost: money(25),
    },
  ]);

  const insertedPackingItems = await db
    .insert(packingItems)
    .values([
      {
        tripId: tripId("Weekend in Thessaloniki"),
        title: "Passport",
        description: "Проверете валидността преди тръгване.",
        createdBy: userId("IvanD@gmail.com"),
      },
      {
        tripId: tripId("Weekend in Thessaloniki"),
        title: "Power bank",
        description: "За навигация и снимки през целия ден.",
        createdBy: userId("user1@gmail.com"),
      },
      {
        tripId: tripId("Hiking the Seven Rila Lakes"),
        title: "Hiking shoes",
        description: "Задължителни удобни обувки за каменист терен.",
        createdBy: userId("HristoM@gmail.com"),
      },
      {
        tripId: tripId("Hiking the Seven Rila Lakes"),
        title: "Jacket",
        description: "Времето горе се сменя бързо.",
        createdBy: userId("NikolayN@gmail.com"),
      },
      {
        tripId: tripId("Istanbul Food Tour"),
        title: "Medicine",
        description: "Лични лекарства и малък комплект за пътуване.",
        createdBy: userId("StoyanS@gmail.com"),
      },
      {
        tripId: tripId("Spa Weekend in Velingrad"),
        title: "Swimsuit",
        description: "За минералните басейни.",
        createdBy: userId("IvanD@gmail.com"),
      },
      {
        tripId: tripId("Vienna Christmas Market"),
        title: "Warm scarf",
        description: "За вечерните разходки по базарите.",
        createdBy: userId("GeorgiG@gmail.com"),
      },
      {
        tripId: tripId("Kresna Gorge Rafting"),
        title: "Dry clothes",
        description: "Комплект дрехи за след спускането.",
        createdBy: userId("NikolayN@gmail.com"),
      },
      {
        tripId: tripId("Black Sea Camping"),
        title: "Tent",
        description: "Лека палатка с проверени рейки.",
        createdBy: userId("user9@gmail.com"),
      },
    ])
    .returning({ id: packingItems.id, title: packingItems.title });

  const packingItemIdByTitle = new Map(
    insertedPackingItems.map((item) => [item.title, item.id]),
  );

  const packingItemId = (title: string) => {
    const id = packingItemIdByTitle.get(title);

    if (!id) {
      throw new Error(`Missing seeded packing item: ${title}`);
    }

    return id;
  };

  await db.insert(packingItemChecks).values([
    {
      packingItemId: packingItemId("Passport"),
      userId: userId("IvanD@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-3, 19, 10),
    },
    {
      packingItemId: packingItemId("Passport"),
      userId: userId("user1@gmail.com"),
      checked: false,
    },
    {
      packingItemId: packingItemId("Power bank"),
      userId: userId("user1@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-2, 21, 0),
    },
    {
      packingItemId: packingItemId("Hiking shoes"),
      userId: userId("HristoM@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-1, 8, 30),
    },
    {
      packingItemId: packingItemId("Jacket"),
      userId: userId("user5@gmail.com"),
      checked: false,
    },
    {
      packingItemId: packingItemId("Medicine"),
      userId: userId("user3@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-2, 12, 15),
    },
    {
      packingItemId: packingItemId("Swimsuit"),
      userId: userId("StoyanS@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-3, 22, 5),
    },
    {
      packingItemId: packingItemId("Warm scarf"),
      userId: userId("user7@gmail.com"),
      checked: false,
    },
    {
      packingItemId: packingItemId("Dry clothes"),
      userId: userId("HristoM@gmail.com"),
      checked: true,
      checkedAt: daysFromBase(-1, 18, 40),
    },
    {
      packingItemId: packingItemId("Tent"),
      userId: userId("user9@gmail.com"),
      checked: false,
    },
  ]);

  console.log("Seed completed:");
  console.log(`- ${insertedUsers.length} users`);
  console.log(`- ${insertedGroups.length} travel groups`);
  console.log(`- ${insertedTrips.length} trips`);
  console.log(`- ${insertedPackingItems.length} packing items`);
}

main().catch((error) => {
  console.error("Seed failed:");
  console.error(error);
  process.exit(1);
});

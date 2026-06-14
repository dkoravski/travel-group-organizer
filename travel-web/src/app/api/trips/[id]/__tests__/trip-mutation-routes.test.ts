import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import {
  canReserveSeats,
  getTripDetails,
  getTripPackingItems,
  leaveTrip,
  setPackingItemChecked,
  updateTripGuests,
  updateTripPreferences,
} from "@/services/tripService";

import { POST as updateGuests } from "../guests/route";
import { POST as leave } from "../leave/route";
import { GET as getPacking, PATCH as patchPacking } from "../packing/route";
import {
  GET as getPreferences,
  POST as savePreferences,
} from "../preferences/route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/tripService", () => ({
  canReserveSeats: jest.fn(),
  getTripDetails: jest.fn(),
  getTripPackingItems: jest.fn(),
  leaveTrip: jest.fn(),
  setPackingItemChecked: jest.fn(),
  updateTripGuests: jest.fn(),
  updateTripPreferences: jest.fn(),
}));

const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;
const mockedCanReserveSeats = canReserveSeats as jest.MockedFunction<
  typeof canReserveSeats
>;
const mockedGetTripDetails = getTripDetails as jest.MockedFunction<
  typeof getTripDetails
>;
const mockedGetTripPackingItems = getTripPackingItems as jest.MockedFunction<
  typeof getTripPackingItems
>;
const mockedSetPackingItemChecked = setPackingItemChecked as jest.MockedFunction<
  typeof setPackingItemChecked
>;

function request(path: string, init?: RequestInit) {
  return new NextRequest(
    `http://localhost${path}`,
    init as ConstructorParameters<typeof NextRequest>[1],
  );
}

function jsonRequest(path: string, body: unknown) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function context(id = "12") {
  return { params: Promise.resolve({ id }) };
}

const joinedTrip = {
  id: 12,
  isGroupMember: true,
  isJoined: true,
  capacity: 6,
  participantsCount: 3,
  userGuestsCount: 1,
  userTransportPreference: "Автобус",
  userAccommodationPreference: "Къща",
  userNote: "До прозореца",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetApiUser.mockResolvedValue({
    id: 7,
    name: "Иван",
    email: "ivan@example.com",
    avatarUrl: null,
  });
});

describe("POST /api/trips/[id]/leave", () => {
  it("leaves a trip and returns refreshed details", async () => {
    mockedGetTripDetails
      .mockResolvedValueOnce(joinedTrip as never)
      .mockResolvedValueOnce({ ...joinedTrip, isJoined: false } as never);

    const response = await leave(request("/api/trips/12/leave"), context());

    await expect(response.json()).resolves.toEqual({
      data: { ...joinedTrip, isJoined: false },
    });
    expect(response.status).toBe(200);
    expect(leaveTrip).toHaveBeenCalledWith(12, 7);
  });
});

describe("POST /api/trips/[id]/guests", () => {
  it("updates guest count when the user is joined and seats are available", async () => {
    mockedGetTripDetails
      .mockResolvedValueOnce(joinedTrip as never)
      .mockResolvedValueOnce({ ...joinedTrip, userGuestsCount: 2 } as never);
    mockedCanReserveSeats.mockReturnValue(true);

    const response = await updateGuests(
      jsonRequest("/api/trips/12/guests", { guestsCount: 2 }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(mockedCanReserveSeats).toHaveBeenCalledWith({
      capacity: 6,
      participantsCount: 3,
      currentUserGuestsCount: 1,
      requestedGuestsCount: 2,
      isAlreadyJoined: true,
    });
    expect(updateTripGuests).toHaveBeenCalledWith(12, 7, 2);
  });

  it("requires the user to join before reserving guests", async () => {
    mockedGetTripDetails.mockResolvedValue({
      ...joinedTrip,
      isJoined: false,
    } as never);

    const response = await updateGuests(
      jsonRequest("/api/trips/12/guests", { guestsCount: 1 }),
      context(),
    );

    expect(response.status).toBe(409);
    expect(updateTripGuests).not.toHaveBeenCalled();
  });
});

describe("preferences API routes", () => {
  it("returns the current user's saved trip preferences", async () => {
    mockedGetTripDetails.mockResolvedValue(joinedTrip as never);

    const response = await getPreferences(
      request("/api/trips/12/preferences"),
      context(),
    );

    await expect(response.json()).resolves.toEqual({
      data: {
        tripId: 12,
        userId: 7,
        transportPreference: "Автобус",
        accommodationPreference: "Къща",
        note: "До прозореца",
      },
    });
  });

  it("saves normalized preference fields", async () => {
    mockedGetTripDetails
      .mockResolvedValueOnce(joinedTrip as never)
      .mockResolvedValueOnce({ ...joinedTrip, userNote: "Без багаж" } as never);

    const response = await savePreferences(
      jsonRequest("/api/trips/12/preferences", {
        TransportPreference: " Влак ",
        accommodationPreference: "",
        note: " Без багаж ",
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(updateTripPreferences).toHaveBeenCalledWith(12, 7, {
      transportPreference: "Влак",
      accommodationPreference: null,
      note: "Без багаж",
    });
  });
});

describe("packing API routes", () => {
  it("returns packing items for joined members", async () => {
    mockedGetTripDetails.mockResolvedValue(joinedTrip as never);
    mockedGetTripPackingItems.mockResolvedValue([
      { id: 1, title: "Документи", checked: false },
    ] as never);

    const response = await getPacking(request("/api/trips/12/packing"), context());

    await expect(response.json()).resolves.toEqual({
      data: [{ id: 1, title: "Документи", checked: false }],
    });
  });

  it("checks a packing item and returns the refreshed list", async () => {
    mockedGetTripDetails.mockResolvedValue(joinedTrip as never);
    mockedSetPackingItemChecked.mockResolvedValue(true);
    mockedGetTripPackingItems.mockResolvedValue([
      { id: 1, title: "Документи", checked: true },
    ] as never);

    const response = await patchPacking(
      request("/api/trips/12/packing", {
        method: "PATCH",
        body: JSON.stringify({ packingItemId: 1, checked: true }),
      }),
      context(),
    );

    expect(response.status).toBe(200);
    expect(setPackingItemChecked).toHaveBeenCalledWith(1, 12, 7, true);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 1, title: "Документи", checked: true }],
    });
  });
});

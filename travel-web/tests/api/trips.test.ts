import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import {
  canReserveSeats,
  getTripComments,
  getTripDetails,
  getTripParticipants,
  getTripsPage,
  joinTrip,
} from "@/services/tripService";
import { GET as getTrips } from "@/app/api/trips/route";
import { GET as getTripDetailsRoute } from "@/app/api/trips/[id]/route";
import { POST as joinTripRoute } from "@/app/api/trips/[id]/join/route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/tripService", () => ({
  canReserveSeats: jest.fn(),
  getTripComments: jest.fn(),
  getTripDetails: jest.fn(),
  getTripParticipants: jest.fn(),
  getTripsPage: jest.fn(),
  joinTrip: jest.fn(),
}));

const apiUser = {
  id: 7,
  name: "Ivan",
  email: "ivan@example.com",
  avatarUrl: null,
};

function request(url: string, init?: RequestInit) {
  return new NextRequest(
    url,
    init as ConstructorParameters<typeof NextRequest>[1],
  );
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("trips API routes", () => {
  beforeEach(() => {
    jest.mocked(getApiUser).mockResolvedValue(apiUser);
  });

  it("rejects the trips list without bearer auth", async () => {
    jest.mocked(getApiUser).mockResolvedValue(null);

    const response = await getTrips(request("http://localhost/api/trips"));

    expect(response.status).toBe(401);
    expect(await json(response)).toEqual({
      error: "Missing or invalid bearer token.",
    });
    expect(getTripsPage).not.toHaveBeenCalled();
  });

  it("lists trips and caps page size at 50", async () => {
    jest.mocked(getTripsPage).mockResolvedValue({
      data: [],
      page: 2,
      pageSize: 50,
      total: 101,
    });

    const response = await getTrips(
      request("http://localhost/api/trips?page=2&pageSize=500"),
    );

    expect(response.status).toBe(200);
    expect(getTripsPage).toHaveBeenCalledWith(7, { page: 2, pageSize: 50 });
    expect(await json(response)).toMatchObject({
      page: 2,
      pageSize: 50,
      total: 101,
      totalPages: 3,
    });
  });

  it("returns trip details with comments and non-empty participant preferences", async () => {
    jest.mocked(getTripDetails).mockResolvedValue({
      id: 12,
      title: "Weekend",
      isGroupMember: true,
    } as Awaited<ReturnType<typeof getTripDetails>>);
    jest.mocked(getTripComments).mockResolvedValue([
      { id: 1, content: "Hi" },
    ] as Awaited<ReturnType<typeof getTripComments>>);
    jest.mocked(getTripParticipants).mockResolvedValue([
      {
        id: 2,
        name: "Maria",
        transportPreference: "Car",
        accommodationPreference: null,
        note: "",
      },
      {
        id: 3,
        name: "Georgi",
        transportPreference: "",
        accommodationPreference: null,
        note: null,
      },
    ] as Awaited<ReturnType<typeof getTripParticipants>>);

    const response = await getTripDetailsRoute(
      request("http://localhost/api/trips/12"),
      params("12"),
    );
    const body = await json(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      data: {
        id: 12,
        comments: [{ id: 1, content: "Hi" }],
        participantPreferences: [
          {
            userId: 2,
            userName: "Maria",
            transportPreference: "Car",
          },
        ],
      },
    });
  });

  it("rejects joining when guestsCount is invalid", async () => {
    const response = await joinTripRoute(
      request("http://localhost/api/trips/12", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestsCount: -1 }),
      }),
      params("12"),
    );

    expect(response.status).toBe(400);
    expect(joinTrip).not.toHaveBeenCalled();
  });

  it("rejects joining when capacity would be exceeded", async () => {
    jest.mocked(getTripDetails).mockResolvedValue({
      id: 12,
      capacity: 2,
      participantsCount: 2,
      canceled: false,
      isGroupMember: true,
      isJoined: false,
    } as Awaited<ReturnType<typeof getTripDetails>>);
    jest.mocked(canReserveSeats).mockReturnValue(false);

    const response = await joinTripRoute(
      request("http://localhost/api/trips/12", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestsCount: 1 }),
      }),
      params("12"),
    );

    expect(response.status).toBe(409);
    expect(joinTrip).not.toHaveBeenCalled();
  });

  it("joins a trip and returns the refreshed trip", async () => {
    jest
      .mocked(getTripDetails)
      .mockResolvedValueOnce({
        id: 12,
        capacity: 10,
        participantsCount: 3,
        canceled: false,
        isGroupMember: true,
        isJoined: false,
      } as Awaited<ReturnType<typeof getTripDetails>>)
      .mockResolvedValueOnce({
        id: 12,
        participantsCount: 5,
        isGroupMember: true,
        isJoined: true,
      } as Awaited<ReturnType<typeof getTripDetails>>);
    jest.mocked(canReserveSeats).mockReturnValue(true);

    const response = await joinTripRoute(
      request("http://localhost/api/trips/12", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestsCount: 1 }),
      }),
      params("12"),
    );

    expect(response.status).toBe(200);
    expect(joinTrip).toHaveBeenCalledWith(12, 7, 1);
    expect(await json(response)).toMatchObject({
      data: { id: 12, isJoined: true },
    });
  });
});

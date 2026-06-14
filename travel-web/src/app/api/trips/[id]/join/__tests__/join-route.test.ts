import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import {
  canReserveSeats,
  getTripDetails,
  joinTrip,
} from "@/services/tripService";

import { POST } from "../route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/tripService", () => ({
  canReserveSeats: jest.fn(),
  getTripDetails: jest.fn(),
  joinTrip: jest.fn(),
}));

const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;
const mockedCanReserveSeats = canReserveSeats as jest.MockedFunction<
  typeof canReserveSeats
>;
const mockedGetTripDetails = getTripDetails as jest.MockedFunction<
  typeof getTripDetails
>;
const mockedJoinTrip = joinTrip as jest.MockedFunction<typeof joinTrip>;

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/trips/12/join", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetApiUser.mockResolvedValue({
    id: 7,
    name: "Иван",
    email: "ivan@example.com",
    avatarUrl: null,
  });
});

describe("POST /api/trips/[id]/join", () => {
  it("rejects invalid trip ids", async () => {
    const response = await POST(postRequest({ guestsCount: 0 }), context("abc"));

    expect(response.status).toBe(400);
    expect(mockedGetTripDetails).not.toHaveBeenCalled();
  });

  it("rejects invalid guest counts", async () => {
    const response = await POST(postRequest({ guestsCount: -1 }), context("12"));

    expect(response.status).toBe(400);
    expect(mockedGetTripDetails).not.toHaveBeenCalled();
  });

  it("does not join when trip capacity would be exceeded", async () => {
    mockedGetTripDetails.mockResolvedValue({
      id: 12,
      isGroupMember: true,
      canceled: false,
      isJoined: false,
      capacity: 2,
      participantsCount: 2,
    } as never);
    mockedCanReserveSeats.mockReturnValue(false);

    const response = await POST(postRequest({ guestsCount: 1 }), context("12"));

    expect(response.status).toBe(409);
    expect(mockedCanReserveSeats).toHaveBeenCalledWith({
      capacity: 2,
      participantsCount: 2,
      requestedGuestsCount: 1,
      isAlreadyJoined: false,
    });
    expect(mockedJoinTrip).not.toHaveBeenCalled();
  });

  it("joins the trip and returns refreshed trip details", async () => {
    const initialTrip = {
      id: 12,
      isGroupMember: true,
      canceled: false,
      isJoined: false,
      capacity: 10,
      participantsCount: 3,
    };
    const updatedTrip = {
      ...initialTrip,
      isJoined: true,
      participantsCount: 5,
    };
    mockedGetTripDetails
      .mockResolvedValueOnce(initialTrip as never)
      .mockResolvedValueOnce(updatedTrip as never);
    mockedCanReserveSeats.mockReturnValue(true);

    const response = await POST(postRequest({ guestsCount: 1 }), context("12"));

    await expect(response.json()).resolves.toEqual({ data: updatedTrip });
    expect(response.status).toBe(200);
    expect(mockedJoinTrip).toHaveBeenCalledWith(12, 7, 1);
    expect(mockedGetTripDetails).toHaveBeenLastCalledWith(12, 7);
  });
});

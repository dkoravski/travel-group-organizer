import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { getTripsPage } from "@/services/tripService";

import { GET } from "../route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/tripService", () => ({
  getTripsPage: jest.fn(),
}));

const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;
const mockedGetTripsPage = getTripsPage as jest.MockedFunction<typeof getTripsPage>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/trips", () => {
  it("requires an authenticated API user", async () => {
    mockedGetApiUser.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/trips"));

    expect(response.status).toBe(401);
    expect(mockedGetTripsPage).not.toHaveBeenCalled();
  });

  it("returns a paginated trips response and caps page size", async () => {
    mockedGetApiUser.mockResolvedValue({
      id: 7,
      name: "Иван",
      email: "ivan@example.com",
      avatarUrl: null,
    });
    mockedGetTripsPage.mockResolvedValue({
      data: [{ id: 10, title: "Рила" }],
      page: 2,
      pageSize: 50,
      total: 126,
    } as never);

    const response = await GET(
      new NextRequest("http://localhost/api/trips?page=2&pageSize=500"),
    );

    await expect(response.json()).resolves.toEqual({
      data: [{ id: 10, title: "Рила" }],
      page: 2,
      pageSize: 50,
      total: 126,
      totalPages: 3,
    });
    expect(response.status).toBe(200);
    expect(mockedGetTripsPage).toHaveBeenCalledWith(7, {
      page: 2,
      pageSize: 50,
    });
  });
});

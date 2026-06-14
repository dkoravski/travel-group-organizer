import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { getUserGroupsOverview } from "@/services/groupService";

import { GET } from "../route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/groupService", () => ({
  getUserGroupsOverview: jest.fn(),
}));

const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;
const mockedGetUserGroupsOverview = getUserGroupsOverview as jest.MockedFunction<
  typeof getUserGroupsOverview
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/groups", () => {
  it("requires an authenticated API user", async () => {
    mockedGetApiUser.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/groups"));

    expect(response.status).toBe(401);
    expect(mockedGetUserGroupsOverview).not.toHaveBeenCalled();
  });

  it("returns the current user's groups", async () => {
    mockedGetApiUser.mockResolvedValue({
      id: 7,
      name: "Иван",
      email: "ivan@example.com",
      avatarUrl: null,
    });
    mockedGetUserGroupsOverview.mockResolvedValue([
      { id: 1, name: "Планина", role: "manager", membersCount: 4 },
    ] as never);

    const response = await GET(new NextRequest("http://localhost/api/groups"));

    await expect(response.json()).resolves.toEqual({
      data: [{ id: 1, name: "Планина", role: "manager", membersCount: 4 }],
    });
    expect(response.status).toBe(200);
    expect(mockedGetUserGroupsOverview).toHaveBeenCalledWith(7);
  });
});

import { NextRequest } from "next/server";

import { db } from "@/db";
import { getApiUser } from "@/lib/api/auth";

import { GET, PATCH } from "../route";

jest.mock("@/db", () => ({
  db: {
    update: jest.fn(),
  },
}));

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

const mockedDb = db as jest.Mocked<typeof db>;
const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;

function patchRequest(body: unknown) {
  return new NextRequest("http://localhost/api/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function mockUpdateRows(rows: unknown[]) {
  const returning = jest.fn().mockResolvedValue(rows);
  const where = jest.fn(() => ({ returning }));
  const set = jest.fn(() => ({ where }));

  mockedDb.update.mockReturnValue({ set } as never);

  return { set };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/profile", () => {
  it("returns the authenticated user's profile", async () => {
    mockedGetApiUser.mockResolvedValue({
      id: 7,
      name: "Иван",
      email: "ivan@example.com",
      avatarUrl: null,
    });

    const response = await GET(new NextRequest("http://localhost/api/profile"));

    await expect(response.json()).resolves.toEqual({
      data: {
        id: 7,
        name: "Иван",
        email: "ivan@example.com",
        avatarUrl: null,
      },
    });
    expect(response.status).toBe(200);
  });
});

describe("PATCH /api/profile", () => {
  it("updates the authenticated user's display name", async () => {
    mockedGetApiUser.mockResolvedValue({
      id: 7,
      name: "Иван",
      email: "ivan@example.com",
      avatarUrl: null,
    });
    const updateMock = mockUpdateRows([
      { id: 7, name: "Иван Петров", email: "ivan@example.com" },
    ]);

    const response = await PATCH(patchRequest({ name: " Иван Петров " }));

    await expect(response.json()).resolves.toEqual({
      data: {
        id: 7,
        name: "Иван Петров",
        email: "ivan@example.com",
        avatarUrl: null,
      },
    });
    expect(response.status).toBe(200);
    expect(updateMock.set).toHaveBeenCalledWith({
      name: "Иван Петров",
      updatedAt: expect.any(Date),
    });
  });

  it("rejects unchanged names", async () => {
    mockedGetApiUser.mockResolvedValue({
      id: 7,
      name: "Иван",
      email: "ivan@example.com",
      avatarUrl: null,
    });

    const response = await PATCH(patchRequest({ name: "Иван" }));

    expect(response.status).toBe(400);
    expect(mockedDb.update).not.toHaveBeenCalled();
  });
});

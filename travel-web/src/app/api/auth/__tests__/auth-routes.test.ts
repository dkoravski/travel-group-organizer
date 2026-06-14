import { NextRequest } from "next/server";

import { db } from "@/db";
import { createAuthToken, hashPassword, verifyPassword } from "@/lib/auth";

import { POST as loginPost } from "../login/route";
import { POST as registerPost } from "../register/route";

jest.mock("@/db", () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  createAuthToken: jest.fn(),
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

const mockedDb = db as jest.Mocked<typeof db>;
const mockedCreateAuthToken = createAuthToken as jest.MockedFunction<
  typeof createAuthToken
>;
const mockedHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockedVerifyPassword = verifyPassword as jest.MockedFunction<
  typeof verifyPassword
>;

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function mockSelectRows(rows: unknown[]) {
  const limit = jest.fn().mockResolvedValue(rows);
  const where = jest.fn(() => ({ limit }));
  const from = jest.fn(() => ({ where }));

  mockedDb.select.mockReturnValue({ from } as never);

  return { from, limit, where };
}

function mockInsertRows(rows: unknown[]) {
  const returning = jest.fn().mockResolvedValue(rows);
  const values = jest.fn(() => ({ returning }));

  mockedDb.insert.mockReturnValue({ values } as never);

  return { returning, values };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/auth/login", () => {
  it("returns a bearer token and user data for valid credentials", async () => {
    mockSelectRows([
      {
        id: 1,
        name: "Иван",
        email: "ivan@example.com",
        passwordHash: "hashed-password",
      },
    ]);
    mockedVerifyPassword.mockResolvedValue(true);
    mockedCreateAuthToken.mockResolvedValue("jwt-token");

    const response = await loginPost(
      jsonRequest("/api/auth/login", {
        email: " IVAN@example.com ",
        password: "secret123",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      token: "jwt-token",
      tokenType: "Bearer",
      user: {
        id: 1,
        name: "Иван",
        email: "ivan@example.com",
        avatarUrl: null,
      },
    });
    expect(response.status).toBe(200);
    expect(mockedVerifyPassword).toHaveBeenCalledWith(
      "secret123",
      "hashed-password",
    );
  });

  it("rejects invalid credentials without issuing a token", async () => {
    mockSelectRows([
      {
        id: 1,
        name: "Иван",
        email: "ivan@example.com",
        passwordHash: "hashed-password",
      },
    ]);
    mockedVerifyPassword.mockResolvedValue(false);

    const response = await loginPost(
      jsonRequest("/api/auth/login", {
        email: "ivan@example.com",
        password: "wrong-password",
      }),
    );

    expect(response.status).toBe(401);
    expect(mockedCreateAuthToken).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/register", () => {
  it("creates a user, hashes the password, and returns an auth token", async () => {
    mockSelectRows([]);
    const insertMock = mockInsertRows([
      { id: 2, name: "Мария", email: "maria@example.com" },
    ]);
    mockedHashPassword.mockResolvedValue("hashed-new-password");
    mockedCreateAuthToken.mockResolvedValue("new-jwt-token");

    const response = await registerPost(
      jsonRequest("/api/auth/register", {
        name: " Мария ",
        email: " MARIA@example.com ",
        password: "secret123",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      token: "new-jwt-token",
      tokenType: "Bearer",
      user: {
        id: 2,
        name: "Мария",
        email: "maria@example.com",
        avatarUrl: null,
      },
    });
    expect(response.status).toBe(201);
    expect(mockedHashPassword).toHaveBeenCalledWith("secret123");
    expect(insertMock.values).toHaveBeenCalledWith({
      name: "Мария",
      email: "maria@example.com",
      passwordHash: "hashed-new-password",
    });
  });

  it("rejects an email that is already registered", async () => {
    mockSelectRows([{ id: 1 }]);

    const response = await registerPost(
      jsonRequest("/api/auth/register", {
        name: "Иван",
        email: "ivan@example.com",
        password: "secret123",
      }),
    );

    expect(response.status).toBe(409);
    expect(mockedHashPassword).not.toHaveBeenCalled();
    expect(mockedDb.insert).not.toHaveBeenCalled();
  });
});

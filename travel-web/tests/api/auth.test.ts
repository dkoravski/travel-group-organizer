import { NextRequest } from "next/server";

import { db } from "@/db";
import { createAuthToken, verifyPassword } from "@/lib/auth";
import { POST as loginRoute } from "@/app/api/auth/login/route";

jest.mock("@/db", () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock("@/lib/auth", () => ({
  createAuthToken: jest.fn(),
  setSessionCookie: jest.fn((response) => response),
  verifyPassword: jest.fn(),
}));

function request(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockLoginQuery(result: unknown[]) {
  const limit = jest.fn().mockResolvedValue(result);
  const where = jest.fn(() => ({ limit }));
  const from = jest.fn(() => ({ where }));

  (db.select as jest.Mock).mockReturnValue({ from });

  return { from, where, limit };
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("auth API routes", () => {
  it("rejects missing login credentials before querying the database", async () => {
    const response = await loginRoute(request({ email: "", password: "" }));

    expect(response.status).toBe(400);
    expect(db.select).not.toHaveBeenCalled();
  });

  it("rejects an unknown login email", async () => {
    mockLoginQuery([]);

    const response = await loginRoute(
      request({ email: "missing@example.com", password: "secret1" }),
    );

    expect(response.status).toBe(401);
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("returns a bearer token for valid credentials", async () => {
    mockLoginQuery([
      {
        id: 4,
        name: "Maria",
        email: "maria@example.com",
        passwordHash: "hashed-password",
      },
    ]);
    jest.mocked(verifyPassword).mockResolvedValue(true);
    jest.mocked(createAuthToken).mockResolvedValue("jwt-token");

    const response = await loginRoute(
      request({ email: "MARIA@example.com", password: "secret1" }),
    );

    expect(response.status).toBe(200);
    expect(verifyPassword).toHaveBeenCalledWith("secret1", "hashed-password");
    expect(createAuthToken).toHaveBeenCalledWith({
      userId: 4,
      email: "maria@example.com",
      name: "Maria",
    });
    expect(await json(response)).toMatchObject({
      token: "jwt-token",
      tokenType: "Bearer",
      user: {
        id: 4,
        name: "Maria",
        email: "maria@example.com",
        avatarUrl: null,
      },
    });
  });
});

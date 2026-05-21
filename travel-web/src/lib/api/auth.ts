import "server-only";

import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function getApiUser(request: NextRequest): Promise<ApiUser | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const session = await verifyAuthToken(token);

  if (!session) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ? { ...user, avatarUrl: null } : null;
}

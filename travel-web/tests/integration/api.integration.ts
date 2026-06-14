type Json = Record<string, unknown>;

const baseUrl = process.env.INTEGRATION_BASE_URL || "http://127.0.0.1:3210";

async function request(
  path: string,
  init: RequestInit & { token?: string } = {},
) {
  const headers = new Headers(init.headers);

  if (init.token) {
    headers.set("authorization", `Bearer ${init.token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? ((await response.json()) as Json)
    : await response.text();

  return { body, response };
}

async function login(email: string, password = "pass123") {
  const { body, response } = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  expect(response.status).toBe(200);
  expect(body).toMatchObject({ tokenType: "Bearer" });

  return String((body as Json).token);
}

function dataArray(body: unknown) {
  return (body as { data: Json[] }).data;
}

describe("Travel API integration", () => {
  it("serves API documentation over HTTP", async () => {
    const { body, response } = await request("/api/docs");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(String(body)).toContain("Travel Group Organizer REST API");
  });

  it("registers a new user and prevents duplicate registrations", async () => {
    const email = `integration-${Date.now()}@example.com`;

    const created = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Integration User",
        email,
        password: "pass123",
      }),
    });

    expect(created.response.status).toBe(201);
    expect(created.body).toMatchObject({
      tokenType: "Bearer",
      user: {
        name: "Integration User",
        email,
        avatarUrl: null,
      },
    });
    expect(typeof (created.body as Json).token).toBe("string");

    const duplicate = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Integration User",
        email,
        password: "pass123",
      }),
    });

    expect(duplicate.response.status).toBe(409);
    expect(duplicate.body).toHaveProperty("error");
  });

  it("logs in a seeded user and rejects invalid credentials", async () => {
    const token = await login("IvanD@gmail.com");

    expect(token.length).toBeGreaterThan(20);

    const invalid = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "IvanD@gmail.com",
        password: "wrong-password",
      }),
    });

    expect(invalid.response.status).toBe(401);
    expect(invalid.body).toHaveProperty("error");
  });

  it("requires bearer auth on protected endpoints", async () => {
    const profile = await request("/api/profile");
    const trips = await request("/api/trips");
    const groups = await request("/api/groups");

    expect(profile.response.status).toBe(401);
    expect(trips.response.status).toBe(401);
    expect(groups.response.status).toBe(401);
  });

  it("reads and updates the authenticated profile", async () => {
    const token = await login("user1@gmail.com");

    const profile = await request("/api/profile", { token });

    expect(profile.response.status).toBe(200);
    expect(profile.body).toMatchObject({
      data: {
        email: "user1@gmail.com",
        avatarUrl: null,
      },
    });

    const update = await request("/api/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify({ name: "Integration Profile" }),
    });

    expect(update.response.status).toBe(200);
    expect(update.body).toMatchObject({
      data: {
        name: "Integration Profile",
        email: "user1@gmail.com",
      },
    });
  });

  it("changes password and allows login with the new password", async () => {
    const email = `password-${Date.now()}@example.com`;
    const created = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Password User",
        email,
        password: "pass123",
      }),
    });
    const token = String((created.body as Json).token);

    const changed = await request("/api/profile/password", {
      method: "PATCH",
      token,
      body: JSON.stringify({
        currentPassword: "pass123",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      }),
    });

    expect(changed.response.status).toBe(200);

    const newToken = await login(email, "newpass123");
    expect(newToken.length).toBeGreaterThan(20);
  });

  it("lists the user's groups and paginated trips", async () => {
    const token = await login("IvanD@gmail.com");

    const groups = await request("/api/groups", { token });
    const trips = await request("/api/trips?page=1&pageSize=5", { token });

    expect(groups.response.status).toBe(200);
    expect(dataArray(groups.body).length).toBeGreaterThan(0);
    expect(dataArray(groups.body)[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      }),
    );

    expect(trips.response.status).toBe(200);
    expect(trips.body).toEqual(
      expect.objectContaining({
        data: expect.any(Array),
        page: 1,
        pageSize: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      }),
    );
    expect(dataArray(trips.body).length).toBeGreaterThan(0);
  });

  it("reads trip details, comments, and participant preferences", async () => {
    const token = await login("IvanD@gmail.com");
    const trips = await request("/api/trips?page=1&pageSize=10", { token });
    const trip = dataArray(trips.body).find(
      (item) => item.title === "Weekend in Thessaloniki",
    );

    expect(trip).toBeTruthy();

    const details = await request(`/api/trips/${trip?.id}`, { token });
    const comments = await request(`/api/trips/${trip?.id}/comment`, { token });

    expect(details.response.status).toBe(200);
    expect(details.body).toMatchObject({
      data: {
        id: trip?.id,
        title: "Weekend in Thessaloniki",
        comments: expect.any(Array),
        participantPreferences: expect.any(Array),
      },
    });

    expect(comments.response.status).toBe(200);
    expect(dataArray(comments.body).length).toBeGreaterThan(0);
  });

  it("creates and updates a trip comment over HTTP", async () => {
    const token = await login("IvanD@gmail.com");
    const trips = await request("/api/trips?page=1&pageSize=10", { token });
    const trip = dataArray(trips.body).find(
      (item) => item.title === "Weekend in Thessaloniki",
    );

    const created = await request(`/api/trips/${trip?.id}/comment`, {
      method: "POST",
      token,
      body: JSON.stringify({ content: "Integration comment" }),
    });

    expect(created.response.status).toBe(201);
    expect(created.body).toMatchObject({
      data: {
        content: "Integration comment",
      },
    });

    const commentId = ((created.body as { data: Json }).data.id as number);
    const updated = await request(`/api/trips/${trip?.id}/comment/${commentId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ content: "Updated integration comment" }),
    });

    expect(updated.response.status).toBe(200);
    expect(updated.body).toMatchObject({
      data: {
        id: commentId,
        content: "Updated integration comment",
      },
    });
  });

  it("joins a trip, updates guests, saves preferences, reads packing, and leaves", async () => {
    const token = await login("user2@gmail.com");
    const trips = await request("/api/trips?page=1&pageSize=20", { token });
    const trip = dataArray(trips.body).find(
      (item) => item.title === "Spa Weekend in Velingrad",
    );

    expect(trip).toBeTruthy();

    const joined = await request(`/api/trips/${trip?.id}/join`, {
      method: "POST",
      token,
      body: JSON.stringify({ guestsCount: 0 }),
    });
    expect(joined.response.status).toBe(200);
    expect(joined.body).toMatchObject({ data: { isJoined: true } });

    const guests = await request(`/api/trips/${trip?.id}/guests`, {
      method: "POST",
      token,
      body: JSON.stringify({ guestsCount: 1 }),
    });
    expect(guests.response.status).toBe(200);
    expect(guests.body).toMatchObject({ data: { userGuestsCount: 1 } });

    const preferences = await request(`/api/trips/${trip?.id}/preferences`, {
      method: "POST",
      token,
      body: JSON.stringify({
        transportPreference: "Train",
        accommodationPreference: "Twin room",
        note: "Integration note",
      }),
    });
    expect(preferences.response.status).toBe(200);
    expect(preferences.body).toMatchObject({
      data: {
        userTransportPreference: "Train",
        userAccommodationPreference: "Twin room",
        userNote: "Integration note",
      },
    });

    const packing = await request(`/api/trips/${trip?.id}/packing`, { token });
    expect(packing.response.status).toBe(200);
    expect(dataArray(packing.body).length).toBeGreaterThan(0);

    const packingItemId = dataArray(packing.body)[0].id as number;
    const checked = await request(`/api/trips/${trip?.id}/packing`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ packingItemId, checked: true }),
    });
    expect(checked.response.status).toBe(200);
    expect(dataArray(checked.body)).toContainEqual(
      expect.objectContaining({ id: packingItemId, checked: true }),
    );

    const left = await request(`/api/trips/${trip?.id}/leave`, {
      method: "POST",
      token,
    });
    expect(left.response.status).toBe(200);
    expect(left.body).toMatchObject({ data: { isJoined: false } });
  });
});

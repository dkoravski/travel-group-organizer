export function parseTripId(id: string) {
  const tripId = Number(id);
  return Number.isInteger(tripId) && tripId > 0 ? tripId : null;
}

export async function getGuestsCountFromJson(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    return 0;
  }

  if (typeof body !== "object" || body === null || !("guestsCount" in body)) {
    return 0;
  }

  const guestsCount = Number(body.guestsCount);

  if (!Number.isInteger(guestsCount) || guestsCount < 0) {
    return null;
  }

  return guestsCount;
}

export async function getJsonBody(request: Request) {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function getOptionalString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
) {
  if (!(key in body) || body[key] == null) {
    return "";
  }

  if (typeof body[key] !== "string") {
    return null;
  }

  const value = body[key].trim();

  if (value.length > maxLength) {
    return null;
  }

  return value;
}

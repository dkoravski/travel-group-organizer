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

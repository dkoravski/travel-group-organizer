import {
  getGuestsCountFromJson,
  getJsonBody,
  getOptionalString,
  parseTripId,
} from "../trips";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/test", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("trip API helpers", () => {
  it("parses only positive integer trip ids", () => {
    expect(parseTripId("12")).toBe(12);
    expect(parseTripId("0")).toBeNull();
    expect(parseTripId("1.5")).toBeNull();
    expect(parseTripId("abc")).toBeNull();
  });

  it("reads guest counts with validation defaults", async () => {
    await expect(
      getGuestsCountFromJson(jsonRequest({ guestsCount: 2 })),
    ).resolves.toBe(2);
    await expect(getGuestsCountFromJson(jsonRequest({}))).resolves.toBe(0);
    await expect(
      getGuestsCountFromJson(jsonRequest({ guestsCount: -1 })),
    ).resolves.toBeNull();
  });

  it("returns null for invalid JSON bodies", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      body: "{bad json",
    });

    await expect(getJsonBody(request)).resolves.toBeNull();
  });

  it("normalizes optional strings and rejects wrong types or long values", () => {
    expect(getOptionalString({ note: "  с влак  " }, "note", 20)).toBe("с влак");
    expect(getOptionalString({}, "note", 20)).toBe("");
    expect(getOptionalString({ note: 10 }, "note", 20)).toBeNull();
    expect(getOptionalString({ note: "x".repeat(21) }, "note", 20)).toBeNull();
  });
});

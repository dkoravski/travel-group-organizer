import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import {
  createTripComment,
  getTripComments,
  getTripDetails,
  updateTripComment,
} from "@/services/tripService";

import {
  GET as listComments,
  POST as createComment,
} from "../route";
import { PATCH as updateComment } from "../[commentId]/route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/services/tripService", () => ({
  createTripComment: jest.fn(),
  getTripComments: jest.fn(),
  getTripDetails: jest.fn(),
  updateTripComment: jest.fn(),
}));

const mockedGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>;
const mockedGetTripDetails = getTripDetails as jest.MockedFunction<
  typeof getTripDetails
>;
const mockedGetTripComments = getTripComments as jest.MockedFunction<
  typeof getTripComments
>;
const mockedUpdateTripComment = updateTripComment as jest.MockedFunction<
  typeof updateTripComment
>;

function request(path: string, body?: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
  });
}

function tripContext(id = "12") {
  return { params: Promise.resolve({ id }) };
}

function commentContext(id = "12", commentId = "5") {
  return { params: Promise.resolve({ id, commentId }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetApiUser.mockResolvedValue({
    id: 7,
    name: "Иван",
    email: "ivan@example.com",
    avatarUrl: null,
  });
  mockedGetTripDetails.mockResolvedValue({
    id: 12,
    isGroupMember: true,
  } as never);
});

describe("comment API routes", () => {
  it("lists comments for a visible trip", async () => {
    mockedGetTripComments.mockResolvedValue([
      { id: 5, content: "Здравей", userId: 7 },
    ] as never);

    const response = await listComments(
      request("/api/trips/12/comment"),
      tripContext(),
    );

    await expect(response.json()).resolves.toEqual({
      data: [{ id: 5, content: "Здравей", userId: 7 }],
    });
    expect(response.status).toBe(200);
  });

  it("creates a trimmed comment and returns the newest comment", async () => {
    mockedGetTripComments.mockResolvedValue([
      { id: 6, content: "Ще дойда", userId: 7 },
    ] as never);

    const response = await createComment(
      request("/api/trips/12/comment", { content: " Ще дойда " }),
      tripContext(),
    );

    expect(response.status).toBe(201);
    expect(createTripComment).toHaveBeenCalledWith(12, 7, "Ще дойда");
    await expect(response.json()).resolves.toEqual({
      data: { id: 6, content: "Ще дойда", userId: 7 },
    });
  });

  it("rejects empty comments before calling the service", async () => {
    const response = await createComment(
      request("/api/trips/12/comment", { content: " " }),
      tripContext(),
    );

    expect(response.status).toBe(400);
    expect(createTripComment).not.toHaveBeenCalled();
  });

  it("updates a comment owned by the current user", async () => {
    mockedUpdateTripComment.mockResolvedValue(true);
    mockedGetTripComments.mockResolvedValue([
      { id: 5, content: "Промяна", userId: 7 },
    ] as never);

    const response = await updateComment(
      request("/api/trips/12/comment/5", { content: " Промяна " }),
      commentContext(),
    );

    expect(response.status).toBe(200);
    expect(updateTripComment).toHaveBeenCalledWith(5, 12, 7, "Промяна");
    await expect(response.json()).resolves.toEqual({
      data: { id: 5, content: "Промяна", userId: 7 },
    });
  });

  it("returns not found when a comment update does not match", async () => {
    mockedUpdateTripComment.mockResolvedValue(false);

    const response = await updateComment(
      request("/api/trips/12/comment/5", { content: "Промяна" }),
      commentContext(),
    );

    expect(response.status).toBe(404);
  });
});

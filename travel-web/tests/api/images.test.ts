import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import {
  deleteImageObject,
  getImageObject,
  isUploadedImageFile,
  uploadTripCoverImageObject,
} from "@/lib/r2";
import {
  DELETE as deleteImageByBody,
  POST as uploadImage,
} from "@/app/api/images/route";
import {
  DELETE as deleteImageByKey,
  GET as viewImage,
} from "@/app/api/images/[...key]/route";

jest.mock("@/lib/api/auth", () => ({
  getApiUser: jest.fn(),
}));

jest.mock("@/lib/r2", () => ({
  deleteImageObject: jest.fn(),
  getImageObject: jest.fn(),
  isUploadedImageFile: jest.fn(),
  uploadTripCoverImageObject: jest.fn(),
}));

const apiUser = {
  id: 7,
  name: "Ivan",
  email: "ivan@example.com",
  avatarUrl: null,
};

function request(url: string, init?: RequestInit) {
  return new NextRequest(
    url,
    init as ConstructorParameters<typeof NextRequest>[1],
  );
}

function keyParams(...key: string[]) {
  return { params: Promise.resolve({ key }) };
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("images API routes", () => {
  beforeEach(() => {
    jest.mocked(getApiUser).mockResolvedValue(apiUser);
    jest
      .mocked(isUploadedImageFile)
      .mockImplementation(
        (value): value is File => value instanceof File && value.size > 0,
      );
  });

  it("rejects image upload without bearer auth", async () => {
    jest.mocked(getApiUser).mockResolvedValue(null);

    const response = await uploadImage(
      request("http://localhost/api/images", { method: "POST" }),
    );

    expect(response.status).toBe(401);
    expect(uploadTripCoverImageObject).not.toHaveBeenCalled();
  });

  it("uploads an image from multipart form data", async () => {
    const formData = new FormData();
    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    formData.set("image", file);
    jest.mocked(uploadTripCoverImageObject).mockResolvedValue({
      key: "trip-covers/cover.webp",
      url: "https://cdn.example/trip-covers/cover.webp",
      viewUrl: "/api/images/trip-covers/cover.webp",
      contentType: "image/webp",
      size: file.size,
    });

    const response = await uploadImage(
      request("http://localhost/api/images", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(201);
    expect(uploadTripCoverImageObject).toHaveBeenCalledWith(file);
    expect(await json(response)).toMatchObject({
      data: {
        key: "trip-covers/cover.webp",
        viewUrl: "/api/images/trip-covers/cover.webp",
      },
    });
  });

  it("removes an image by JSON key", async () => {
    jest.mocked(deleteImageObject).mockResolvedValue("trip-covers/cover.webp");

    const response = await deleteImageByBody(
      request("http://localhost/api/images", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: "trip-covers/cover.webp" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(deleteImageObject).toHaveBeenCalledWith("trip-covers/cover.webp");
    expect(await json(response)).toEqual({
      data: { key: "trip-covers/cover.webp", removed: true },
    });
  });

  it("streams an image by storage key", async () => {
    jest.mocked(getImageObject).mockResolvedValue({
      Body: {
        transformToByteArray: async () => new Uint8Array([1, 2, 3]),
      },
      ContentType: "image/png",
    } as Awaited<ReturnType<typeof getImageObject>>);

    const response = await viewImage(
      request("http://localhost/api/images/trip-covers/cover.png"),
      keyParams("trip-covers", "cover.png"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });

  it("removes an image by route key", async () => {
    jest.mocked(deleteImageObject).mockResolvedValue("trip-covers/cover.png");

    const response = await deleteImageByKey(
      request("http://localhost/api/images/trip-covers/cover.png", {
        method: "DELETE",
      }),
      keyParams("trip-covers", "cover.png"),
    );

    expect(response.status).toBe(200);
    expect(deleteImageObject).toHaveBeenCalledWith("trip-covers/cover.png");
  });
});

import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { apiError, apiOk } from "@/lib/api/responses";
import { deleteImageObject, getImageObject } from "@/lib/r2";

type RouteContext = {
  params: Promise<{
    key: string[];
  }>;
};

function getKey(parts: string[]) {
  return parts.map((part) => decodeURIComponent(part)).join("/");
}

function getStorageErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "$metadata" in error &&
    typeof error.$metadata === "object" &&
    error.$metadata !== null &&
    "httpStatusCode" in error.$metadata
  ) {
    return error.$metadata.httpStatusCode;
  }

  return null;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { key: keyParts } = await params;
  const key = getKey(keyParts);

  try {
    const image = await getImageObject(key);

    if (!image.Body) {
      return apiError("Image not found.", 404);
    }

    const bytes = await image.Body.transformToByteArray();
    const body = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;

    return new Response(body, {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-length": String(bytes.byteLength),
        "content-type": image.ContentType ?? "application/octet-stream",
      },
    });
  } catch (error) {
    if (getStorageErrorStatus(error) === 404) {
      return apiError("Image not found.", 404);
    }

    return apiError(
      error instanceof Error ? error.message : "Could not load image.",
      400,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const { key: keyParts } = await params;
  const key = getKey(keyParts);

  try {
    const removedKey = await deleteImageObject(key);

    return apiOk({ data: { key: removedKey, removed: true } });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not remove image.",
      400,
    );
  }
}

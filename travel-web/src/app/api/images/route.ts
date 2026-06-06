import { NextRequest } from "next/server";

import { getApiUser } from "@/lib/api/auth";
import { getJsonBody } from "@/lib/api/trips";
import { apiError, apiOk } from "@/lib/api/responses";
import {
  deleteImageObject,
  isUploadedImageFile,
  uploadTripCoverImageObject,
} from "@/lib/r2";

function getImageFile(formData: FormData) {
  const image = formData.get("image");

  if (isUploadedImageFile(image)) {
    return image;
  }

  const file = formData.get("file");

  return isUploadedImageFile(file) ? file : null;
}

export async function POST(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiError("Expected multipart form data.", 400);
  }

  const file = getImageFile(formData);

  if (!file) {
    return apiError("Missing image file.", 400);
  }

  try {
    const image = await uploadTripCoverImageObject(file);

    return apiOk({ data: image }, 201);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not upload image.",
      400,
    );
  }
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getApiUser(request);

  if (!currentUser) {
    return apiError("Missing or invalid bearer token.", 401);
  }

  const body = await getJsonBody(request);

  if (!body) {
    return apiError("Expected JSON body.", 400);
  }

  const imageRef = body.key ?? body.url;

  if (typeof imageRef !== "string" || !imageRef.trim()) {
    return apiError("Provide an image key or url.", 400);
  }

  try {
    const key = await deleteImageObject(imageRef.trim());

    return apiOk({ data: { key, removed: true } });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Could not remove image.",
      400,
    );
  }
}

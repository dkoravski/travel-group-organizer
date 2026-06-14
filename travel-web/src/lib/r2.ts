import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "node:crypto";
import path from "node:path";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
export const TRIP_COVER_IMAGE_PREFIX = "trip-covers/";

const R2_ENDPOINT_ENV_NAMES = ["R2_URL", "R2_ENDPOINT", "R2_ENDPOINT_URL"];
const R2_PUBLIC_URL_ENV_NAMES = [
  "R2_PUBLIC_URL",
  "R2_PUBLIC_ENDPOINT",
  "R2_PUBLIC_URL_BASE",
];

let r2Client: S3Client | null = null;

function getOptionalEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  return null;
}

function getRequiredEnv(...names: string[]) {
  const value = getOptionalEnv(...names);

  if (!value) {
    throw new Error(`${names.join(" or ")} is not set`);
  }

  return value;
}

function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: getRequiredEnv(...R2_ENDPOINT_ENV_NAMES),
      credentials: {
        accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
      },
    });
  }

  return r2Client;
}

function getFileExtension(file: File) {
  const fromName = path.extname(file.name).toLowerCase();

  if (fromName && fromName.length <= 10) {
    return fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

function getBucket() {
  return getRequiredEnv("R2_BUCKET");
}

function getPublicUrl() {
  return getOptionalEnv(...R2_PUBLIC_URL_ENV_NAMES)?.replace(/\/$/, "") ?? null;
}

function assertAppImageKey(key: string) {
  if (
    !key.startsWith(TRIP_COVER_IMAGE_PREFIX) ||
    key.includes("..") ||
    key.includes("\\") ||
    key.endsWith("/")
  ) {
    throw new Error("Invalid image key.");
  }
}

export function isUploadedImageFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function getImageKeyFromUrl(url: string) {
  const publicUrl = getPublicUrl();

  if (publicUrl && url.startsWith(`${publicUrl}/`)) {
    return decodeURIComponent(url.slice(publicUrl.length + 1));
  }

  try {
    const parsedUrl = new URL(url, "http://localhost");

    if (parsedUrl.pathname.startsWith("/api/images/")) {
      return decodeURIComponent(parsedUrl.pathname.slice("/api/images/".length));
    }
  } catch {
    // Ignore invalid URLs and fall back to the original value.
  }

  return url;
}

function getTripCoverImageUrl(key: string) {
  const publicUrl = getPublicUrl();

  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  return getApiImageUrl(key);
}

export function getApiImageUrl(key: string) {
  assertAppImageKey(key);
  return `/api/images/${key}`;
}

export async function uploadTripCoverImageObject(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Качете изображение във формат JPG, PNG, WEBP или GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Изображението трябва да бъде до 5 MB.");
  }

  const key = `${TRIP_COVER_IMAGE_PREFIX}${crypto.randomUUID()}${getFileExtension(file)}`;
  const body = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: file.type,
    }),
  );

  return {
    key,
    url: getTripCoverImageUrl(key),
    viewUrl: getApiImageUrl(key),
    contentType: file.type,
    size: file.size,
  };
}

export async function uploadTripCoverImage(file: File) {
  const image = await uploadTripCoverImageObject(file);
  return image.url;
}

export async function getImageObject(key: string) {
  assertAppImageKey(key);

  return getR2Client().send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
  );
}

export async function deleteImageObject(keyOrUrl: string) {
  const key = getImageKeyFromUrl(keyOrUrl);

  assertAppImageKey(key);

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    }),
  );

  return key;
}

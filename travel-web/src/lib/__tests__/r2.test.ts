const mockSend = jest.fn();
const mockS3Client = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));

jest.mock("@aws-sdk/client-s3", () => ({
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  S3Client: mockS3Client,
}));

const envKeys = [
  "R2_URL",
  "R2_ENDPOINT",
  "R2_ENDPOINT_URL",
  "R2_PUBLIC_URL",
  "R2_PUBLIC_ENDPOINT",
  "R2_PUBLIC_URL_BASE",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
];

const originalEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);

function restoreEnv() {
  for (const key of envKeys) {
    const value = originalEnv[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("r2 helpers", () => {
  beforeEach(() => {
    jest.resetModules();
    mockSend.mockReset();
    mockS3Client.mockClear();
    restoreEnv();
  });

  afterAll(() => {
    restoreEnv();
  });

  it("uses endpoint aliases and a configured public URL", async () => {
    delete process.env.R2_URL;
    process.env.R2_ENDPOINT = "https://example.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "access-key";
    process.env.R2_SECRET_ACCESS_KEY = "secret-key";
    process.env.R2_BUCKET = "travel-group-organizer";
    process.env.R2_PUBLIC_URL = "https://pub.example/";

    mockSend.mockResolvedValueOnce({});

    const { getApiImageUrl, getImageKeyFromUrl, uploadTripCoverImageObject } =
      await import("@/lib/r2");

    const file = new File(["image"], "cover.webp", { type: "image/webp" });
    const image = await uploadTripCoverImageObject(file);

    expect(mockS3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "https://example.r2.cloudflarestorage.com",
      }),
    );
    expect(image.url).toMatch(/^https:\/\/pub\.example\/trip-covers\/.+\.webp$/);
    expect(image.viewUrl).toMatch(/^\/api\/images\/trip-covers\/.+\.webp$/);
    expect(getImageKeyFromUrl(image.url)).toMatch(
      /^trip-covers\/.+\.webp$/,
    );
    expect(
      getImageKeyFromUrl(getApiImageUrl("trip-covers/example.webp")),
    ).toBe("trip-covers/example.webp");
  });

  it("preserves a configured public URL when available", async () => {
    process.env.R2_URL = "https://example.r2.cloudflarestorage.com";
    process.env.R2_ACCESS_KEY_ID = "access-key";
    process.env.R2_SECRET_ACCESS_KEY = "secret-key";
    process.env.R2_BUCKET = "travel-group-organizer";
    process.env.R2_PUBLIC_URL = "https://pub.example/";

    mockSend.mockResolvedValueOnce({});

    const { getImageKeyFromUrl, uploadTripCoverImageObject } = await import(
      "@/lib/r2"
    );

    const file = new File(["image"], "cover.png", { type: "image/png" });
    const image = await uploadTripCoverImageObject(file);

    expect(image.url).toMatch(/^https:\/\/pub\.example\/trip-covers\/.+\.png$/);
    expect(getImageKeyFromUrl(image.url)).toMatch(/^trip-covers\/.+\.png$/);
  });
});
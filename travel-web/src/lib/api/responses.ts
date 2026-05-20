import { NextResponse } from "next/server";

export const apiCorsHeaders = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

export function apiError(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: apiCorsHeaders },
  );
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: apiCorsHeaders });
}

export function apiOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: apiCorsHeaders,
  });
}

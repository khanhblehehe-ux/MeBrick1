import { NextResponse } from "next/server";

const normalizeBase = (value) => String(value || "").trim().replace(/\/+$/, "");

function getBackendBaseUrl() {
  return normalizeBase(
    process.env.API_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  );
}

async function proxy(request, { params }) {
  const backendBase = getBackendBaseUrl();
  const path = Array.isArray(params?.path) ? params.path.join("/") : String(params?.path || "");
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${backendBase}/api/${path}`);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("Access-Control-Allow-Origin", incomingUrl.origin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request, context) {
  return proxy(request, context);
}

export async function POST(request, context) {
  return proxy(request, context);
}

export async function PUT(request, context) {
  return proxy(request, context);
}

export async function PATCH(request, context) {
  return proxy(request, context);
}

export async function DELETE(request, context) {
  return proxy(request, context);
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": new URL(request.url).origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
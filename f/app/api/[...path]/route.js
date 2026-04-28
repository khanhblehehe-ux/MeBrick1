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

  // If this is a GET for a static/media asset, redirect client to backend
  // to avoid streaming large responses through the server (reduces origin transfer).
  if (request.method === "GET") {
    const mediaExt = /(\.png|\.jpe?g|\.webp|\.gif|\.mp4|\.mp3|\.pdf|\.zip|\.svg|\.avif)(?:$|\?)/i;
    if (mediaExt.test(incomingUrl.pathname)) {
      return NextResponse.redirect(targetUrl, 307);
    }
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);

  // Propagate cache-control from upstream when available, otherwise set a sensible default for CDN caching.
  if (!responseHeaders.has("cache-control") && request.method === "GET") {
    responseHeaders.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  }

  // CORS
  responseHeaders.set("Access-Control-Allow-Origin", incomingUrl.origin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");

  // Remove hop-by-hop headers that shouldn't be forwarded
  [
    "transfer-encoding",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "upgrade",
  ].forEach((h) => responseHeaders.delete(h));

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
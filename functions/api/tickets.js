export async function onRequest(context) {
  const { request } = context;

  // ✅ Your Google Apps Script URL
  const TARGET = "https://script.google.com/macros/s/AKfycbwouHbugtafQbUOpZ0-XY5l667ahSet4EUqPrcf-D6BmcG6xchC897E9X44FooeQG9O/exec";

  // CORS headers (browser-friendly)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  // Forward request to Apps Script
  const url = new URL(request.url);
  const targetUrl = new URL(TARGET);

  // Copy query params (ticketId=..., etc.)
  url.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v));

  const init = {
    method: request.method,
    headers: { "Content-Type": request.headers.get("Content-Type") || "application/json" },
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const resp = await fetch(targetUrl.toString(), init);
  const text = await resp.text();

  // Pass through content-type if possible
  const contentType = resp.headers.get("content-type") || "application/json";

  return new Response(text, {
    status: resp.status,
    headers: {
      ...corsHeaders,
      "Content-Type": contentType,
    },
  });
}

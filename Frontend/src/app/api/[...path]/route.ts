import { NextRequest, NextResponse } from "next/server";
import https from "https";
import http from "http";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001";

function parseUrl(url: string) {
  const isHttps = url.startsWith("https");
  const u = new URL(url);
  return { isHttps, hostname: u.hostname, port: u.port || (isHttps ? "443" : "80"), path: u.pathname + u.search };
}

function nodeRequest(
  method: string,
  targetUrl: string,
  headers: Record<string, string>,
  body: Buffer | null
): Promise<{ status: number; headers: Record<string, string>; data: Buffer }> {
  const { isHttps, hostname, port, path } = parseUrl(targetUrl);
  const mod = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname,
      port: parseInt(port),
      path,
      method,
      headers,
      rejectUnauthorized: false,
    };

    const req = mod.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode || 500,
          headers: res.headers as Record<string, string>,
          data: Buffer.concat(chunks),
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    req.setTimeout(30000);

    if (body) req.write(body);
    req.end();
  });
}

async function proxyRequest(request: NextRequest, path: string[], method: string) {
  const pathname = "/api/" + path.join("/");
  const searchParams = request.nextUrl.search;
  const url = `${BACKEND_URL}${pathname}${searchParams}`;

  const body = method !== "GET" && method !== "HEAD" ? Buffer.from(await request.arrayBuffer()) : null;
  const authHeader = request.headers.get("authorization");
  const reqContentType = request.headers.get("content-type") || "application/json";

  const headers: Record<string, string> = {
    "Content-Type": reqContentType,
    accept: "application/json, text/plain, */*",
  };
  if (authHeader) headers["Authorization"] = authHeader;

  try {
    const response = await nodeRequest(method, url, headers, body);

    const resHeaders: Record<string, string> = {
      "Content-Type": response.headers["content-type"] || "application/json",
    };
    if (response.headers["content-disposition"]) {
      resHeaders["Content-Disposition"] = response.headers["content-disposition"];
    }

    return new NextResponse(new Uint8Array(response.data), {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error(`Proxy ${method} ${pathname}:`, error.message);
    return NextResponse.json(
      {
        success: false,
        message: `Cannot connect to backend at ${BACKEND_URL}: ${error.message}`,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path, "PUT");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path, "DELETE");
}

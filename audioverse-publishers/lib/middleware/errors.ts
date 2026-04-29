import { NextResponse } from "next/server";
import type { ApiError } from "@/types/api";

export class HttpError extends Error {
  status: number;
  code: ApiError["code"];
  field?: string;
  constructor(status: number, message: string, code: ApiError["code"] = "INTERNAL", field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Not authenticated") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, field?: string) {
    super(400, message, "VALIDATION", field);
  }
}

export class RateLimitError extends HttpError {
  retryAfterMs: number;
  constructor(retryAfterMs: number, message = "Too many requests") {
    super(429, message, "RATE_LIMITED");
    this.retryAfterMs = retryAfterMs;
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

// Wraps an async handler so thrown HttpErrors become clean JSON responses.
// Any other error becomes a 500 with a generic message — we never leak
// stack traces or PG error codes to clients.
export function apiRoute<TContext = unknown>(
  handler: (request: Request, context: TContext) => Promise<Response>,
) {
  return async (request: Request, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof HttpError) {
        const body: ApiError = { error: err.message, code: err.code };
        if (err.field) body.field = err.field;
        const init: ResponseInit = { status: err.status };
        if (err instanceof RateLimitError) {
          init.headers = { "Retry-After": String(Math.ceil(err.retryAfterMs / 1000)) };
        }
        return NextResponse.json(body, init);
      }
      // eslint-disable-next-line no-console
      console.error("[api] unhandled error:", err);
      return NextResponse.json(
        { error: "Something went wrong. Please try again.", code: "INTERNAL" } satisfies ApiError,
        { status: 500 },
      );
    }
  };
}

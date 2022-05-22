import { Middleware, Context, Response as Res } from "oak";
import { ApplicationError } from "../errors/app.error.ts";

type RateLimiterToken = {
  id: string;
  limit: number;
  remaining: number;
  resetOnMs: number;
};

export interface RateLimiterOptions {
  idGenerator?: (context: Context) => Promise<string> | string;
  limit: number;
  resetOnMs: number;
}

export function rateLimiterMiddleware(
  options?: RateLimiterOptions
): Middleware {
  const tokens = new Map<string, RateLimiterToken>();
  const rateLimiterOptions = {
    idGenerator: options?.idGenerator ?? defaultIdGenerator,
    limit: options?.limit ?? 25,
    resetOnMs: options?.resetOnMs ?? 1000 * 60, // 1 minute
  };

  return async (context, next) => {
    const id = await rateLimiterOptions.idGenerator(context);
    const token = tokens.get(id);

    if (!token) {
      tokens.set(id, {
        id: id,
        limit: rateLimiterOptions.limit,
        remaining: rateLimiterOptions.limit,
        resetOnMs: Date.now() + rateLimiterOptions.resetOnMs,
      });
    } else {
      if (token.resetOnMs < Date.now()) {
        token.remaining = token.limit;
        token.resetOnMs = Date.now() + rateLimiterOptions.resetOnMs;
      }

      if (token.remaining > 0) {
        token.remaining -= 1;
      }

      // Set the custom headers
      setRateLimiterHeaders(context.response, token);

      if (token.remaining === 0) {
        ApplicationError.throwTooManyRequests();
      }
    }

    await next();
  };
}

function defaultIdGenerator(context: Context): string {
  return context.request.ip;
}

function setRateLimiterHeaders(response: Res, token: RateLimiterToken) {
  response.headers.set("X-RateLimit-Limit", String(token.limit));
  response.headers.set("X-RateLimit-Remaining", String(token.remaining));
  response.headers.set("X-RateLimit-Reset", String(token.resetOnMs));
}

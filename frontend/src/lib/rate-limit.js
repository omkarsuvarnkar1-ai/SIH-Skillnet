import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT_PREFIX = "skillnet:rl:v1";
const RATE_LIMIT_FAILURE_RETRY_SECONDS = 60;

const POLICIES = {
  "student-login": [
    { name: "ip", identifier: "ip", limit: 30, window: "10 m" },
    { name: "pair", identifier: "pair", limit: 5, window: "10 m" },
    { name: "email", identifier: "email", limit: 20, window: "1 h" },
  ],
  "student-signup": [
    { name: "ip", identifier: "ip", limit: 5, window: "1 h" },
    { name: "pair", identifier: "pair", limit: 2, window: "1 h" },
  ],
  "academician-login": [
    { name: "ip", identifier: "ip", limit: 20, window: "15 m" },
    { name: "pair", identifier: "pair", limit: 5, window: "15 m" },
    { name: "email", identifier: "email", limit: 15, window: "1 h" },
  ],
  "academician-registration": [
    { name: "ip", identifier: "ip", limit: 3, window: "1 h" },
    { name: "pair", identifier: "pair", limit: 2, window: "1 h" },
  ],
  roadmap: [
    { name: "student", identifier: "student", limit: 3, window: "1 h" },
    { name: "ip", identifier: "ip", limit: 10, window: "1 h" },
  ],
  "assessment-questions": [
    { name: "student", identifier: "student", limit: 10, window: "10 m" },
    { name: "ip", identifier: "ip", limit: 30, window: "10 m" },
  ],
  "assessment-submit": [
    { name: "student", identifier: "student", limit: 5, window: "30 m" },
    { name: "ip", identifier: "ip", limit: 20, window: "30 m" },
  ],
};

let limiters;

export function normalizeRateLimitEmail(value) {
  return typeof value === "string" && value.trim()
    ? value.trim().toLowerCase()
    : null;
}

function getRequiredEnvironmentValue(name) {
  const value = process.env[name];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Rate limit configuration is unavailable.");
  }

  return value.trim();
}

function getClientIp(request) {
  const trustedHeader = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();

  if (trustedHeader) {
    if (!/^[a-z0-9-]+$/.test(trustedHeader)) {
      throw new Error("Rate limit configuration is unavailable.");
    }

    const value = request.headers.get(trustedHeader)?.trim();

    // This header must be stripped and set by a trusted deployment ingress.
    if (!value || value.includes(",") || value.length > 200) {
      throw new Error("Rate limit configuration is unavailable.");
    }

    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    // Local development has no trusted proxy. Do not trust forwarded headers.
    return "development";
  }

  throw new Error("Rate limit configuration is unavailable.");
}

function hashIdentifier(scope, value) {
  const secret = getRequiredEnvironmentValue("RATE_LIMIT_KEY_SECRET");

  if (secret.length < 32) {
    throw new Error("Rate limit configuration is unavailable.");
  }

  return createHmac("sha256", secret)
    .update(`${RATE_LIMIT_PREFIX}:${scope}:${value}`)
    .digest("base64url");
}

function getIdentifier(rule, { ip, email, studentId }) {
  if (rule.identifier === "ip") {
    return hashIdentifier("ip", ip);
  }

  if (rule.identifier === "email") {
    return email ? hashIdentifier("email", email) : null;
  }

  if (rule.identifier === "pair") {
    return email ? hashIdentifier("pair", `${ip}:${email}`) : null;
  }

  if (rule.identifier === "student") {
    if (!Number.isInteger(studentId) || studentId <= 0) {
      throw new Error("Rate limit configuration is unavailable.");
    }

    return hashIdentifier("student", String(studentId));
  }

  throw new Error("Rate limit configuration is unavailable.");
}

function getLimiters() {
  if (limiters) {
    return limiters;
  }

  const redis = new Redis({
    url: getRequiredEnvironmentValue("UPSTASH_REDIS_REST_URL"),
    token: getRequiredEnvironmentValue("UPSTASH_REDIS_REST_TOKEN"),
  });

  limiters = new Map();

  for (const [policyName, rules] of Object.entries(POLICIES)) {
    for (const rule of rules) {
      limiters.set(
        `${policyName}:${rule.name}`,
        new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
          prefix: `${RATE_LIMIT_PREFIX}:${policyName}:${rule.name}`,
          analytics: false,
          ephemeralCache: false,
          timeout: 5000,
        })
      );
    }
  }

  return limiters;
}

function createRateLimitResponse(result) {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Retry-After": String(retryAfter),
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": "0",
    "RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  });

  return Response.json(
    {
      success: false,
      message: "Too many attempts. Please try again later.",
    },
    { status: 429, headers }
  );
}

function createRateLimitUnavailableResponse() {
  return Response.json(
    {
      success: false,
      message: "This service is temporarily unavailable. Please try again shortly.",
    },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(RATE_LIMIT_FAILURE_RETRY_SECONDS),
      },
    }
  );
}

export async function enforceRateLimit({ request, policy, email, studentId }) {
  try {
    const rules = POLICIES[policy];

    if (!rules) {
      throw new Error("Rate limit configuration is unavailable.");
    }

    const ip = getClientIp(request);
    const normalizedEmail = normalizeRateLimitEmail(email);
    const configuredLimiters = getLimiters();
    const checks = rules
      .map((rule) => {
        const identifier = getIdentifier(rule, {
          ip,
          email: normalizedEmail,
          studentId,
        });

        if (!identifier) {
          return null;
        }

        return configuredLimiters
          .get(`${policy}:${rule.name}`)
          .limit(identifier);
      })
      .filter(Boolean);

    const results = await Promise.all(checks);

    if (results.some((result) => result.reason === "timeout")) {
      return { allowed: false, response: createRateLimitUnavailableResponse() };
    }

    const rejected = results.filter((result) => !result.success);

    if (rejected.length > 0) {
      const mostRestrictive = rejected.reduce((selected, result) =>
        result.reset > selected.reset ? result : selected
      );

      return {
        allowed: false,
        response: createRateLimitResponse(mostRestrictive),
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, response: createRateLimitUnavailableResponse() };
  }
}

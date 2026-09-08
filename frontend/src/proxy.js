import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const STUDENT_AUTH_COOKIE = "auth_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (typeof secret !== "string" || !secret.trim()) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

function redirectToLogin(request) {
  return NextResponse.redirect(new URL("/login", request.url));
}

// Proxy is an optimistic, pre-render check. Route handlers still verify the
// session through src/lib/student-auth.js before accessing student data.
export async function proxy(request) {
  const token = request.cookies.get(STUDENT_AUTH_COOKIE)?.value;
  const secret = getJwtSecret();

  if (!token || !secret) {
    return redirectToLogin(request);
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const studentId = Number(payload.studentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return redirectToLogin(request);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/career-selection/:path*",
    "/current-skills/:path*",
    "/skills/:path*",
    "/assessment/:path*",
    "/skill-assessment/:path*",
  ],
};

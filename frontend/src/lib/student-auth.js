import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export const STUDENT_AUTH_COOKIE = "auth_token";
export const STUDENT_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export class StudentAuthConfigurationError extends Error {
  constructor() {
    super("Student authentication is not configured.");
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (typeof secret !== "string" || !secret.trim()) {
    throw new StudentAuthConfigurationError();
  }

  return new TextEncoder().encode(secret);
}

export function getStudentAuthCookieOptions() {
  return {
    httpOnly: true,
    maxAge: STUDENT_AUTH_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function createStudentAuthToken({ studentId, email }) {
  return new SignJWT({
    studentId,
    email,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(studentId))
    .setIssuedAt()
    .setExpirationTime(`${STUDENT_AUTH_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function getAuthenticatedStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    const studentId = Number(payload.studentId);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      return null;
    }

    return {
      studentId,
      email: typeof payload.email === "string" ? payload.email : null,
    };
  } catch (error) {
    if (error instanceof StudentAuthConfigurationError) {
      throw error;
    }

    return null;
  }
}

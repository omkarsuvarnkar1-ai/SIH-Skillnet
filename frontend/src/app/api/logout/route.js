import { cookies } from "next/headers";
import {
  getStudentAuthCookieOptions,
  STUDENT_AUTH_COOKIE,
} from "../../../lib/student-auth";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(STUDENT_AUTH_COOKIE, "", {
    ...getStudentAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });

  return Response.json({
    success: true,
    message: "Logged out successfully.",
  });
}

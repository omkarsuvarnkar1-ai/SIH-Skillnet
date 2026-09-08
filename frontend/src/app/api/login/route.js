import pool from "../../../lib/database";
import bcrypt from "bcryptjs";
import {
  createStudentAuthToken,
  getStudentAuthCookieOptions,
  StudentAuthConfigurationError,
} from "../../../lib/student-auth";
import { enforceRateLimit, normalizeRateLimitEmail } from "../../../lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const email = normalizeRateLimitEmail(body?.email) || "";
    const password = body?.password;

    const rateLimit = await enforceRateLimit({
      request,
      policy: "student-login",
      email,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    if (!email || typeof password !== "string" || !password) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Find student
    const result = await pool.query(
      `SELECT
        s.student_id,
        s.full_name,
        s.email,
        s.password_hash,
        COALESCE(sp.college, s.college) AS college,
        COALESCE(sp.course, s.course) AS course,
        COALESCE(sp.year_of_study, s.year_of_study) AS year_of_study
       FROM students s
       LEFT JOIN student_profiles sp
         ON s.student_id = sp.student_id
       WHERE LOWER(TRIM(s.email)) = $1`,
      [email]
    );

    // Student not found
    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const student = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      student.password_hash
    );

    if (!passwordMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = await createStudentAuthToken({
      studentId: student.student_id,
      email: student.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      student: {
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        college: student.college,
        course: student.course,
        year_of_study: student.year_of_study,
      },
    });

    response.cookies.set("auth_token", token, getStudentAuthCookieOptions());

    return response;
  } catch (error) {
    if (error instanceof StudentAuthConfigurationError) {
      console.error("Student authentication is not configured.");

      return Response.json(
        {
          success: false,
          message: "Server authentication is not configured.",
        },
        { status: 500 }
      );
    }

    console.error("Login error.");

    return Response.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}

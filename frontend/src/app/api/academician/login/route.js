import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import pool from "@/lib/database";
import { enforceRateLimit, normalizeRateLimitEmail } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = normalizeRateLimitEmail(body?.email);
    const password = body?.password;

    const rateLimit = await enforceRateLimit({
      request,
      policy: "academician-login",
      email,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Find academician by email
    const result = await pool.query(
      `
      SELECT
        academician_id,
        full_name,
        email,
        password_hash,
        institution_name,
        designation,
        department
      FROM academicians
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const academician = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      academician.password_hash
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables.");

      return NextResponse.json(
        {
          success: false,
          message: "Server authentication is not configured.",
        },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    // Create authentication token
    const token = await new SignJWT({
      academicianId: academician.academician_id,
      email: academician.email,
      role: "academician",
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Create successful response
    const response = NextResponse.json({
      success: true,
      message: "Academician login successful.",
      academician: {
        id: academician.academician_id,
        full_name: academician.full_name,
        email: academician.email,
        institution_name: academician.institution_name,
        designation: academician.designation,
        department: academician.department,
      },
    });

    // Store authentication token in HTTP-only cookie
    response.cookies.set(
      "academician_auth_token",
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Academician login error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}

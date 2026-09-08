import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import pool from "@/lib/database";

export async function GET(request) {
  try {
    // Get authentication cookie
    const token = request.cookies.get("academician_auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // Check JWT secret
    const secretValue = process.env.JWT_SECRET;

    if (!secretValue) {
      console.error("JWT_SECRET is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Server configuration error.",
        },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(secretValue);

    // Verify JWT
    const { payload } = await jwtVerify(token, secret);

    const academicianId = payload.academicianId;

    if (!academicianId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token.",
        },
        { status: 401 }
      );
    }

    // Get academician from database
    const result = await pool.query(
      `
      SELECT
        academician_id,
        full_name,
        email,
        institution_name,
        designation,
        department
      FROM academicians
      WHERE academician_id = $1
      LIMIT 1
      `,
      [academicianId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Academician profile not found.",
        },
        { status: 404 }
      );
    }

    const academician = result.rows[0];

    return NextResponse.json({
      success: true,
      academician: {
        id: academician.academician_id,
        fullName: academician.full_name,
        email: academician.email,
        institutionName: academician.institution_name,
        designation: academician.designation,
        department: academician.department,
      },
    });
  } catch (error) {
    console.error("Academician profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load academician profile.",
      },
      { status: 500 }
    );
  }
}
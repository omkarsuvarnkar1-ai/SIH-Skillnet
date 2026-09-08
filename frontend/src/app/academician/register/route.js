import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/database";

export async function POST(request) {
  try {
    const body = await request.json();

    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const institutionName = body.institutionName?.trim();
    const designation = body.designation?.trim();
    const department = body.department?.trim();

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !institutionName ||
      !designation ||
      !department
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // Check whether email already exists
    const existingUser = await pool.query(
      `
      SELECT academician_id
      FROM academicians
      WHERE LOWER(email) = $1
      LIMIT 1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "An academician account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create academician account
    const result = await pool.query(
      `
      INSERT INTO academicians
      (
        full_name,
        email,
        password_hash,
        institution_name,
        designation,
        department
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        academician_id,
        full_name,
        email,
        institution_name,
        designation,
        department,
        created_at
      `,
      [
        fullName,
        email,
        passwordHash,
        institutionName,
        designation,
        department,
      ]
    );

    const academician = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: "Academician account created successfully.",
        academician: {
          id: academician.academician_id,
          fullName: academician.full_name,
          email: academician.email,
          institutionName: academician.institution_name,
          designation: academician.designation,
          department: academician.department,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Academician registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}
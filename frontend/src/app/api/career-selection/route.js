import pool from "../../../lib/database";
import { getAuthenticatedStudent } from "../../../lib/student-auth";

// =====================================================
// GET LOGGED-IN STUDENT ID
// =====================================================
async function getStudentId() {
  const student = await getAuthenticatedStudent();
  return student?.studentId ?? null;
}

// =====================================================
// SAVE CAREER SELECTION
// =====================================================
export async function POST(request) {
  try {
    // -------------------------------------------------
    // 1. Get logged-in student
    // -------------------------------------------------
    const studentId = await getStudentId();

    if (!studentId) {
      return Response.json(
        {
          success: false,
          message: "You are not logged in.",
        },
        { status: 401 }
      );
    }

    // -------------------------------------------------
    // 2. Read request body
    // -------------------------------------------------
    const body = await request.json();

    const {
      industry_id,
      role_id,
      career_uncertain = false,
    } = body;

    // -------------------------------------------------
    // 3. Validate selection
    // -------------------------------------------------
    if (!career_uncertain && (!industry_id || !role_id)) {
      return Response.json(
        {
          success: false,
          message: "Please select an industry and role.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 4. Check that student exists
    // -------------------------------------------------
    const studentResult = await pool.query(
      `
      SELECT student_id
      FROM students
      WHERE student_id = $1
      `,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Student account not found.",
        },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // 5. Check whether profile already exists
    // -------------------------------------------------
    const profileResult = await pool.query(
      `
      SELECT profile_id
      FROM student_profiles
      WHERE student_id = $1
      `,
      [studentId]
    );

    let result;

    // -------------------------------------------------
    // 6A. UPDATE existing profile
    // -------------------------------------------------
    if (profileResult.rows.length > 0) {
      result = await pool.query(
        `
        UPDATE student_profiles
        SET
          industry_id = $1,
          role_id = $2,
          career_uncertain = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $4
        RETURNING
          profile_id,
          student_id,
          industry_id,
          role_id,
          career_uncertain
        `,
        [
          career_uncertain ? null : Number(industry_id),
          career_uncertain ? null : Number(role_id),
          career_uncertain,
          studentId,
        ]
      );
    }

    // -------------------------------------------------
    // 6B. CREATE profile if it doesn't exist
    // -------------------------------------------------
    else {
      result = await pool.query(
        `
        INSERT INTO student_profiles (
          student_id,
          industry_id,
          role_id,
          career_uncertain,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING
          profile_id,
          student_id,
          industry_id,
          role_id,
          career_uncertain
        `,
        [
          studentId,
          career_uncertain ? null : Number(industry_id),
          career_uncertain ? null : Number(role_id),
          career_uncertain,
        ]
      );
    }

    // -------------------------------------------------
    // 7. Make sure profile was saved
    // -------------------------------------------------
    if (result.rows.length === 0) {
      console.error(
        "Career selection failed: profile was not created or updated."
      );

      return Response.json(
        {
          success: false,
          message: "Unable to save student profile.",
        },
        { status: 500 }
      );
    }

    const profile = result.rows[0];

    // -------------------------------------------------
    // 8. Return success
    // -------------------------------------------------
    return Response.json({
      success: true,
      message: "Career selection saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("Career selection error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to save career selection.",
      },
      { status: 500 }
    );
  }
}

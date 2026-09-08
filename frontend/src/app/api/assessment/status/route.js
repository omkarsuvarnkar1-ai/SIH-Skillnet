import pool from "../../../../lib/database";
import { getAuthenticatedStudent } from "../../../../lib/student-auth";

// =====================================================
// GET LOGGED-IN STUDENT ID
// =====================================================

async function getStudentId() {
  const student = await getAuthenticatedStudent();
  return student?.studentId ?? null;
}

// =====================================================
// GET ASSESSMENT STATUS
// =====================================================

export async function GET() {
  try {
    // -------------------------------------------------
    // Get logged-in student
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
    // Get the latest assessment attempt
    // for this student
    // -------------------------------------------------

    const result = await pool.query(
      `
      SELECT
        attempt_id,
        student_id,
        role_id,
        started_at,
        completed_at,
        status
      FROM assessment_attempts
      WHERE student_id = $1
      ORDER BY attempt_id DESC
      LIMIT 1
      `,
      [studentId]
    );

    // -------------------------------------------------
    // Student has never taken an assessment
    // -------------------------------------------------

    if (result.rows.length === 0) {
      return Response.json({
        success: true,

        assessment: {
          status: "Pending",
          completed: false,
          attempt_id: null,
          role_id: null,
          started_at: null,
          completed_at: null,
        },
      });
    }

    // -------------------------------------------------
    // Latest assessment attempt
    // -------------------------------------------------

    const attempt = result.rows[0];

    // -------------------------------------------------
    // Return status to dashboard
    // -------------------------------------------------

    return Response.json({
      success: true,

      assessment: {
        status: attempt.status,

        completed:
          attempt.status === "Completed",

        attempt_id: attempt.attempt_id,

        role_id: attempt.role_id,

        started_at: attempt.started_at,

        completed_at: attempt.completed_at,
      },
    });
  } catch (error) {
    console.error(
      "Assessment status error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to get assessment status.",

      },
      { status: 500 }
    );
  }
}

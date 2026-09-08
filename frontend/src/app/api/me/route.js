import pool from "../../../lib/database";
import {
  getAuthenticatedStudent,
  StudentAuthConfigurationError,
} from "../../../lib/student-auth";

export async function GET() {
  try {
    const authenticatedStudent = await getAuthenticatedStudent();

    if (!authenticatedStudent) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // Get student from database
    const result = await pool.query(
      `SELECT
        student_id,
        full_name,
        email,
        COALESCE(sp.college, s.college) AS college,
        COALESCE(sp.course, s.course) AS course,
        COALESCE(sp.year_of_study, s.year_of_study) AS year_of_study,
        s.created_at AS created_at
       FROM students s
       LEFT JOIN student_profiles sp
         ON s.student_id = sp.student_id
       WHERE s.student_id = $1`,
      [authenticatedStudent.studentId]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Student not found.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      student: result.rows[0],
    });
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

    console.error("Authentication error.");

    return Response.json(
      {
        success: false,
        message: "Invalid or expired session.",
      },
      { status: 401 }
    );
  }
}

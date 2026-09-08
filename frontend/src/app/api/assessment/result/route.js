import pool from "../../../../lib/database";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

// =====================================================
// GET LOGGED-IN STUDENT ID
// =====================================================

async function getStudentId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    return Number(payload.studentId);
  } catch (error) {
    console.error(
      "JWT verification error:",
      error
    );

    return null;
  }
}

// =====================================================
// GET LATEST COMPLETED ASSESSMENT RESULT
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
    // Find latest completed assessment attempt
    // -------------------------------------------------

    const attemptResult = await pool.query(
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
        AND status = 'Completed'
      ORDER BY completed_at DESC NULLS LAST, attempt_id DESC
      LIMIT 1
      `,
      [studentId]
    );

    if (attemptResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "No completed assessment was found.",
        },
        { status: 404 }
      );
    }

    const attempt = attemptResult.rows[0];

    // -------------------------------------------------
    // Get skill-wise assessment results
    // -------------------------------------------------

    const resultsResult = await pool.query(
      `
      SELECT
        result_id,
        attempt_id,
        skill_name,
        questions_attempted,
        correct_answers,
        score,
        skill_level,
        created_at
      FROM assessment_results
      WHERE attempt_id = $1
      ORDER BY result_id ASC
      `,
      [attempt.attempt_id]
    );

    // -------------------------------------------------
    // Calculate overall result
    // -------------------------------------------------

    let totalQuestions = 0;
    let totalCorrect = 0;

    const skills = resultsResult.rows.map(
      (row) => {
        const questionsAttempted =
          Number(row.questions_attempted) || 0;

        const correctAnswers =
          Number(row.correct_answers) || 0;

        const score =
          Number(row.score) || 0;

        totalQuestions += questionsAttempted;
        totalCorrect += correctAnswers;

        return {
          skill_name: row.skill_name,
          total_questions: questionsAttempted,
          correct_answers: correctAnswers,
          incorrect_answers:
            questionsAttempted - correctAnswers,
          percentage: score,
          level: row.skill_level,
        };
      }
    );

    const percentage =
      totalQuestions > 0
        ? Math.round(
            (totalCorrect / totalQuestions) * 100
          )
        : 0;

    let overallLevel;

    if (percentage < 40) {
      overallLevel = "Beginner";
    } else if (percentage < 70) {
      overallLevel = "Intermediate";
    } else {
      overallLevel = "Advanced";
    }

    // -------------------------------------------------
    // Return result
    // -------------------------------------------------

    return Response.json({
      success: true,

      result: {
        student_id: studentId,

        attempt_id: attempt.attempt_id,

        role_id: attempt.role_id,

        started_at: attempt.started_at,

        completed_at: attempt.completed_at,

        total_questions: totalQuestions,

        correct_answers: totalCorrect,

        incorrect_answers:
          totalQuestions - totalCorrect,

        percentage,

        overall_level: overallLevel,

        skills,
      },
    });
  } catch (error) {
    console.error(
      "Assessment result API error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load assessment result.",
        error:
          error?.message ||
          "Unknown database error.",
      },
      { status: 500 }
    );
  }
}
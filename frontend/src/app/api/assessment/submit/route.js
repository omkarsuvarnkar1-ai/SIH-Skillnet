import pool from "../../../../lib/database";
import { getAuthenticatedStudent } from "../../../../lib/student-auth";
import { enforceRateLimit } from "../../../../lib/rate-limit";

// =====================================================
// GET LOGGED-IN STUDENT ID
// =====================================================
async function getStudentId() {
  const student = await getAuthenticatedStudent();
  return student?.studentId ?? null;
}

// =====================================================
// SUBMIT ASSESSMENT
// =====================================================
export async function POST(request) {
  let client;

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

    const rateLimit = await enforceRateLimit({
      request,
      policy: "assessment-submit",
      studentId,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    client = await pool.connect();

    // -------------------------------------------------
    // 2. Read request body
    // -------------------------------------------------
    const body = await request.json();
    const answers = body.answers;

    if (!answers || typeof answers !== "object") {
      return Response.json(
        {
          success: false,
          message: "Assessment answers are required.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 3. Get submitted question IDs
    // -------------------------------------------------
    const questionIds = Object.keys(answers)
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    if (questionIds.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No answers were submitted.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 4. Get student's selected role
    // -------------------------------------------------
    const profileResult = await client.query(
      `
      SELECT role_id
      FROM student_profiles
      WHERE student_id = $1
      `,
      [studentId]
    );

    if (profileResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const roleId = profileResult.rows[0].role_id;

    if (!roleId) {
      return Response.json(
        {
          success: false,
          message: "No role has been selected for this student.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 5. Get questions and correct answers
    // -------------------------------------------------
    const questionsResult = await client.query(
      `
      SELECT
        question_id,
        skill_name,
        difficulty,
        correct_answer
      FROM assessment_questions
      WHERE question_id = ANY($1::int[])
        AND role_id = $2
      `,
      [questionIds, roleId]
    );

    if (questionsResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "The submitted questions could not be found.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 6. Start database transaction
    // -------------------------------------------------
    await client.query("BEGIN");

    // -------------------------------------------------
    // 7. Create assessment attempt
    // -------------------------------------------------
    const attemptResult = await client.query(
      `
      INSERT INTO assessment_attempts (
        student_id,
        role_id,
        started_at,
        status
      )
      VALUES (
        $1,
        $2,
        CURRENT_TIMESTAMP,
        'In Progress'
      )
      RETURNING attempt_id, started_at, status
      `,
      [studentId, roleId]
    );

    const attemptId = attemptResult.rows[0].attempt_id;

    // -------------------------------------------------
    // 8. Calculate results
    // -------------------------------------------------
    let totalQuestions = questionsResult.rows.length;
    let correctAnswers = 0;

    const skillResults = {};

    for (const question of questionsResult.rows) {
      const questionId = question.question_id;

      // Answers are stored using question IDs as keys.
      const studentAnswer = answers[questionId];

      const correctAnswer = question.correct_answer;

      const isCorrect =
        studentAnswer !== undefined &&
        String(studentAnswer).trim().toUpperCase() ===
          String(correctAnswer).trim().toUpperCase();

      if (isCorrect) {
        correctAnswers++;
      }

      // -------------------------------------------------
      // Skill-wise calculation
      // -------------------------------------------------
      if (!skillResults[question.skill_name]) {
        skillResults[question.skill_name] = {
          skill_name: question.skill_name,
          total: 0,
          correct: 0,
        };
      }

      skillResults[question.skill_name].total++;

      if (isCorrect) {
        skillResults[question.skill_name].correct++;
      }

      // -------------------------------------------------
      // Save individual answer
      // -------------------------------------------------
      await client.query(
        `
        INSERT INTO assessment_answers (
          attempt_id,
          question_id,
          selected_answer,
          is_correct,
          answered_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          CURRENT_TIMESTAMP
        )
        `,
        [
          attemptId,
          questionId,
          studentAnswer
            ? String(studentAnswer).trim().toUpperCase()
            : null,
          isCorrect,
        ]
      );
    }

    // -------------------------------------------------
    // 9. Overall percentage
    // -------------------------------------------------
    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // -------------------------------------------------
    // 10. Determine overall level
    // -------------------------------------------------
    let overallLevel;

    if (percentage < 40) {
      overallLevel = "Beginner";
    } else if (percentage < 70) {
      overallLevel = "Intermediate";
    } else {
      overallLevel = "Advanced";
    }

    // -------------------------------------------------
    // 11. Save skill-wise results
    // -------------------------------------------------
    const skills = Object.values(skillResults).map((skill) => {
      const skillPercentage =
        skill.total > 0
          ? Math.round((skill.correct / skill.total) * 100)
          : 0;

      let level;

      if (skillPercentage < 40) {
        level = "Beginner";
      } else if (skillPercentage < 70) {
        level = "Intermediate";
      } else {
        level = "Advanced";
      }

      return {
        skill_name: skill.skill_name,
        total_questions: skill.total,
        correct_answers: skill.correct,
        incorrect_answers: skill.total - skill.correct,
        percentage: skillPercentage,
        level,
      };
    });

    // -------------------------------------------------
    // 12. Insert skill-wise results
    // -------------------------------------------------
    for (const skill of skills) {
      await client.query(
        `
        INSERT INTO assessment_results (
          attempt_id,
          skill_name,
          questions_attempted,
          correct_answers,
          score,
          skill_level,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          CURRENT_TIMESTAMP
        )
        `,
        [
          attemptId,
          skill.skill_name,
          skill.total_questions,
          skill.correct_answers,
          skill.percentage,
          skill.level,
        ]
      );
    }

    // -------------------------------------------------
    // 13. Mark assessment as COMPLETED
    // -------------------------------------------------
    await client.query(
      `
      UPDATE assessment_attempts
      SET
        status = 'Completed',
        completed_at = CURRENT_TIMESTAMP
      WHERE attempt_id = $1
      `,
      [attemptId]
    );

    // -------------------------------------------------
    // 14. Commit transaction
    // -------------------------------------------------
    await client.query("COMMIT");

    // -------------------------------------------------
    // 15. Return assessment result
    // -------------------------------------------------
    return Response.json({
      success: true,
      message: "Assessment submitted successfully.",
      result: {
        student_id: studentId,
        attempt_id: attemptId,
        role_id: roleId,

        total_questions: totalQuestions,

        correct_answers: correctAnswers,

        incorrect_answers:
          totalQuestions - correctAnswers,

        percentage,

        overall_level: overallLevel,

        skills,
      },
    });
  } catch (error) {
    // -------------------------------------------------
    // Rollback if anything failed
    // -------------------------------------------------
    try {
      if (client) {
        await client.query("ROLLBACK");
      }
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Assessment submission error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to submit assessment.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

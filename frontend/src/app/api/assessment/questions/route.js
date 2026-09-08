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
// SHUFFLE ARRAY
// =====================================================

function shuffle(array) {
  return [...array].sort(
    () => Math.random() - 0.5
  );
}

// =====================================================
// GET ASSESSMENT QUESTIONS
// =====================================================

export async function GET(request) {
  try {
    // -------------------------------------------------
    // 1. GET LOGGED-IN STUDENT
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
      policy: "assessment-questions",
      studentId,
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    // -------------------------------------------------
    // 2. GET STUDENT PROFILE
    // -------------------------------------------------

    const profileResult = await pool.query(
      `
      SELECT
        role_id,
        career_uncertain
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

    const profile = profileResult.rows[0];

    // -------------------------------------------------
    // 3. CHECK CAREER ROLE
    // -------------------------------------------------

    if (
      profile.career_uncertain === true ||
      !profile.role_id
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please select a career role before starting the assessment.",
        },
        { status: 400 }
      );
    }

    const roleId = profile.role_id;

    // -------------------------------------------------
    // 4. GET STUDENT'S SELECTED SKILLS
    // -------------------------------------------------

    const skillsResult = await pool.query(
      `
      SELECT
        skill_name,
        self_level
      FROM student_skills
      WHERE student_id = $1
      ORDER BY skill_name
      `,
      [studentId]
    );

    if (skillsResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "Please select your current skills before starting the assessment.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 5. REMOVE "NOT FAMILIAR"
    // -------------------------------------------------

    const selectedSkills =
      skillsResult.rows.filter(
        (skill) =>
          skill.self_level !== "Not familiar"
      );

    if (selectedSkills.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "Please select at least one skill that you are familiar with.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 6. DEFINE ALLOWED DIFFICULTIES
    //
    // Beginner:
    // Easy + Moderate
    //
    // Intermediate:
    // Moderate + Difficult
    //
    // Advanced:
    // Difficult only
    // -------------------------------------------------

    const skillPreferences =
      selectedSkills.map((skill) => {
        let allowedDifficulties = [];

        if (skill.self_level === "Beginner") {
          allowedDifficulties = [
            "Easy",
            "Moderate",
          ];
        } else if (
          skill.self_level === "Intermediate"
        ) {
          allowedDifficulties = [
            "Moderate",
            "Difficult",
          ];
        } else if (
          skill.self_level === "Advanced"
        ) {
          allowedDifficulties = [
            "Difficult",
          ];
        }

        return {
          skillName: skill.skill_name,
          level: skill.self_level,
          allowedDifficulties,
        };
      });

    // -------------------------------------------------
    // 7. GET ALL QUESTIONS FOR SELECTED SKILLS
    // -------------------------------------------------

    const availableResult = await pool.query(
      `
      SELECT
        question_id,
        role_id,
        skill_name,
        difficulty,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        question_type,
        concepts_tested
      FROM assessment_questions
      WHERE role_id = $1
        AND skill_name = ANY($2::text[])
      `,
      [
        roleId,
        skillPreferences.map(
          (skill) => skill.skillName
        ),
      ]
    );

    if (availableResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message:
            "No assessment questions are available for your selected skills.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 8. FILTER QUESTIONS BY STUDENT LEVEL
    // -------------------------------------------------

    const suitableQuestions =
      availableResult.rows.filter(
        (question) => {
          const skillPreference =
            skillPreferences.find(
              (skill) =>
                skill.skillName ===
                question.skill_name
            );

          if (!skillPreference) {
            return false;
          }

          return skillPreference.allowedDifficulties.includes(
            question.difficulty
          );
        }
      );

    // -------------------------------------------------
    // 9. CHECK WHETHER 10 QUESTIONS ARE POSSIBLE
    // -------------------------------------------------

    if (suitableQuestions.length < 10) {
      return Response.json(
        {
          success: false,
          message: `Only ${suitableQuestions.length} suitable assessment questions are available for your selected skills. Please add more questions to the question bank.`,
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 10. GROUP QUESTIONS BY SKILL
    // -------------------------------------------------

    const questionsBySkill = {};

    for (const skill of skillPreferences) {
      questionsBySkill[skill.skillName] = [];
    }

    for (const question of suitableQuestions) {
      if (
        questionsBySkill[question.skill_name]
      ) {
        questionsBySkill[
          question.skill_name
        ].push(question);
      }
    }

    // -------------------------------------------------
    // 11. SHUFFLE QUESTIONS INSIDE EACH SKILL
    // -------------------------------------------------

    for (const skillName of Object.keys(
      questionsBySkill
    )) {
      questionsBySkill[skillName] =
        shuffle(
          questionsBySkill[skillName]
        );
    }

    // -------------------------------------------------
    // 12. SELECT QUESTIONS
    //
    // TARGET = 10
    //
    // First, give each selected/familiar skill
    // one question.
    //
    // Then distribute the remaining questions
    // randomly among those skills.
    // -------------------------------------------------

    const finalQuestions = [];

    const activeSkills = Object.keys(
      questionsBySkill
    ).filter(
      (skillName) =>
        questionsBySkill[skillName].length > 0
    );

    // -------------------------------------------------
    // 12A. ONE QUESTION PER SKILL
    // -------------------------------------------------

    const shuffledSkills =
      shuffle(activeSkills);

    for (const skillName of shuffledSkills) {
      if (finalQuestions.length >= 10) {
        break;
      }

      const question =
        questionsBySkill[
          skillName
        ].shift();

      if (question) {
        finalQuestions.push(question);
      }
    }

    // -------------------------------------------------
    // 12B. FILL REMAINING QUESTIONS
    // -------------------------------------------------

    while (finalQuestions.length < 10) {
      const availableSkills =
        Object.keys(
          questionsBySkill
        ).filter(
          (skillName) =>
            questionsBySkill[
              skillName
            ].length > 0
        );

      if (availableSkills.length === 0) {
        break;
      }

      const randomSkill =
        availableSkills[
          Math.floor(
            Math.random() *
              availableSkills.length
          )
        ];

      const question =
        questionsBySkill[
          randomSkill
        ].shift();

      if (question) {
        finalQuestions.push(question);
      }
    }

    // -------------------------------------------------
    // 13. FINAL SAFETY CHECK
    // -------------------------------------------------

    if (finalQuestions.length !== 10) {
      return Response.json(
        {
          success: false,
          message:
            `Unable to create the 10-question assessment. Only ${finalQuestions.length} suitable questions were found.`,
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // 14. SHUFFLE FINAL QUESTIONS
    // -------------------------------------------------

    const shuffledFinalQuestions =
      shuffle(finalQuestions);

    // -------------------------------------------------
    // 15. REMOVE CORRECT ANSWER
    //
    // NEVER send correct_answer to the browser.
    // -------------------------------------------------

    const questionsForStudent =
      shuffledFinalQuestions.map(
        (question) => ({
          question_id:
            question.question_id,

          skill_name:
            question.skill_name,

          difficulty:
            question.difficulty,

          question_text:
            question.question_text,

          option_a:
            question.option_a,

          option_b:
            question.option_b,

          option_c:
            question.option_c,

          option_d:
            question.option_d,

          question_type:
            question.question_type,

          concepts_tested:
            question.concepts_tested,
        })
      );

    // -------------------------------------------------
    // 16. GET ROLE NAME
    // -------------------------------------------------

    let roleName = "";

    try {
      const roleResult = await pool.query(
        `
        SELECT role_name
        FROM career_roles
        WHERE role_id = $1
        `,
        [roleId]
      );

      if (roleResult.rows.length > 0) {
        roleName =
          roleResult.rows[0].role_name;
      }
    } catch (error) {
      console.error(
        "Unable to get role name:",
        error
      );
    }

    // -------------------------------------------------
    // 17. RETURN ASSESSMENT
    // -------------------------------------------------

    return Response.json({
      success: true,

      role_id: roleId,

      role: roleName,

      total_questions: 10,

      questions:
        questionsForStudent,
    });
  } catch (error) {
    console.error(
      "Assessment questions error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Unable to load assessment questions.",
      },
      { status: 500 }
    );
  }
}

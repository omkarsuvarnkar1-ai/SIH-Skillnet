import pool from "../../../lib/database";
import { getAuthenticatedStudent } from "../../../lib/student-auth";

// =====================================================
// GET LOGGED-IN STUDENT ID FROM JWT
// =====================================================

async function getStudentId() {
  const student = await getAuthenticatedStudent();
  return student?.studentId ?? null;
}

// =====================================================
// GET - LOAD CAREER AND REQUIRED SKILLS
// =====================================================

export async function GET() {
  try {
    // ---------------------------------------------------
    // Get logged-in student
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // Get student's career selection
    // ---------------------------------------------------

    const careerResult = await pool.query(
      `
      SELECT
        sp.industry_id,
        sp.role_id,
        sp.career_uncertain,
        cr.role_name,
        cr.description,
        i.industry_name
      FROM student_profiles sp
      LEFT JOIN career_roles cr
        ON sp.role_id = cr.role_id
      LEFT JOIN industries i
        ON sp.industry_id = i.industry_id
      WHERE sp.student_id = $1
      `,
      [studentId]
    );

    if (careerResult.rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Student profile not found.",
        },
        { status: 404 }
      );
    }

    const career = careerResult.rows[0];

    // ---------------------------------------------------
    // Career not selected yet
    // ---------------------------------------------------

    if (
      career.career_uncertain === true ||
      !career.role_id
    ) {
      return Response.json({
        success: true,
        career: {
          career_uncertain: true,
          industry_id: career.industry_id,
          role_id: career.role_id,
          role_name: null,
          description: null,
          industry_name: null,
        },
        skills: [],
        studentSkills: [],
      });
    }

    // ---------------------------------------------------
    // Get skills required for selected career role
    // ---------------------------------------------------

    const skillsResult = await pool.query(
      `
      SELECT
        career_role_skill_id,
        role_id,
        skill_name
      FROM career_role_skills
      WHERE role_id = $1
      ORDER BY career_role_skill_id
      `,
      [career.role_id]
    );

    // ---------------------------------------------------
    // Get student's previously saved skill levels
    // ---------------------------------------------------

    const studentSkillsResult = await pool.query(
      `
      SELECT
        student_skill_id,
        skill_name,
        self_level
      FROM student_skills
      WHERE student_id = $1
      ORDER BY student_skill_id
      `,
      [studentId]
    );

    // ---------------------------------------------------
    // Return everything
    // ---------------------------------------------------

    return Response.json({
      success: true,

      career: {
        career_uncertain: false,
        industry_id: career.industry_id,
        role_id: career.role_id,
        role_name: career.role_name,
        description: career.description,
        industry_name: career.industry_name,
      },

      skills: skillsResult.rows,

      studentSkills: studentSkillsResult.rows,
    });

  } catch (error) {
    console.error("Current skills GET error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to load career skills.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - SAVE CURRENT SKILLS
// =====================================================

export async function POST(request) {
  try {
    // ---------------------------------------------------
    // Get logged-in student
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // Read request body
    // ---------------------------------------------------

    const body = await request.json();

    const skills = body.skills;

    if (!Array.isArray(skills)) {
      return Response.json(
        {
          success: false,
          message: "Invalid skills data.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------
    // Valid skill levels
    // ---------------------------------------------------

    const validLevels = [
      "Not familiar",
      "Beginner",
      "Intermediate",
      "Advanced",
    ];

    // ---------------------------------------------------
    // Save skills
    // ---------------------------------------------------

    for (const skill of skills) {
      const skillName = skill.skill_name;
      const selfLevel = skill.self_level;

      if (
        !skillName ||
        !validLevels.includes(selfLevel)
      ) {
        continue;
      }

      // -------------------------------------------------
      // Check if skill already exists
      // -------------------------------------------------

      const existingSkill = await pool.query(
        `
        SELECT student_skill_id
        FROM student_skills
        WHERE student_id = $1
          AND skill_name = $2
        `,
        [studentId, skillName]
      );

      // -------------------------------------------------
      // Update existing skill
      // -------------------------------------------------

      if (existingSkill.rows.length > 0) {
        await pool.query(
          `
          UPDATE student_skills
          SET
            self_level = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE student_id = $2
            AND skill_name = $3
          `,
          [
            selfLevel,
            studentId,
            skillName,
          ]
        );
      }

      // -------------------------------------------------
      // Insert new skill
      // -------------------------------------------------

      else {
        await pool.query(
          `
          INSERT INTO student_skills
            (
              student_id,
              skill_name,
              self_level
            )
          VALUES
            ($1, $2, $3)
          `,
          [
            studentId,
            skillName,
            selfLevel,
          ]
        );
      }
    }

    // ---------------------------------------------------
    // Success
    // ---------------------------------------------------

    return Response.json({
      success: true,
      message: "Skills saved successfully.",
    });

  } catch (error) {
    console.error(
      "Current skills POST error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Unable to save your skills.",
      },
      { status: 500 }
    );
  }
}

import pool from "../../../lib/database";
import { getAuthenticatedStudent } from "../../../lib/student-auth";

const MAX_EDUCATION_FIELD_LENGTH = 200;
const MAX_BIO_LENGTH = 2000;
const VALID_GENDERS = new Set(["Female", "Male", "Other"]);

function normalizeOptionalText(value, fieldName, maxLength) {
  if (value === undefined || value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${fieldName} must be text.` };
  }

  const normalized = value.trim();

  if (normalized.length > maxLength) {
    return {
      error: `${fieldName} must be ${maxLength} characters or fewer.`,
    };
  }

  return { value: normalized || null };
}

function normalizeProfile(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid profile data." };
  }

  const college = normalizeOptionalText(
    body.college,
    "College",
    MAX_EDUCATION_FIELD_LENGTH
  );
  const course = normalizeOptionalText(
    body.course,
    "Course",
    MAX_EDUCATION_FIELD_LENGTH
  );
  const specialization = normalizeOptionalText(
    body.specialization,
    "Specialization",
    MAX_EDUCATION_FIELD_LENGTH
  );
  const bio = normalizeOptionalText(body.bio, "Bio", MAX_BIO_LENGTH);

  for (const field of [college, course, specialization, bio]) {
    if (field.error) {
      return field;
    }
  }

  if (!college.value || !course.value) {
    return { error: "College and course are required." };
  }

  let gender = null;

  if (body.gender !== undefined && body.gender !== null && body.gender !== "") {
    if (typeof body.gender !== "string" || !VALID_GENDERS.has(body.gender)) {
      return { error: "Gender must be Female, Male, or Other." };
    }

    gender = body.gender;
  }

  let dateOfBirth = null;

  if (
    body.date_of_birth !== undefined &&
    body.date_of_birth !== null &&
    body.date_of_birth !== ""
  ) {
    const parsedDate = new Date(`${body.date_of_birth}T00:00:00Z`);

    if (
      typeof body.date_of_birth !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.date_of_birth) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== body.date_of_birth
    ) {
      return { error: "Date of birth must be a valid date." };
    }

    dateOfBirth = body.date_of_birth;
  }

  let yearOfStudy = null;

  if (
    body.year_of_study !== undefined &&
    body.year_of_study !== null &&
    body.year_of_study !== ""
  ) {
    if (
      typeof body.year_of_study !== "number" ||
      !Number.isInteger(body.year_of_study) ||
      body.year_of_study < 1 ||
      body.year_of_study > 6
    ) {
      return { error: "Year of study must be a whole number from 1 to 6." };
    }

    yearOfStudy = body.year_of_study;
  }

  if (!yearOfStudy) {
    return { error: "Year of study is required." };
  }

  return {
    value: {
      date_of_birth: dateOfBirth,
      gender,
      college: college.value,
      course: course.value,
      specialization: specialization.value,
      year_of_study: yearOfStudy,
      bio: bio.value,
    },
  };
}

// =====================================================
// GET LOGGED-IN STUDENT ID FROM JWT
// =====================================================

async function getStudentId() {
  const student = await getAuthenticatedStudent();
  return student?.studentId ?? null;
}

// =====================================================
// GET PROFILE
// =====================================================

export async function GET() {
  try {
    const studentId = await getStudentId();

    if (!studentId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        s.student_id,
        s.full_name,
        s.email,
        COALESCE(sp.college, s.college) AS college,
        COALESCE(sp.course, s.course) AS course,
        COALESCE(sp.year_of_study, s.year_of_study) AS year_of_study,

        sp.profile_id,
        sp.date_of_birth,
        sp.gender,
        sp.specialization,
        sp.bio,

        -- Career selection
        sp.industry_id,
        sp.role_id,
        sp.career_uncertain

      FROM students s

      LEFT JOIN student_profiles sp
        ON s.student_id = sp.student_id

      WHERE s.student_id = $1
      `,
      [studentId]
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
      profile: result.rows[0],
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch profile.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// CREATE / UPDATE PROFILE
// =====================================================

export async function POST(request) {
  try {
    const studentId = await getStudentId();

    if (!studentId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid profile data.",
        },
        { status: 400 }
      );
    }

    const normalizedProfile = normalizeProfile(body);

    if (normalizedProfile.error) {
      return Response.json(
        {
          success: false,
          message: normalizedProfile.error,
        },
        { status: 400 }
      );
    }

    const {
      date_of_birth,
      gender,
      college,
      course,
      specialization,
      year_of_study,
      bio,
    } = normalizedProfile.value;

    const result = await pool.query(
      `
      INSERT INTO student_profiles (
        student_id,
        date_of_birth,
        gender,
        college,
        course,
        specialization,
        year_of_study,
        bio
      )

      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

      ON CONFLICT (student_id)

      DO UPDATE SET
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        college = EXCLUDED.college,
        course = EXCLUDED.course,
        specialization = EXCLUDED.specialization,
        year_of_study = EXCLUDED.year_of_study,
        bio = EXCLUDED.bio,
        updated_at = CURRENT_TIMESTAMP

      RETURNING *;
      `,
      [
        studentId,
        date_of_birth,
        gender,
        college,
        course,
        specialization,
        year_of_study,
        bio,
      ]
    );

    return Response.json({
      success: true,
      message: "Profile saved successfully.",
      profile: result.rows[0],
    });

  } catch (error) {
    console.error("Save profile error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to save profile.",
      },
      { status: 500 }
    );
  }
}

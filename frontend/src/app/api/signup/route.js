import pool from "../../../lib/database";
import bcrypt from "bcryptjs";
import { enforceRateLimit, normalizeRateLimitEmail } from "../../../lib/rate-limit";

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_EDUCATION_FIELD_LENGTH = 200;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_YEAR_OF_STUDY = 1;
const MAX_YEAR_OF_STUDY = 4;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeRequiredText(value, fieldName, maxLength) {
  if (typeof value !== "string") {
    return { error: `${fieldName} is required.` };
  }

  const normalized = value.trim();

  if (!normalized) {
    return { error: `${fieldName} is required.` };
  }

  if (normalized.length > maxLength) {
    return {
      error: `${fieldName} must be ${maxLength} characters or fewer.`,
    };
  }

  return { value: normalized };
}

function validateSignup(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid signup data." };
  }

  const fullName = normalizeRequiredText(
    body.full_name,
    "Full name",
    MAX_NAME_LENGTH
  );
  const college = normalizeRequiredText(
    body.college,
    "College",
    MAX_EDUCATION_FIELD_LENGTH
  );
  const course = normalizeRequiredText(
    body.course,
    "Course",
    MAX_EDUCATION_FIELD_LENGTH
  );

  for (const field of [fullName, college, course]) {
    if (field.error) {
      return field;
    }
  }

  if (typeof body.email !== "string") {
    return { error: "Email is required." };
  }

  const email = body.email.trim().toLowerCase();

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (typeof body.password !== "string") {
    return { error: "Password is required." };
  }

  if (
    body.password.length < MIN_PASSWORD_LENGTH ||
    body.password.length > MAX_PASSWORD_LENGTH
  ) {
    return {
      error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }

  if (
    typeof body.year_of_study !== "number" ||
    !Number.isInteger(body.year_of_study) ||
    body.year_of_study < MIN_YEAR_OF_STUDY ||
    body.year_of_study > MAX_YEAR_OF_STUDY
  ) {
    return {
      error: `Year of study must be a whole number from ${MIN_YEAR_OF_STUDY} to ${MAX_YEAR_OF_STUDY}.`,
    };
  }

  return {
    value: {
      full_name: fullName.value,
      email,
      password: body.password,
      college: college.value,
      course: course.value,
      year_of_study: body.year_of_study,
    },
  };
}

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          message: "Invalid signup data.",
        },
        { status: 400 }
      );
    }

    const rateLimit = await enforceRateLimit({
      request,
      policy: "student-signup",
      email: normalizeRateLimitEmail(body?.email),
    });

    if (!rateLimit.allowed) {
      return rateLimit.response;
    }

    const signup = validateSignup(body);

    if (signup.error) {
      return Response.json(
        {
          success: false,
          message: signup.error,
        },
        { status: 400 }
      );
    }

    const {
      full_name,
      email,
      password,
      college,
      course,
      year_of_study,
    } = signup.value;

    // Check if email already exists
    const existingStudent = await pool.query(
      "SELECT student_id FROM students WHERE LOWER(TRIM(email)) = $1",
      [email]
    );

    if (existingStudent.rows.length > 0) {
      return Response.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert student
    const result = await pool.query(
      `INSERT INTO students
        (full_name, email, password_hash, college, course, year_of_study)
       VALUES
        ($1, $2, $3, $4, $5, $6)
       RETURNING student_id, full_name, email, college, course, year_of_study`,
      [
        full_name,
        email,
        passwordHash,
        college,
        course,
        year_of_study,
      ]
    );

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        student: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error?.code === "23505") {
      return Response.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Something went wrong while creating the account.",
      },
      { status: 500 }
    );
  }
}

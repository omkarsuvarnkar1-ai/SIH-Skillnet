import { GoogleGenAI } from "@google/genai";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// ============================================================
// GEMINI SETUP
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env.local");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// ============================================================
// MODELS
// ============================================================
//
// We try the best model first.
// If it is temporarily unavailable, we automatically
// try the next model.
//
// Current stable Gemini API models include:
// - gemini-3.8-flash
// - gemini-3.6-flash
// - gemini-2.5-flash
//
// ============================================================

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
];

// ============================================================
// JWT SECRET
// ============================================================

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(process.env.JWT_SECRET);
}

// ============================================================
// GET AUTHENTICATED STUDENT
// ============================================================

async function getAuthenticatedStudent() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getJwtSecret()
    );

    return {
      studentId: payload.studentId,
      email: payload.email,
    };
  } catch (error) {
    console.error("JWT verification error:", error);

    return null;
  }
}

// ============================================================
// WAIT FUNCTION
// ============================================================

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ============================================================
// CHECK WHETHER ERROR IS RETRYABLE
// ============================================================

function isRetryableError(error) {
  const message =
    error?.message ||
    error?.error?.message ||
    String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("500") ||
    message.includes("INTERNAL")
  );
}

// ============================================================
// GENERATE CONTENT WITH RETRIES
// ============================================================

async function generateWithRetry(model, prompt) {
  const MAX_RETRIES = 3;

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Gemini attempt ${attempt}/${MAX_RETRIES} using ${model}`
      );

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (!response) {
        throw new Error(
          "Gemini returned no response."
        );
      }

      const text = response.text;

      if (!text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log(
        `Gemini response received from ${model}`
      );

      return text;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini attempt ${attempt} failed using ${model}:`,
        error?.message || error
      );

      // If this error is not something that retrying
      // can fix, immediately stop retrying this model.
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't wait after the final attempt.
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 2000;

        console.log(
          `Waiting ${delay}ms before retry...`
        );

        await sleep(delay);
      }
    }
  }

  throw lastError;
}

// ============================================================
// CLEAN GEMINI JSON
// ============================================================

function cleanJsonText(text) {
  if (!text) {
    return "";
  }

  let cleaned = text.trim();

  // Remove accidental Markdown code fences
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  }

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/i, "");
  }

  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/i, "");
  }

  return cleaned.trim();
}

// ============================================================
// VALIDATE ROADMAP
// ============================================================

function validateRoadmap(roadmap) {
  if (!roadmap) {
    return false;
  }

  if (!Array.isArray(roadmap.phases)) {
    return false;
  }

  if (roadmap.phases.length === 0) {
    return false;
  }

  if (!roadmap.career) {
    return false;
  }

  return true;
}

// ============================================================
// POST /api/roadmap/generate
// ============================================================

export async function POST(request) {
  try {
    console.log(
      "=========================================="
    );

    console.log(
      "ROADMAP GENERATION STARTED"
    );

    console.log(
      "=========================================="
    );

    // ========================================================
    // 1. CHECK GEMINI API KEY
    // ========================================================

    if (!GEMINI_API_KEY) {
      return Response.json(
        {
          success: false,
          message:
            "Gemini API key is missing. Please check your .env.local file.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Gemini API key loaded: true"
    );

    // ========================================================
    // 2. CHECK LOGIN
    // ========================================================

    const student =
      await getAuthenticatedStudent();

    if (!student) {
      return Response.json(
        {
          success: false,
          message:
            "You are not logged in.",
        },
        { status: 401 }
      );
    }

    console.log(
      "Authenticated student:",
      student.studentId
    );

    // ========================================================
    // 3. READ REQUEST BODY
    // ========================================================

    let body;

    try {
      body = await request.json();
    } catch (error) {
      console.error(
        "Unable to read request body:",
        error
      );

      return Response.json(
        {
          success: false,
          message:
            "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const {
      career,
      overallLevel,
      percentage,
      skills,
    } = body;

    console.log(
      "Career:",
      career
    );

    console.log(
      "Overall level:",
      overallLevel
    );

    console.log(
      "Percentage:",
      percentage
    );

    console.log(
      "Number of skills:",
      Array.isArray(skills)
        ? skills.length
        : 0
    );

    // ========================================================
    // 4. VALIDATE CAREER
    // ========================================================

    if (!career) {
      return Response.json(
        {
          success: false,
          message:
            "Career information is missing.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // 5. VALIDATE SKILLS
    // ========================================================

    if (
      !Array.isArray(skills) ||
      skills.length === 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Skill assessment data is missing.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // 6. PREPARE SKILL SUMMARY
    // ========================================================

    const skillSummary = skills
      .map((skill, index) => {
        return `
Skill ${index + 1}:
Name: ${skill.skill_name ?? "Unknown"}
Assessment Score: ${skill.percentage ?? 0}%
Current Level: ${skill.level ?? "Not available"}
Correct Answers: ${skill.correct_answers ?? 0}
Total Questions: ${skill.total_questions ?? 0}
`;
      })
      .join("\n");

    console.log(
      "Skill information prepared."
    );

    // ========================================================
    // 7. CREATE GEMINI PROMPT
    // ========================================================

    const prompt = `
You are an expert educational learning-roadmap
designer for a student skill-development platform
called SkillNet.

Create a personalized learning roadmap for this student.

The roadmap MUST be based ONLY on:

1. The student's selected career direction
2. Overall assessment result
3. Individual skill assessment results

IMPORTANT RULES:

- Start from the student's current skill level.
- Prioritize weak but important skills.
- Do not assume advanced knowledge.
- Do not recommend unrelated skills.
- Keep the roadmap practical and achievable.
- Include learning activities.
- Include practice activities.
- Include practical projects.
- Projects should gradually increase in difficulty.
- Each phase must logically connect to the next.
- The roadmap should help the student become industry-ready.
- Do NOT recommend jobs.
- Do NOT recommend job vacancies.
- Do NOT create a generic career roadmap.
- Focus on learning, skill development, practice,
  competency development and projects.

STUDENT INFORMATION
===================

Student ID:
${student.studentId}

Selected Career Direction:
${career}

Overall Assessment Level:
${overallLevel || "Not available"}

Overall Assessment Score:
${percentage ?? "Not available"}%

SKILL-WISE ASSESSMENT
=====================

${skillSummary}

ROADMAP REQUIREMENTS
====================

Create 4 to 6 learning phases.

Each phase must contain:

- Phase number
- Title
- Duration
- Learning goal
- Relevant skills
- Reason for learning each skill
- Current level
- Target level
- Practical activities
- One practical project

The first phase should address the most important
foundational weaknesses.

Later phases should gradually introduce
intermediate and advanced concepts.

Projects must match the student's current ability
and become more challenging over time.

OUTPUT FORMAT
=============

Return ONLY valid JSON.

Do not use Markdown.
Do not use a code block.
Do not write anything before or after the JSON.

Use exactly this structure:

{
  "career": "selected career",
  "summary": "short personalized explanation",
  "estimated_duration": "example: 12 weeks",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title",
      "duration": "example: 2 weeks",
      "goal": "what the student should achieve",
      "skills": [
        {
          "name": "skill name",
          "reason": "why this skill is important",
          "current_level": "student current level",
          "target_level": "target level"
        }
      ],
      "activities": [
        "practical activity 1",
        "practical activity 2",
        "practical activity 3"
      ],
      "project": {
        "title": "project title",
        "description": "project description"
      }
    }
  ],
  "priority_skills": [
    {
      "name": "skill name",
      "reason": "why this skill should be prioritized"
    }
  ],
  "industry_readiness": {
    "current_status": "short assessment of current readiness",
    "next_focus": "what the student should focus on next"
  }
}
`;

    console.log(
      "Gemini prompt prepared."
    );

    // ========================================================
    // 8. TRY GEMINI MODELS
    // ========================================================

    let text = null;
    let successfulModel = null;
    let lastGeminiError = null;

    for (const model of MODELS) {
      try {
        console.log(
          "=========================================="
        );

        console.log(
          `Trying Gemini model: ${model}`
        );

        console.log(
          "=========================================="
        );

        text = await generateWithRetry(
          model,
          prompt
        );

        successfulModel = model;

        console.log(
          `SUCCESS: Roadmap generated using ${model}`
        );

        break;
      } catch (error) {
        lastGeminiError = error;

        console.error(
          `Model ${model} failed.`
        );

        console.error(
          "Error:",
          error?.message || error
        );

        // Continue to next model.
      }
    }

    // ========================================================
    // 9. NO MODEL WORKED
    // ========================================================

    if (!text) {
      console.error(
        "=========================================="
      );

      console.error(
        "ALL GEMINI MODELS FAILED"
      );

      console.error(
        "=========================================="
      );

      console.error(
        lastGeminiError
      );

      const errorMessage =
        lastGeminiError?.message ||
        "Gemini is temporarily unavailable.";

      return Response.json(
        {
          success: false,
          message:
            `Gemini is temporarily unavailable. Please try again in a moment. Details: ${errorMessage}`,
        },
        { status: 503 }
      );
    }

    // ========================================================
    // 10. CLEAN RESPONSE
    // ========================================================

    const cleanedText =
      cleanJsonText(text);

    console.log(
      "Gemini response length:",
      cleanedText.length
    );

    // ========================================================
    // 11. PARSE JSON
    // ========================================================

    let roadmap;

    try {
      roadmap =
        JSON.parse(cleanedText);
    } catch (error) {
      console.error(
        "=========================================="
      );

      console.error(
        "GEMINI JSON PARSING ERROR"
      );

      console.error(
        "=========================================="
      );

      console.error(error);

      console.error(
        "Raw Gemini response:"
      );

      console.error(cleanedText);

      return Response.json(
        {
          success: false,
          message:
            "Gemini generated an invalid roadmap format. Please try again.",
        },
        { status: 500 }
      );
    }

    // ========================================================
    // 12. VALIDATE ROADMAP
    // ========================================================

    if (!validateRoadmap(roadmap)) {
      console.error(
        "Invalid roadmap structure:",
        roadmap
      );

      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an incomplete roadmap. Please try again.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Number of phases:",
      roadmap.phases.length
    );

    console.log(
      "Successful model:",
      successfulModel
    );

    // ========================================================
    // 13. SUCCESS
    // ========================================================

    console.log(
      "=========================================="
    );

    console.log(
      "ROADMAP GENERATED SUCCESSFULLY"
    );

    console.log(
      "=========================================="
    );

    return Response.json({
      success: true,

      message:
        "Personalized roadmap generated successfully.",

      model: successfulModel,

      roadmap,
    });
  } catch (error) {
    // ========================================================
    // FINAL ERROR HANDLER
    // ========================================================

    console.error(
      "=========================================="
    );

    console.error(
      "ROADMAP GENERATION ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "Error:",
      error
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to generate your personalized roadmap.",
      },
      { status: 500 }
    );
  }
}
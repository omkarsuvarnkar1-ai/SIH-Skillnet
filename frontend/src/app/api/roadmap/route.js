import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      career,
      skills,
      assessment,
    } = body;

    if (!career) {
      return Response.json(
        {
          success: false,
          message: "Career information is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(skills)) {
      return Response.json(
        {
          success: false,
          message: "Skills information is required.",
        },
        { status: 400 }
      );
    }

    if (!assessment) {
      return Response.json(
        {
          success: false,
          message: "Assessment result is required.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are the personalized learning-roadmap engine for SkillNet.

SkillNet is a student skill-development platform.

Your job is to create a realistic and personalized learning roadmap for a student based ONLY on the information provided below.

STUDENT CAREER DIRECTION:
${JSON.stringify(career, null, 2)}

STUDENT CURRENT SKILLS:
${JSON.stringify(skills, null, 2)}

STUDENT ASSESSMENT RESULT:
${JSON.stringify(assessment, null, 2)}

IMPORTANT RULES:

1. Do not assume that the student is an expert.
2. Start from the student's actual current skill levels.
3. Identify the most important skill gaps.
4. Prioritize skills that are directly useful for the selected career direction.
5. Do not overload the student with too many skills at once.
6. Create a practical progression from fundamentals to intermediate/advanced skills.
7. Include hands-on projects.
8. Projects should become gradually more difficult.
9. Do not recommend a job as the immediate next step.
10. The purpose of this roadmap is SKILL DEVELOPMENT and INDUSTRY READINESS.
11. Keep the roadmap achievable for a college student.
12. Explain why each major skill is important.
13. If a skill is already strong, do not make the student relearn it from zero.
14. Focus more attention on weaker skills.
15. Do not invent assessment scores that were not provided.
16. Do not use vague recommendations such as "learn more programming".
17. Give specific skills, topics and projects.

Create a roadmap divided into phases.

Each phase should contain:
- phase number
- phase title
- approximate duration
- objective
- skills to learn
- topics to study
- practical project
- expected outcome

Also provide:
- current level summary
- strongest skills
- priority skill gaps
- recommended learning order
- final industry-readiness checklist

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": {
    "current_level": "",
    "strongest_skills": [],
    "priority_gaps": [],
    "learning_order": []
  },
  "phases": [
    {
      "phase_number": 1,
      "title": "",
      "duration": "",
      "objective": "",
      "skills": [],
      "topics": [],
      "project": {
        "title": "",
        "description": "",
        "difficulty": ""
      },
      "expected_outcome": ""
    }
  ],
  "industry_readiness": [
    ""
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                current_level: {
                  type: "string",
                },
                strongest_skills: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                priority_gaps: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                learning_order: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
              required: [
                "current_level",
                "strongest_skills",
                "priority_gaps",
                "learning_order",
              ],
            },

            phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_number: {
                    type: "number",
                  },
                  title: {
                    type: "string",
                  },
                  duration: {
                    type: "string",
                  },
                  objective: {
                    type: "string",
                  },
                  skills: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  topics: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  project: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                      },
                      description: {
                        type: "string",
                      },
                      difficulty: {
                        type: "string",
                      },
                    },
                    required: [
                      "title",
                      "description",
                      "difficulty",
                    ],
                  },
                  expected_outcome: {
                    type: "string",
                  },
                },
                required: [
                  "phase_number",
                  "title",
                  "duration",
                  "objective",
                  "skills",
                  "topics",
                  "project",
                  "expected_outcome",
                ],
              },
            },

            industry_readiness: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },

          required: [
            "summary",
            "phases",
            "industry_readiness",
          ],
        },
      },
    });

    const roadmapText = response.text;

    if (!roadmapText) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let roadmap;

    try {
      roadmap = JSON.parse(roadmapText);
    } catch (parseError) {
      console.error(
        "Gemini JSON parsing error:",
        parseError
      );

      console.error(
        "Gemini response:",
        roadmapText
      );

      return Response.json(
        {
          success: false,
          message:
            "Gemini returned an invalid roadmap format.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error(
      "Roadmap generation error:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to generate roadmap.",
      },
      { status: 500 }
    );
  }
}
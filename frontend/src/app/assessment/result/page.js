"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./assessment-result.css";

/* =========================================================
   ICONS
========================================================= */

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
      <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5" />
      <path d="m9 12 2 2 4-4" />
      <path d="M9 17h6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h8v4.5c0 3-1.8 5.5-4 5.5S8 11.5 8 8.5V4Z" />
      <path d="M8 6H4v1c0 2.8 1.7 4.5 4.5 4.9M16 6h4v1c0 2.8-1.7 4.5-4.5 4.9" />
      <path d="M12 14v4M8 21h8M9 18h6" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

function RoadmapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <path d="M7.5 5h5a4 4 0 0 1 4 4v.5" />
      <path d="M16.5 12H11a4 4 0 0 0-4 4v.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      <path d="M8 7h7M8 10h5" />
    </svg>
  );
}

function ProjectIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h6l2 2h8v10H4V7Z" />
      <path d="M8 13h8M8 16h5" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 5c4-3 7 3 14 0v9c-7 3-10-3-14 0" />
    </svg>
  );
}

/* =========================================================
   SKILL ICON
========================================================= */

function SkillIcon({ name }) {
  const value = String(name || "").toLowerCase();

  if (value.includes("python")) {
    return (
      <span className="skill-brand python-brand">
        <span className="python-top">●</span>
        <span className="python-bottom">●</span>
      </span>
    );
  }

  if (value.includes("javascript") || value === "js") {
    return (
      <span className="skill-brand javascript-brand">
        JS
      </span>
    );
  }

  if (value.includes("html") || value.includes("css")) {
    return (
      <span className="skill-brand html-brand">
        <span>5</span>
        <small>3</small>
      </span>
    );
  }

  if (
    value.includes("sql") ||
    value.includes("database")
  ) {
    return (
      <span className="skill-brand sql-brand">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (
    value.includes("git") ||
    value.includes("github")
  ) {
    return (
      <span className="skill-brand git-brand">
        ◆
      </span>
    );
  }

  if (value.includes("linux")) {
    return (
      <span className="skill-brand linux-brand">
        ●
      </span>
    );
  }

  if (
    value.includes("data structure") ||
    value.includes("algorithm") ||
    value.includes("dsa")
  ) {
    return (
      <span className="skill-brand dsa-brand">
        <span />
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (value.includes("react")) {
    return (
      <span className="skill-brand react-brand">
        ◉
      </span>
    );
  }

  if (value.includes("java")) {
    return (
      <span className="skill-brand java-brand">
        ☕
      </span>
    );
  }

  if (
    value.includes("communication") ||
    value.includes("english")
  ) {
    return (
      <span className="skill-brand communication-brand">
        Aa
      </span>
    );
  }

  if (
    value.includes("design") ||
    value.includes("ui") ||
    value.includes("ux")
  ) {
    return (
      <span className="skill-brand design-brand">
        ✦
      </span>
    );
  }

  return (
    <span className="skill-brand default-brand">
      <TargetIcon />
    </span>
  );
}

/* =========================================================
   LEVEL HELPERS
========================================================= */

function getLevelClass(level) {
  const value = String(level || "").toLowerCase();

  if (value.includes("advanced")) {
    return "advanced";
  }

  if (value.includes("intermediate")) {
    return "intermediate";
  }

  if (value.includes("beginner")) {
    return "beginner";
  }

  if (value.includes("not familiar")) {
    return "not-familiar";
  }

  return "default";
}

/* =========================================================
   SCORE MESSAGE
========================================================= */

function getScoreMessage(percentage) {
  const score = Number(percentage) || 0;

  if (score >= 85) {
    return {
      title: "Excellent performance!",
      text:
        "You have demonstrated a strong understanding of your assessed skills.",
    };
  }

  if (score >= 70) {
    return {
      title: "Great progress!",
      text:
        "You have a solid foundation and are ready to strengthen your skills further.",
    };
  }

  if (score >= 50) {
    return {
      title: "Good starting point!",
      text:
        "Your results show areas of strength as well as opportunities to improve.",
    };
  }

  return {
    title: "Your learning journey starts here.",
    text:
      "We'll use your results to build a personalized path around the skills you need.",
  };
}

/* =========================================================
   CAREER NAME HELPER
========================================================= */

function getCareerName(result) {
  if (!result) {
    return "your selected career";
  }

  if (typeof result.career === "string") {
    return result.career;
  }

  if (result.career?.role_name) {
    return result.career.role_name;
  }

  if (result.career?.career_name) {
    return result.career.career_name;
  }

  if (result.role_name) {
    return result.role_name;
  }

  if (result.career_name) {
    return result.career_name;
  }

  if (result.selected_career) {
    return result.selected_career;
  }

  return "your selected career";
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AssessmentResultPage() {
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     ROADMAP STATE
  ======================================================= */

  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] =
    useState(false);
  const [roadmapError, setRoadmapError] =
    useState("");

  /* =======================================================
     LOAD ASSESSMENT RESULT
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadResult() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/assessment/result",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log(
          "Assessment result API response:",
          data
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok || !data.success) {
          if (!mounted) return;

          setResult(null);

          setErrorMessage(
            data.message ||
              "We could not find your assessment result."
          );

          return;
        }

        if (!mounted) return;

        setResult(data.result);
      } catch (error) {
        console.error(
          "Unable to load assessment result:",
          error
        );

        if (!mounted) return;

        setResult(null);

        setErrorMessage(
          "Unable to load your assessment result. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     GENERATE ROADMAP
  ======================================================= */

  useEffect(() => {
    if (!result) {
      return;
    }

    let cancelled = false;

    async function generateRoadmap() {
      try {
        setRoadmapLoading(true);
        setRoadmapError("");
        setRoadmap(null);

        const career = getCareerName(result);

        const skills = Array.isArray(result.skills)
          ? result.skills
          : [];

        if (!career || skills.length === 0) {
          setRoadmapError(
            "There is not enough assessment information to create your roadmap."
          );

          setRoadmapLoading(false);

          return;
        }

        console.log(
          "Sending assessment data to Gemini roadmap API..."
        );

        const response = await fetch(
          "/api/roadmap/generate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              career,

              overallLevel:
                result.overall_level ||
                "Not available",

              percentage:
                result.percentage ?? 0,

              skills,
            }),
          }
        );

        const data = await response.json();

        console.log(
          "Roadmap API response:",
          data
        );

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to generate your personalized roadmap."
          );
        }

        if (!data.roadmap) {
          throw new Error(
            "Gemini did not return a roadmap."
          );
        }

        if (!cancelled) {
          setRoadmap(data.roadmap);
        }
      } catch (error) {
        console.error(
          "Roadmap generation error:",
          error
        );

        if (!cancelled) {
          setRoadmapError(
            error.message ||
              "Unable to generate your personalized roadmap."
          );
        }
      } finally {
        if (!cancelled) {
          setRoadmapLoading(false);
        }
      }
    }

    generateRoadmap();

    return () => {
      cancelled = true;
    };
  }, [result, router]);

  /* =======================================================
     NORMALIZE SKILLS
  ======================================================= */

  const skills = useMemo(() => {
    if (
      !result ||
      !Array.isArray(result.skills)
    ) {
      return [];
    }

    return result.skills;
  }, [result]);

  /* =======================================================
     SCORE MESSAGE
  ======================================================= */

  const scoreMessage = useMemo(() => {
    return getScoreMessage(
      result?.percentage
    );
  }, [result]);

  /* =======================================================
     SCROLL TO ROADMAP
  ======================================================= */

  const handleViewRoadmap = () => {
    /*
      IMPORTANT:

      We scroll to the actual generated roadmap content,
      NOT the outer roadmap section.

      This prevents the page from stopping at the
      "Build your personalized roadmap" black area.
    */

    const roadmapContent =
      document.getElementById(
        "roadmap-content"
      );

    const roadmapLoadingElement =
      document.getElementById(
        "roadmap-loading"
      );

    const roadmapErrorElement =
      document.getElementById(
        "roadmap-error"
      );

    const target =
      roadmapContent ||
      roadmapLoadingElement ||
      roadmapErrorElement;

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =======================================================
     RETRY ROADMAP
  ======================================================= */

  const handleRetryRoadmap = () => {
    if (!result) {
      return;
    }

    setRoadmapError("");
    setRoadmap(null);

    /*
      Updating the result object creates a fresh reference,
      which triggers the roadmap generation useEffect.
    */

    setResult({
      ...result,
    });
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="ar-page ar-loading-page">
        <div className="ar-background-grid" />

        <div className="ar-glow ar-glow-one" />

        <div className="ar-glow ar-glow-two" />

        <div className="ar-glow ar-glow-three" />

        <div className="ar-loader">
          <div className="ar-loader-ring" />

          <p>
            Preparing your assessment result...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     RESULT NOT FOUND
  ======================================================= */

  if (!result) {
    return (
      <main className="ar-page ar-error-page">
        <div className="ar-background-grid" />

        <div className="ar-glow ar-glow-one" />

        <div className="ar-glow ar-glow-two" />

        <div className="ar-not-found-card">
          <div className="ar-not-found-icon">
            <ClipboardIcon />
          </div>

          <span className="ar-small-label">
            ASSESSMENT RESULT
          </span>

          <h1>
            Assessment Result Not Found
          </h1>

          <p>
            {errorMessage ||
              "We could not find your assessment result."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/skill-assessment"
              )
            }
            className="ar-primary-button"
          >
            <span>
              Back to Assessment
            </span>

            <ArrowIcon />
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="ar-page">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="ar-background-grid"
        aria-hidden="true"
      />

      <div
        className="ar-stars"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div
        className="ar-orbit orbit-a"
        aria-hidden="true"
      />

      <div
        className="ar-orbit orbit-b"
        aria-hidden="true"
      />

      <div
        className="ar-glow ar-glow-one"
        aria-hidden="true"
      />

      <div
        className="ar-glow ar-glow-two"
        aria-hidden="true"
      />

      <div
        className="ar-glow ar-glow-three"
        aria-hidden="true"
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ar-header">
        <div className="ar-header-inner">

          <button
            type="button"
            className="ar-logo"
            onClick={() =>
              router.push("/dashboard")
            }
            aria-label="Go to SkillNet dashboard"
          >
            <span>Skill</span>
            <strong>Net</strong>
          </button>

          <div className="ar-header-progress">

            <span className="ar-progress-label">
              YOUR SKILL JOURNEY
            </span>

            <div className="ar-progress-track">
              <div className="ar-progress-fill" />

              <span className="ar-progress-node node-one" />

              <span className="ar-progress-node node-two" />

              <span className="ar-progress-node node-three" />

              <span className="ar-progress-node node-four" />
            </div>

            <strong>
              4 of 4
            </strong>
          </div>

          <div className="ar-header-badge">
            <span className="ar-live-dot" />
            Assessment Result
          </div>

        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="ar-content">

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="ar-title-section">

          <div className="ar-eyebrow">
            <span className="ar-eyebrow-icon">
              <SparkleIcon />
            </span>

            ASSESSMENT COMPLETED
          </div>

          <h1>
            Your skill assessment{" "}
            <span>
              result.
            </span>
          </h1>

          <p>
            Here's a clear picture of your current
            understanding. We'll use these results to
            shape your personalized learning roadmap.
          </p>

        </div>

        {/* =================================================
            OVERALL SCORE
        ================================================= */}

        <section className="ar-score-card">

          <div className="ar-score-top">

            <div className="ar-score-heading">

              <div className="ar-score-icon">
                <TrophyIcon />
              </div>

              <div>

                <span className="ar-card-label">
                  OVERALL PERFORMANCE
                </span>

                <h2>
                  {scoreMessage.title}
                </h2>

                <p>
                  {scoreMessage.text}
                </p>

              </div>

            </div>

            <div className="ar-score-circle">

              <div className="ar-score-circle-inner">

                <strong>
                  {result.percentage}%
                </strong>

                <span>
                  SCORE
                </span>

              </div>

            </div>

          </div>

          <div className="ar-score-divider" />

          <div className="ar-score-bottom">

            <div className="ar-level-block">

              <span>
                OVERALL LEVEL
              </span>

              <div
                className={`ar-level-pill ${getLevelClass(
                  result.overall_level
                )}`}
              >
                {result.overall_level}
              </div>

            </div>

            <div className="ar-stat">

              <strong>
                {result.total_questions}
              </strong>

              <span>
                Questions
              </span>

            </div>

            <div className="ar-stat stat-success">

              <strong>
                {result.correct_answers}
              </strong>

              <span>
                Correct
              </span>

            </div>

            <div className="ar-stat stat-error">

              <strong>
                {result.incorrect_answers}
              </strong>

              <span>
                Incorrect
              </span>

            </div>

          </div>

        </section>

        {/* =================================================
            SKILL PERFORMANCE
        ================================================= */}

        <section className="ar-skills-section">

          <div className="ar-section-heading">

            <div>

              <span className="ar-card-label">
                PERFORMANCE BREAKDOWN
              </span>

              <h2>
                Skill-wise performance
              </h2>

              <p>
                Your results across the skills assessed
                for your selected career path.
              </p>

            </div>

            <div className="ar-skill-count">

              <strong>
                {skills.length}
              </strong>

              <span>
                Skills assessed
              </span>

            </div>

          </div>

          {skills.length > 0 ? (

            <div className="ar-skills-grid">

              {skills.map(
                (skill, index) => {

                  const percentage =
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Number(
                          skill.percentage
                        ) || 0
                      )
                    );

                  return (
                    <article
                      className="ar-skill-card"
                      key={
                        skill.skill_name ||
                        `skill-${index}`
                      }
                      style={{
                        "--skill-delay": `${index * 70}ms`,
                      }}
                    >

                      <div className="ar-skill-card-top">

                        <div className="ar-skill-info">

                          <div className="ar-skill-icon">

                            <SkillIcon
                              name={
                                skill.skill_name
                              }
                            />

                          </div>

                          <div>

                            <h3>
                              {skill.skill_name}
                            </h3>

                            <p>
                              {skill.correct_answers}{" "}
                              of{" "}
                              {skill.total_questions}{" "}
                              correct
                            </p>

                          </div>

                        </div>

                        <div className="ar-skill-score">

                          <strong>
                            {skill.percentage}%
                          </strong>

                          <span
                            className={`ar-mini-level ${getLevelClass(
                              skill.level
                            )}`}
                          >
                            {skill.level}
                          </span>

                        </div>

                      </div>

                      <div className="ar-skill-progress">

                        <div className="ar-skill-progress-track">

                          <div
                            className={`ar-skill-progress-fill ${getLevelClass(
                              skill.level
                            )}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <span>
                          {percentage}%
                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="ar-empty-skills">

              <TargetIcon />

              <h3>
                No skill breakdown available
              </h3>

              <p>
                Your assessment was completed, but
                individual skill results are not
                available.
              </p>

            </div>

          )}

        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <div className="ar-success-card">

          <div className="ar-success-icon">
            <CheckIcon />
          </div>

          <div>

            <strong>
              Your assessment has been completed
              successfully!
            </strong>

            <p>
              These results will help SkillNet
              personalize your learning journey.
            </p>

          </div>

        </div>

        {/* =================================================
            ROADMAP SECTION
        ================================================= */}

        <section
          id="personalized-roadmap"
          className="ar-roadmap-section"
        >

          {/* =================================================
              ROADMAP HERO
          ================================================= */}

          <div className="ar-roadmap-header">

            <div className="ar-roadmap-eyebrow">

              <span className="ar-roadmap-eyebrow-icon">
                <SparkleIcon />
              </span>

              AI-POWERED PERSONALIZATION

            </div>

            <h2>
              Your personalized learning roadmap
            </h2>

            <p>
              SkillNet has analyzed your assessment
              results and is creating a learning path
              specifically around your current abilities,
              skill gaps and selected career direction.
            </p>

            <div className="ar-roadmap-status-row">

              <div className="ar-roadmap-status-item">
                <span className="ar-roadmap-status-dot" />
                Assessment analyzed
              </div>

              <div className="ar-roadmap-status-line" />

              <div className="ar-roadmap-status-item">
                <span
                  className={`ar-roadmap-status-dot ${
                    roadmap
                      ? "completed"
                      : ""
                  }`}
                />
                Skills mapped
              </div>

              <div className="ar-roadmap-status-line" />

              <div className="ar-roadmap-status-item">
                <span
                  className={`ar-roadmap-status-dot ${
                    roadmap
                      ? "completed"
                      : ""
                  }`}
                />
                Roadmap created
              </div>

            </div>

          </div>

          {/* =================================================
              LOADING STATE
          ================================================= */}

          {roadmapLoading && (

            <div
              id="roadmap-loading"
              className="ar-roadmap-loading"
            >

              <div className="ar-roadmap-loader">
                <SparkleIcon />
              </div>

              <div>

                <span className="ar-roadmap-loading-label">
                  AI ROADMAP GENERATION
                </span>

                <strong>
                  Gemini is building your roadmap...
                </strong>

                <p>
                  Analyzing your current skill levels,
                  identifying priority areas and
                  designing practical learning phases.
                </p>

              </div>

              <div className="ar-roadmap-loading-bar">
                <div />
              </div>

            </div>

          )}

          {/* =================================================
              ERROR STATE
          ================================================= */}

          {!roadmapLoading &&
            roadmapError && (

              <div
                id="roadmap-error"
                className="ar-roadmap-error"
              >

                <div className="ar-roadmap-error-icon">
                  !
                </div>

                <div>

                  <span className="ar-roadmap-loading-label">
                    ROADMAP GENERATION
                  </span>

                  <strong>
                    We couldn't create your roadmap
                  </strong>

                  <p>
                    {roadmapError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleRetryRoadmap
                    }
                    className="ar-roadmap-retry-button"
                  >
                    Try Again
                    <ArrowIcon />
                  </button>

                </div>

              </div>

            )}

          {/* =================================================
              ACTUAL GENERATED ROADMAP
          ================================================= */}

          {!roadmapLoading &&
            !roadmapError &&
            roadmap && (

              <div
                id="roadmap-content"
                className="ar-roadmap-content"
              >

                {/* =================================================
                    ROADMAP INTRO
                ================================================= */}

                <div className="ar-roadmap-intro">

                  <div className="ar-roadmap-intro-icon">
                    <RoadmapIcon />
                  </div>

                  <div className="ar-roadmap-intro-main">

                    <span className="ar-card-label">
                      YOUR PERSONALIZED LEARNING PATH
                    </span>

                    <h3>
                      {roadmap.career ||
                        getCareerName(result)}
                    </h3>

                    <p>
                      {roadmap.summary}
                    </p>

                  </div>

                  {roadmap.estimated_duration && (

                    <div className="ar-roadmap-duration">

                      <span>
                        ESTIMATED DURATION
                      </span>

                      <strong>
                        {roadmap.estimated_duration}
                      </strong>

                    </div>

                  )}

                </div>

                {/* =================================================
                    ROADMAP QUICK STATS
                ================================================= */}

                <div className="ar-roadmap-stats">

                  <div className="ar-roadmap-stat">

                    <div className="ar-roadmap-stat-icon">
                      <RoadmapIcon />
                    </div>

                    <div>
                      <strong>
                        {Array.isArray(
                          roadmap.phases
                        )
                          ? roadmap.phases.length
                          : 0}
                      </strong>

                      <span>
                        Learning phases
                      </span>
                    </div>

                  </div>

                  <div className="ar-roadmap-stat">

                    <div className="ar-roadmap-stat-icon">
                      <TargetIcon />
                    </div>

                    <div>
                      <strong>
                        {Array.isArray(
                          roadmap.priority_skills
                        )
                          ? roadmap.priority_skills.length
                          : 0}
                      </strong>

                      <span>
                        Priority skills
                      </span>
                    </div>

                  </div>

                  <div className="ar-roadmap-stat">

                    <div className="ar-roadmap-stat-icon">
                      <ProjectIcon />
                    </div>

                    <div>

                      <strong>
                        Practical
                      </strong>

                      <span>
                        Project-based learning
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    PRIORITY SKILLS
                ================================================= */}

                {Array.isArray(
                  roadmap.priority_skills
                ) &&
                  roadmap.priority_skills.length >
                    0 && (

                    <div className="ar-priority-card">

                      <div className="ar-roadmap-section-title">

                        <span>
                          PRIORITY SKILLS
                        </span>

                        <h3>
                          Focus on these first
                        </h3>

                        <p>
                          These areas have been
                          identified as important
                          priorities based on your
                          assessment.
                        </p>

                      </div>

                      <div className="ar-priority-list">

                        {roadmap.priority_skills.map(
                          (skill, index) => (

                            <div
                              className="ar-priority-item"
                              key={
                                skill.name ||
                                `priority-${index}`
                              }
                            >

                              <div className="ar-priority-number">
                                {index + 1}
                              </div>

                              <div className="ar-priority-content">

                                <strong>
                                  {skill.name}
                                </strong>

                                <p>
                                  {skill.reason}
                                </p>

                              </div>

                              <div className="ar-priority-arrow">
                                <ArrowIcon />
                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* =================================================
                    LEARNING PHASES
                ================================================= */}

                {Array.isArray(
                  roadmap.phases
                ) &&
                  roadmap.phases.length > 0 && (

                    <div className="ar-phases">

                      <div className="ar-roadmap-section-title">

                        <span>
                          LEARNING ROADMAP
                        </span>

                        <h3>
                          Your path, step by step
                        </h3>

                        <p>
                          Follow these phases in order.
                          Each phase builds on the skills
                          developed in the previous one.
                        </p>

                      </div>

                      <div className="ar-phase-list">

                        {roadmap.phases.map(
                          (phase, index) => (

                            <article
                              className="ar-phase-card"
                              key={
                                phase.phase ||
                                index
                              }
                            >

                              {/* PHASE NUMBER */}

                              <div className="ar-phase-number">
                                {phase.phase ||
                                  index + 1}
                              </div>

                              <div className="ar-phase-body">

                                {/* PHASE HEADER */}

                                <div className="ar-phase-top">

                                  <div>

                                    <span className="ar-phase-label">
                                      PHASE{" "}
                                      {phase.phase ||
                                        index + 1}
                                    </span>

                                    <h4>
                                      {phase.title}
                                    </h4>

                                  </div>

                                  {phase.duration && (

                                    <span className="ar-phase-duration">
                                      {phase.duration}
                                    </span>

                                  )}

                                </div>

                                {/* GOAL */}

                                {phase.goal && (

                                  <div className="ar-phase-goal">

                                    <div className="ar-phase-goal-icon">
                                      <FlagIcon />
                                    </div>

                                    <div>

                                      <strong>
                                        Phase Goal
                                      </strong>

                                      <p>
                                        {phase.goal}
                                      </p>

                                    </div>

                                  </div>

                                )}

                                {/* SKILLS */}

                                {Array.isArray(
                                  phase.skills
                                ) &&
                                  phase.skills.length >
                                    0 && (

                                    <div className="ar-phase-skills">

                                      <span className="ar-roadmap-mini-label">
                                        SKILLS TO DEVELOP
                                      </span>

                                      <div className="ar-phase-skill-list">

                                        {phase.skills.map(
                                          (
                                            skill,
                                            skillIndex
                                          ) => (

                                            <div
                                              className="ar-phase-skill"
                                              key={
                                                skill.name ||
                                                skillIndex
                                              }
                                            >

                                              <div className="ar-phase-skill-icon">

                                                <SkillIcon
                                                  name={
                                                    skill.name
                                                  }
                                                />

                                              </div>

                                              <div>

                                                <strong>
                                                  {
                                                    skill.name
                                                  }
                                                </strong>

                                                <p>
                                                  {
                                                    skill.reason
                                                  }
                                                </p>

                                                <div className="ar-skill-level-transition">

                                                  <span>
                                                    {skill.current_level ||
                                                      "Current level"}
                                                  </span>

                                                  <span>
                                                    →
                                                  </span>

                                                  <span>
                                                    {skill.target_level ||
                                                      "Target level"}
                                                  </span>

                                                </div>

                                              </div>

                                            </div>

                                          )
                                        )}

                                      </div>

                                    </div>

                                  )}

                                {/* ACTIVITIES */}

                                {Array.isArray(
                                  phase.activities
                                ) &&
                                  phase.activities.length >
                                    0 && (

                                    <div className="ar-phase-activities">

                                      <span className="ar-roadmap-mini-label">
                                        PRACTICAL ACTIVITIES
                                      </span>

                                      <ul>

                                        {phase.activities.map(
                                          (
                                            activity,
                                            activityIndex
                                          ) => (

                                            <li
                                              key={
                                                activityIndex
                                              }
                                            >

                                              <span>
                                                ✓
                                              </span>

                                              {activity}

                                            </li>

                                          )
                                        )}

                                      </ul>

                                    </div>

                                  )}

                                {/* PROJECT */}

                                {phase.project && (

                                  <div className="ar-phase-project">

                                    <div className="ar-project-icon">
                                      <ProjectIcon />
                                    </div>

                                    <div>

                                      <span>
                                        PRACTICAL PROJECT
                                      </span>

                                      <strong>
                                        {
                                          phase
                                            .project
                                            .title
                                        }
                                      </strong>

                                      <p>
                                        {
                                          phase
                                            .project
                                            .description
                                        }
                                      </p>

                                    </div>

                                  </div>

                                )}

                              </div>

                            </article>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* =================================================
                    INDUSTRY READINESS
                ================================================= */}

                {roadmap.industry_readiness && (

                  <div className="ar-industry-readiness">

                    <div className="ar-industry-icon">
                      <TrophyIcon />
                    </div>

                    <div>

                      <span>
                        INDUSTRY READINESS
                      </span>

                      <h3>
                        {
                          roadmap
                            .industry_readiness
                            .current_status
                        }
                      </h3>

                      <p>

                        <strong>
                          Next focus:
                        </strong>{" "}

                        {
                          roadmap
                            .industry_readiness
                            .next_focus
                        }

                      </p>

                    </div>

                  </div>

                )}

                {/* =================================================
                    ROADMAP COMPLETE MESSAGE
                ================================================= */}

                <div className="ar-roadmap-complete">

                  <div className="ar-roadmap-complete-icon">
                    <CheckIcon />
                  </div>

                  <div>

                    <span>
                      YOUR NEXT STEP
                    </span>

                    <strong>
                      Your learning path is ready.
                    </strong>

                    <p>
                      Start with Phase 1 and
                      progress through each phase
                      at your own pace.
                    </p>

                  </div>

                </div>

              </div>

            )}

        </section>

        {/* =================================================
            ROADMAP CTA
        ================================================= */}

        <div className="ar-roadmap-cta">

          <div className="ar-roadmap-cta-icon">
            <RoadmapIcon />
          </div>

          <div className="ar-roadmap-cta-content">

            <span>
              YOUR PERSONALIZED PATH
            </span>

            <h3>
              Ready to see where your skills can take you?
            </h3>

            <p>
              Your roadmap is generated from your
              assessment results and designed around
              your current skill level.
            </p>

          </div>

          <button
            type="button"
            className="ar-roadmap-start-button"
            onClick={handleViewRoadmap}
          >

            <span>
              {roadmap
                ? "View My Roadmap"
                : "View Roadmap"}
            </span>

            <ArrowIcon />

          </button>

        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <div className="ar-actions">

          <button
            type="button"
            className="ar-back-button"
            onClick={() =>
              router.push("/skills")
            }
          >

            <BackArrowIcon />

            <span>
              Review Skills
            </span>

          </button>

          <div className="ar-personalized-note">

            <SparkleIcon />

            <span>
              Your roadmap is personalized from
              these results
            </span>

          </div>

          <button
            type="button"
            className="ar-continue-button"
            onClick={handleViewRoadmap}
          >

            <span>
              View My Roadmap
            </span>

            <ArrowIcon />

          </button>

        </div>

      </section>

      {/* =================================================
          BOTTOM DECORATION
      ================================================= */}

      <div
        className="ar-bottom-decoration"
        aria-hidden="true"
      >

        <span>
          PROFILE
        </span>

        <i />

        <span>
          CAREER
        </span>

        <i />

        <span>
          SKILLS
        </span>

        <i />

        <span className="active">
          ROADMAP
        </span>

      </div>

    </main>
  );
}
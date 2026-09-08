"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./skills.css";

const LEVELS = [
  "Not familiar",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const ICONS = {
  python: "https://cdn.simpleicons.org/python/3776AB",
  javascript: "https://cdn.simpleicons.org/javascript/F7DF1E",
  html: "https://cdn.simpleicons.org/html5/E34F26",
  css: "https://cdn.simpleicons.org/css3/1572B6",
  git: "https://cdn.simpleicons.org/git/F05032",
  github: "https://cdn.simpleicons.org/github/181717",
  linux: "https://cdn.simpleicons.org/linux/FCC624",
  react: "https://cdn.simpleicons.org/react/61DAFB",
  node: "https://cdn.simpleicons.org/nodedotjs/5FA04E",
  typescript: "https://cdn.simpleicons.org/typescript/3178C6",
  java: "https://cdn.simpleicons.org/openjdk/000000",
  cpp: "https://cdn.simpleicons.org/cplusplus/00599C",
  c: "https://cdn.simpleicons.org/c/00599C",
  docker: "https://cdn.simpleicons.org/docker/2496ED",
  kubernetes: "https://cdn.simpleicons.org/kubernetes/326CE5",
  aws: "https://cdn.simpleicons.org/amazonwebservices/232F3E",
  figma: "https://cdn.simpleicons.org/figma/F24E1E",
  sql: null,
  data: null,
};

function getSkillIcon(skillName) {
  const name = String(skillName || "")
    .toLowerCase()
    .trim();

  if (name.includes("python")) return "python";

  if (name.includes("javascript") || name === "js") {
    return "javascript";
  }

  if (name.includes("html") && name.includes("css")) {
    return "html-css";
  }

  if (name === "html") return "html";
  if (name === "css") return "css";

  if (name.includes("git")) return "git";
  if (name.includes("linux")) return "linux";

  if (name.includes("sql") || name.includes("database")) {
    return "sql";
  }

  if (name.includes("react")) return "react";
  if (name.includes("node")) return "node";
  if (name.includes("typescript")) return "typescript";
  if (name.includes("java")) return "java";

  if (name.includes("c++")) return "cpp";

  if (name === "c" || name.startsWith("c ")) {
    return "c";
  }

  if (name.includes("docker")) return "docker";
  if (name.includes("kubernetes")) return "kubernetes";
  if (name.includes("aws")) return "aws";
  if (name.includes("figma")) return "figma";

  if (
    name.includes("data") ||
    name.includes("algorithm") ||
    name.includes("structure")
  ) {
    return "data";
  }

  return "data";
}

function SimpleIcon({ type, className = "" }) {
  if (type === "sql") {
    return (
      <span
        className={`sql-icon ${className}`}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (type === "data") {
    return (
      <svg
        className={`data-icon ${className}`}
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        <circle cx="22" cy="7" r="4" />
        <circle cx="8" cy="28" r="4" />
        <circle cx="36" cy="28" r="4" />
        <circle cx="22" cy="39" r="3.5" />

        <path d="M19.8 10.5 10.8 24M24.2 10.5 33.2 24M11.5 31 19 36M32.5 31 25 36" />
      </svg>
    );
  }

  if (type === "html-css") {
    return (
      <span
        className={`html-css-icon ${className}`}
        aria-hidden="true"
      >
        <img src={ICONS.html} alt="" />
        <img src={ICONS.css} alt="" />
      </span>
    );
  }

  return (
    <img
      className={`skill-logo ${className}`}
      src={ICONS[type] || ICONS.data}
      alt=""
      loading="eager"
    />
  );
}

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 44 44"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="8"
        width="26"
        height="31"
        rx="4"
      />

      <path d="M15 8V6.5A2.5 2.5 0 0 1 17.5 4h9A2.5 2.5 0 0 1 29 6.5V8M15 18h14M15 25h5" />

      <path d="m24 25 3 3 6-7" />
    </svg>
  );
}

function Sparkle() {
  return (
    <span className="sparkle">
      ✦
    </span>
  );
}

function Arrow({ left = false }) {
  return (
    <svg
      className={left ? "arrow left" : "arrow"}
      viewBox="0 0 28 28"
      aria-hidden="true"
    >
      <path d="M4 14h19M16 7l7 7-7 7" />
    </svg>
  );
}

function LeftIllustration() {
  return (
    <div
      className="skills-illustration"
      aria-hidden="true"
    >
      <div className="illus-orbit orbit-a" />
      <div className="illus-orbit orbit-b" />
      <div className="illus-orbit orbit-c" />

      <span className="illus-star s1">
        ✦
      </span>

      <span className="illus-star s2">
        ✦
      </span>

      <span className="illus-star s3">
        •
      </span>

      <span className="illus-dot d1" />
      <span className="illus-dot d2" />
      <span className="illus-dot d3" />

      <span className="floating-symbol brain">
        ◉
      </span>

      <span className="floating-symbol code">
        &lt;/&gt;
      </span>

      <span className="floating-symbol gear">
        ⚙
      </span>

      <div className="skill-platform">
        <div className="platform-ring ring-1" />
        <div className="platform-ring ring-2" />
        <div className="platform-ring ring-3" />

        <div className="platform-base" />

        <div className="skill-cube">
          <div className="cube-top">
            ✓
          </div>

          <div className="cube-front">
            <span className="bar b1" />
            <span className="bar b2" />
            <span className="bar b3" />
          </div>

          <div className="cube-side">
            <span className="bar b4" />
            <span className="bar b5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Journey({ active = 2 }) {
  const steps = [
    "Profile",
    "Career",
    "Skills",
    "Roadmap",
  ];

  return (
    <div className="journey">
      {steps.map((step, index) => {
        const complete = index < active;
        const current = index === active;

        return (
          <div
            className="journey-step-wrap"
            key={step}
          >
            <div
              className={`journey-step ${
                complete ? "complete" : ""
              } ${current ? "current" : ""}`}
            >
              {complete
                ? "✓"
                : current
                ? "▮"
                : index === 3
                ? "⚑"
                : ""}
            </div>

            <span>
              {step}
            </span>

            {index < steps.length - 1 && (
              <i />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CurrentSkillsPage() {
  const router = useRouter();

  const [career, setCareer] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] =
    useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSkills() {
      try {
        const response = await fetch(
          "/api/current-skills",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (mounted) {
            setMessage(
              data.message ||
                "Unable to load your skills."
            );
          }

          return;
        }

        if (!mounted) return;

        setCareer(data.career || null);
        setSkills(data.skills || []);

        const previousSkills = {};

        (data.studentSkills || []).forEach(
          (skill) => {
            previousSkills[
              skill.skill_name
            ] = skill.self_level;
          }
        );

        setSelectedSkills(previousSkills);

        /*
         * If skills already exist in the database,
         * make sure the dashboard also knows that
         * Step 3 has been completed.
         */
        if (
          Array.isArray(data.studentSkills) &&
          data.studentSkills.length > 0
        ) {
          localStorage.setItem(
            "skills_completed",
            "true"
          );
        }
      } catch (error) {
        console.error(
          "Current skills loading error:",
          error
        );

        if (mounted) {
          setMessage(
            "Unable to load your skills."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  const roleName =
    career?.role_name ||
    "your selected career";

  const displayedSkills = useMemo(() => {
    return skills.map((skill) => ({
      ...skill,
      icon: getSkillIcon(
        skill.skill_name
      ),
    }));
  }, [skills]);

  function handleLevelChange(
    skillName,
    level
  ) {
    setSelectedSkills((previous) => ({
      ...previous,
      [skillName]: level,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      saving ||
      skills.length === 0
    ) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const selected = skills.map(
        (skill) => ({
          skill_name:
            skill.skill_name,

          self_level:
            selectedSkills[
              skill.skill_name
            ] || "Not familiar",
        })
      );

      const response = await fetch(
        "/api/current-skills",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            skills: selected,
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setMessage(
          data.message ||
            "Unable to save your skills."
        );

        return;
      }

      /*
       * IMPORTANT:
       * Tell the dashboard that Step 3
       * has been completed.
       */
      localStorage.setItem(
        "skills_completed",
        "true"
      );

      /*
       * Also dispatch an event so that if the
       * dashboard is listening for changes,
       * it can update immediately.
       */
      window.dispatchEvent(
        new Event("skills-completed")
      );

      setMessage(
        "Your skills have been saved successfully!"
      );

      window.setTimeout(() => {
        router.push(
          "/skill-assessment"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "Skill saving error:",
        error
      );

      setMessage(
        "Unable to save your skills."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="skills-page loading-screen">
        <div className="loader-orb" />

        <p>
          Loading your career
          skills...
        </p>
      </main>
    );
  }

  if (career?.career_uncertain) {
    return (
      <main className="skills-page">
        <div className="page-grid" />

        <header className="topbar">
          <button
            className="brand"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            type="button"
          >
            <span>
              Skill
            </span>

            <b>
              Net
            </b>
          </button>

          <div className="top-progress">
            <span>
              YOUR SKILL JOURNEY
            </span>

            <div>
              <i
                style={{
                  width: "75%",
                }}
              />
            </div>

            <strong>
              3 of 4
            </strong>
          </div>

          <div className="top-status">
            <em />
            Skills Assessment
          </div>
        </header>

        <section className="uncertain-box">
          <div className="uncertain-icon">
            <Sparkle />
          </div>

          <h1>
            Let&apos;s discover your
            career direction
          </h1>

          <p>
            Since you haven&apos;t
            selected a specific
            career yet, SkillNet
            will help you explore
            suitable career paths
            based on your education,
            interests and existing
            skills.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/career-discovery"
              )
            }
          >
            Discover Career Paths
            <Arrow />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="skills-page">
      <div
        className="page-grid"
        aria-hidden="true"
      />

      <div
        className="page-glow glow-left"
        aria-hidden="true"
      />

      <div
        className="page-glow glow-right"
        aria-hidden="true"
      />

      <header className="topbar">
        <button
          className="brand"
          onClick={() =>
            router.push(
              "/dashboard"
            )
          }
          type="button"
          aria-label="SkillNet dashboard"
        >
          <span>
            Skill
          </span>

          <b>
            Net
          </b>
        </button>

        <div className="top-progress">
          <span>
            YOUR SKILL JOURNEY
          </span>

          <div>
            <i />
          </div>

          <strong>
            3 of 4
          </strong>
        </div>

        <div className="top-status">
          <em />
          Skills Assessment
        </div>
      </header>

      <div className="skills-layout">
        <aside className="left-panel">
          <div className="step-pill">
            <Sparkle />
            STEP 3 OF YOUR SKILL
            JOURNEY
          </div>

          <h1>
            Let&apos;s assess your
            <br />

            <span>
              current skills.
            </span>
          </h1>

          <p className="left-copy">
            Help us understand
            your current level in
            these skills. This will
            help us create a
            personalized learning
            roadmap just for you.
          </p>

          <LeftIllustration />

          <Journey active={2} />
        </aside>

        <section className="right-panel">
          <form
            onSubmit={handleSubmit}
          >
            <div className="assessment-card">
              <div className="assessment-heading">
                <div className="clipboard">
                  <ClipboardIcon />
                </div>

                <div>
                  <h2>
                    Rate your current
                    skill level
                  </h2>

                  <p>
                    Based on your
                    selected career path
                  </p>
                </div>
              </div>

              <div className="career-banner">
                Career Path:

                <strong>
                  {roleName}
                </strong>
              </div>

              <div className="skill-label">
                SKILL
              </div>

              <div className="skills-list">
                {displayedSkills.length ===
                0 ? (
                  <div className="empty-state">
                    No skills are
                    currently available
                    for this career role.
                  </div>
                ) : (
                  displayedSkills.map(
                    (skill) => {
                      const currentLevel =
                        selectedSkills[
                          skill.skill_name
                        ];

                      return (
                        <div
                          className="skill-row"
                          key={
                            skill.career_role_skill_id ||
                            skill.skill_name
                          }
                        >
                          <div className="skill-name">
                            <div className="skill-icon-box">
                              <SimpleIcon
                                type={
                                  skill.icon
                                }
                              />
                            </div>

                            <span>
                              {
                                skill.skill_name
                              }
                            </span>
                          </div>

                          <div className="level-options">
                            {LEVELS.map(
                              (level) => {
                                const selected =
                                  currentLevel ===
                                  level;

                                return (
                                  <label
                                    className={`level-option ${
                                      selected
                                        ? "selected"
                                        : ""
                                    }`}
                                    key={
                                      level
                                    }
                                  >
                                    <input
                                      type="radio"
                                      name={`skill-${
                                        skill.career_role_skill_id ||
                                        skill.skill_name
                                      }`}
                                      value={
                                        level
                                      }
                                      checked={
                                        selected
                                      }
                                      onChange={() =>
                                        handleLevelChange(
                                          skill.skill_name,
                                          level
                                        )
                                      }
                                    />

                                    <span>
                                      {
                                        level
                                      }
                                    </span>

                                    {selected && (
                                      <b className="level-check">
                                        ✓
                                      </b>
                                    )}
                                  </label>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              {message && (
                <div
                  className={`success-message ${
                    message.includes(
                      "successfully"
                    )
                      ? "is-success"
                      : "is-error"
                  }`}
                  role="alert"
                >
                  <span>
                    {message.includes(
                      "successfully"
                    )
                      ? "✓"
                      : "!"}
                  </span>

                  {message}
                </div>
              )}
            </div>

            {skills.length > 0 && (
              <div className="action-row">
                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    router.push(
                      "/career-selection"
                    )
                  }
                >
                  <Arrow left />

                  <span>
                    Back
                  </span>
                </button>

                <div className="action-note">
                  <Sparkle />

                  <span>
                    This helps us build
                    your personalized
                    roadmap
                  </span>
                </div>

                <button
                  type="submit"
                  className="continue-button"
                  disabled={saving}
                >
                  <span>
                    {saving
                      ? "Saving..."
                      : "Continue to Assessment"}
                  </span>

                  {!saving && (
                    <Arrow />
                  )}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
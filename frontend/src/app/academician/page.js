"use client";

import { useRouter } from "next/navigation";
import "./academician.css";

export default function AcademicianPage() {
  const router = useRouter();

  const students = [
    {
      name: "Aarav Sharma",
      course: "Computer Engineering",
      year: "2nd Year",
      readiness: 82,
      status: "Industry Ready",
    },
    {
      name: "Isha Patel",
      course: "Information Technology",
      year: "3rd Year",
      readiness: 68,
      status: "Needs Development",
    },
    {
      name: "Rohan Mehta",
      course: "AI & Data Science",
      year: "2nd Year",
      readiness: 54,
      status: "Skill Gap",
    },
    {
      name: "Ananya Joshi",
      course: "Computer Engineering",
      year: "3rd Year",
      readiness: 91,
      status: "Industry Ready",
    },
  ];

  const skillGaps = [
    { skill: "Cloud Computing", percentage: 34 },
    { skill: "Communication", percentage: 46 },
    { skill: "Data Structures", percentage: 58 },
    { skill: "SQL & Databases", percentage: 63 },
    { skill: "Python", percentage: 78 },
  ];

  return (
    <main className="academician-page">

      {/* SIDEBAR */}
      <aside className="academician-sidebar">

        <div className="academician-logo">
          <span>Skill</span>
          <strong>Net</strong>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">AS</div>

          <div>
            <strong>Dr. Ananya Shah</strong>
            <span>Faculty / Academician</span>
          </div>
        </div>

        <nav className="academician-nav">

          <button className="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => router.push("/academician/students")}
          >
            <span>♙</span>
            Students
          </button>

          <button
            className="nav-item"
            onClick={() =>
              router.push("/academician/skill-analysis")
            }
          >
            <span>◈</span>
            Skill Analysis
          </button>

          <button
            className="nav-item"
            onClick={() =>
              router.push("/academician/opportunities")
            }
          >
            <span>◇</span>
            Opportunities
          </button>

          <button className="nav-item">
            <span>▣</span>
            Industry Connect
          </button>

          <button className="nav-item">
            <span>▤</span>
            Reports
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          <button
            className="nav-item logout"
            onClick={() => router.push("/login")}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <section className="academician-main">

        {/* HEADER */}
        <header className="academician-header">

          <div>
            <span className="page-eyebrow">
              ACADEMICIAN PORTAL
            </span>

            <h1>
              Good morning, Dr. Shah.
            </h1>

            <p>
              Monitor student skills, identify gaps, and
              strengthen industry readiness.
            </p>
          </div>

          <div className="header-actions">

            <button className="notification-button">
              ◌
            </button>

            <button
              className="header-profile"
              onClick={() => router.push("/academician")}
            >
              <div className="header-avatar">AS</div>

              <div>
                <strong>Dr. Ananya Shah</strong>
                <span>Computer Engineering</span>
              </div>
            </button>

          </div>

        </header>

        {/* STAT CARDS */}
        <section className="stat-grid">

          <article className="stat-card">

            <div className="stat-icon">
              ♙
            </div>

            <div>
              <span>Total Students</span>
              <strong>248</strong>
              <small>↑ 12 this semester</small>
            </div>

          </article>

          <article className="stat-card">

            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>Students Assessed</span>
              <strong>186</strong>
              <small>75% assessment coverage</small>
            </div>

          </article>

          <article className="stat-card">

            <div className="stat-icon">
              ◎
            </div>

            <div>
              <span>Industry Ready</span>
              <strong>72</strong>
              <small>29% of total students</small>
            </div>

          </article>

          <article className="stat-card warning-card">

            <div className="stat-icon">
              !
            </div>

            <div>
              <span>Students With Gaps</span>
              <strong>63</strong>
              <small>Needs intervention</small>
            </div>

          </article>

        </section>

        {/* MAIN GRID */}
        <section className="dashboard-grid">

          {/* STUDENT READINESS */}
          <article className="dashboard-card readiness-card">

            <div className="card-header">

              <div>
                <span className="card-label">
                  STUDENT OVERVIEW
                </span>

                <h2>
                  Industry readiness
                </h2>

                <p>
                  Current readiness across your students.
                </p>
              </div>

              <button className="text-button">
                View all →
              </button>

            </div>

            <div className="readiness-chart">

              <div className="chart-bars">

                <div className="bar-group">
                  <div
                    className="chart-bar"
                    style={{ height: "72%" }}
                  />
                  <span>Ready</span>
                </div>

                <div className="bar-group">
                  <div
                    className="chart-bar"
                    style={{ height: "51%" }}
                  />
                  <span>Developing</span>
                </div>

                <div className="bar-group">
                  <div
                    className="chart-bar"
                    style={{ height: "31%" }}
                  />
                  <span>Skill Gap</span>
                </div>

              </div>

            </div>

            <div className="readiness-summary">

              <div>
                <strong>72</strong>
                <span>Industry Ready</span>
              </div>

              <div>
                <strong>113</strong>
                <span>Developing</span>
              </div>

              <div>
                <strong>63</strong>
                <span>Needs Support</span>
              </div>

            </div>

          </article>

          {/* SKILL GAPS */}
          <article className="dashboard-card">

            <div className="card-header">

              <div>
                <span className="card-label">
                  SKILL INTELLIGENCE
                </span>

                <h2>
                  Common skill gaps
                </h2>

                <p>
                  Skills requiring the most attention.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  router.push(
                    "/academician/skill-analysis"
                  )
                }
              >
                →
              </button>

            </div>

            <div className="skill-gap-list">

              {skillGaps.map((item) => (

                <div
                  className="skill-gap-item"
                  key={item.skill}
                >

                  <div className="skill-gap-top">

                    <strong>
                      {item.skill}
                    </strong>

                    <span>
                      {item.percentage}%
                    </span>

                  </div>

                  <div className="skill-gap-track">

                    <div
                      className="skill-gap-fill"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </article>

        </section>

        {/* STUDENT TABLE */}
        <section className="dashboard-card students-card">

          <div className="card-header">

            <div>
              <span className="card-label">
                RECENT STUDENT ACTIVITY
              </span>

              <h2>
                Student skill overview
              </h2>

              <p>
                Monitor assessment progress and readiness.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                router.push("/academician/students")
              }
            >
              Manage students →
            </button>

          </div>

          <div className="student-table-wrapper">

            <table className="student-table">

              <thead>

                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Readiness</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {students.map((student) => (

                  <tr key={student.name}>

                    <td>
                      <div className="student-name">

                        <div className="student-avatar">
                          {student.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </div>

                        <strong>
                          {student.name}
                        </strong>

                      </div>
                    </td>

                    <td>
                      {student.course}
                    </td>

                    <td>
                      {student.year}
                    </td>

                    <td>

                      <div className="readiness-cell">

                        <div className="mini-progress">

                          <div
                            style={{
                              width: `${student.readiness}%`,
                            }}
                          />

                        </div>

                        <span>
                          {student.readiness}%
                        </span>

                      </div>

                    </td>

                    <td>

                      <span
                        className={`status-badge ${
                          student.status ===
                          "Industry Ready"
                            ? "ready"
                            : student.status ===
                              "Needs Development"
                            ? "developing"
                            : "gap"
                        }`}
                      >
                        {student.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* BOTTOM CARDS */}
        <section className="bottom-grid">

          <article className="action-card">

            <div className="action-icon">
              ◈
            </div>

            <div>
              <span>SKILL MAPPING</span>

              <h3>
                Analyze your students' skill gaps
              </h3>

              <p>
                Compare student capabilities with
                industry-demanded skills.
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/academician/skill-analysis"
                )
              }
            >
              Explore →
            </button>

          </article>

          <article className="action-card">

            <div className="action-icon">
              ◇
            </div>

            <div>
              <span>INDUSTRY COLLABORATION</span>

              <h3>
                Connect students with opportunities
              </h3>

              <p>
                Discover internships, projects,
                training and academic collaborations.
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/academician/opportunities"
                )
              }
            >
              Explore →
            </button>

          </article>

        </section>

      </section>

    </main>
  );
}
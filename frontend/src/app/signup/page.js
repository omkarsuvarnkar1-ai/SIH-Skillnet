"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const form = event.target;

    const data = {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value,
      college: form.college.value.trim(),
      course: form.course.value.trim(),
      year_of_study: Number(form.year_of_study.value),
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Account created successfully! Logging you in...");

        try {
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          });

          if (loginRes.ok) {
            setTimeout(() => {
              router.push("/profile");
            }, 800);
            return;
          }
        } catch (e) {
          console.error("Auto-login error:", e);
        }

        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-hero-grid" />
      <div className="signup-glow signup-glow-one" />
      <div className="signup-glow signup-glow-two" />

      <header className="signup-header">
        <Link href="/" className="signup-logo">
          Skill<span>Net</span>
        </Link>

        <Link href="/" className="signup-home-btn">
          <ArrowLeft size={18} strokeWidth={2} />
          Back to SkillNet
        </Link>
      </header>

      <section className="signup-shell">
        <div className="signup-copy">
          <div className="signup-eyebrow">
            <Sparkles size={14} strokeWidth={2.2} />
            Welcome to SkillNet
          </div>

          <h1>
            Your skills.
            <br />
            <span>Your journey.</span>
            <br />
            <em>Your future.</em>
          </h1>

          <p>
            Create your profile to unlock a world of learning opportunities,
            career guidance, and industry connections.
          </p>

          <div className="signup-benefits">
            <div className="signup-benefit"><span className="signup-benefit-icon is-violet"><GraduationCap size={23} /></span><span><strong>Personalized Learning Paths</strong>AI-powered roadmap made for you</span></div>
            <div className="signup-benefit"><span className="signup-benefit-icon is-blue"><BriefcaseBusiness size={22} /></span><span><strong>Industry Connections</strong>Connect with top recruiters</span></div>
            <div className="signup-benefit"><span className="signup-benefit-icon is-teal"><UsersRound size={22} /></span><span><strong>Skill Verification</strong>Showcase your real-world skills</span></div>
          </div>

        </div>

        <div className="signup-card">
          <div className="signup-card-heading">
            <h2>Create your SkillNet account</h2>
            <p>Begin your journey toward an industry-ready future.</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-field">
              <label htmlFor="full_name">Full Name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                minLength={8}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="college">College / Institution</label>
              <input
                id="college"
                name="college"
                type="text"
                placeholder="Enter your college name"
                required
              />
            </div>

            <div className="signup-row">
              <div className="signup-field">
                <label htmlFor="course">Course</label>
                <input
                  id="course"
                  name="course"
                  type="text"
                  placeholder="e.g. AI & Data Science"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="year_of_study">Year of Study</label>
                <select
                  id="year_of_study"
                  name="year_of_study"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select your year
                  </option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <label className="signup-terms">
              <input type="checkbox" id="terms" required />
              <span className="signup-check" />
              <span>I agree to the SkillNet terms and conditions.</span>
            </label>

            {message && <div className="signup-message">{message}</div>}

            <button type="submit" disabled={loading} className="signup-submit">
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              {!loading && <ArrowRight size={20} strokeWidth={2.2} />}
            </button>
          </form>

          <p className="signup-signin">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
          <p className="signup-security"><ShieldCheck size={17} /> Your data is protected with enterprise-grade security</p>
        </div>
      </section>
    </main>
  );
}
